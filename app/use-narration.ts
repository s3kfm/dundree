import { UIMessage } from "ai";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useStreamingBuffer } from "./hooks/use-text-buffer";
import { extractCodeblocks } from "./utils/codeblocks";
import { useChatOnChunk } from "use-chat-on-chunk";
import { v4 } from "uuid";

function stripMarkdown(text: string): string {
  let cleanText = text;

  // Remove links: [text](url) -> text
  cleanText = cleanText.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");

  // Remove bold/italic: **text**, __text__, *text*, _text_
  cleanText = cleanText.replace(/(\*\*|__)(.*?)\1/g, "$2");
  cleanText = cleanText.replace(/(\*|_)(.*?)\1/g, "$2");

  // Remove headers: # Header -> Header
  cleanText = cleanText.replace(/^#+\s+(.*)$/gm, "$1");

  // Remove inline code: `code` -> code
  cleanText = cleanText.replace(/`([^`]+)`/g, "$1");

  // Remove blockquotes and list markers
  cleanText = cleanText.replace(/^\s*>\s+/gm, "");
  cleanText = cleanText.replace(/^\s*[\*\+-]\s+/gm, "");
  cleanText = cleanText.replace(/^\s*\d+\.\s+/gm, "");

  return cleanText.trim();
}
interface NarrationQueueItem {
  text: string;
  voice: string;
  id: string;
  blobUrl?: string; // Prepared MP3 URL
  isPreloading?: boolean;
}

interface UseNarrationProps {
  gameId: string | number;
  chatStatus: string;
  messages: UIMessage[];
  token: string | null;
}

export function useNarration({
  chatStatus,
  messages,
  token,
}: UseNarrationProps) {
  const [narratingId, setNarratingId] = useState<string | null>(null);
  const [narrationQueue, setNarrationQueue] = useState<NarrationQueueItem[]>(
    [],
  );
  const [narrationEnabled, setNarrationEnabled] = useState(false);

  const tokenRefCurrent = useRef(token);
  useEffect(() => {
    tokenRefCurrent.current = token;
  }, [token]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isPlayingRef = useRef(false);

  const narratingMessage = useMemo(() => {
    return messages.find((val) => val.id === narratingId);
  }, [narratingId, messages]);

  const getVoiceResponse = async (voice: string, text: string) => {
    return fetch(
      `https://api.deepgram.com/v1/speak?model=${voice}&encoding=mp3`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenRefCurrent.current}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: stripMarkdown(text) }),
      },
    );
  };

  // 1. Setup Streaming Buffer (Input)
  const { push, end } = useStreamingBuffer({
    bufferModes: ["line", "period", "codeblock"],
    onFlush: (ev) => {
      if (ev.mode === "period" || ev.mode === "line" || ev.mode === "final") {
        const text = ev.text.trim();
        if (text.length > 0) {
          setNarrationQueue((queue) => [
            ...queue,
            { text, voice: "default", id: v4() },
          ]);
        }
      }
      if (ev.mode === "codeblock") {
        const codeblocks = extractCodeblocks(ev.text);
        for (const codeblock of codeblocks) {
          if (codeblock.language === "dialog") {
            try {
              const json = JSON.parse(codeblock.code);
              if (json) {
                setNarrationQueue((queue) => [
                  ...queue,
                  //  { text: json.prompt, voice: "default", id: v4() },
                  {
                    text: json.text,
                    voice: json.voice_id || "default",
                    id: v4(),
                  },
                ]);
              }
            } catch (e) {
              console.error("Failed to parse dialog JSON", e);
            }
          }
        }
      }
    },
  });

  // 2. Chat Chunker Integration
  useEffect(() => {
    if (chatStatus !== "streaming") end();
  }, [chatStatus, end]);

  useChatOnChunk({
    message: narratingMessage,
    onChunk: (chunk) => {
      console.log(chunk);
      if (narratingId) push(chunk);
    },
  });

  // 3. Initialize Audio Element
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  const topItem = useMemo(() => narrationQueue[0], [narrationQueue]);

  useEffect(() => {
    if (!topItem && chatStatus !== "streaming") {
      setTimeout(() => setNarratingId(null));
    }
  }, [topItem, chatStatus]);
  const nextUnPreloadedItem = useMemo(
    () =>
      !narrationQueue.find((item) => item.isPreloading) &&
      narrationQueue.filter((item) => !item.isPreloading && !item.blobUrl)[0],
    [narrationQueue],
  );

  useEffect(() => {
    const preload = async () => {
      if (!nextUnPreloadedItem) {
        return;
      }
      setNarrationQueue((queue) => {
        return queue.map((item) => {
          if (item.id === nextUnPreloadedItem.id)
            return { ...nextUnPreloadedItem, isPreloading: true };
          return item;
        });
      });
      const voice =
        nextUnPreloadedItem.voice === "default"
          ? "aura-2-thalia-en"
          : nextUnPreloadedItem.voice;

      const response = await getVoiceResponse(voice, nextUnPreloadedItem.text);
      if (!response.ok) throw new Error("Deepgram fetch failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setNarrationQueue((queue) => {
        return queue.map((item) => {
          if (item.id === nextUnPreloadedItem.id)
            return {
              ...nextUnPreloadedItem,
              isPreloading: false,
              blobUrl: url,
            };
          return item;
        });
      });
    };
    preload();
  }, [nextUnPreloadedItem]);

  useEffect(() => {
    const advanceQueue = () => {
      setNarrationQueue((queue) => queue.slice(1));
    };
    const playTopItem = async () => {
      if (topItem) {
        if (topItem.isPreloading) {
        } else if (topItem.blobUrl) {
          audioRef.current!.src = topItem.blobUrl;

          audioRef.current!.play();
          audioRef.current!.onended = advanceQueue;
        } else {
          const voice =
            topItem.voice === "default" ? "aura-2-thalia-en" : topItem.voice;
          const response = await getVoiceResponse(voice, topItem.text);
          if (!response.ok) throw new Error("Deepgram fetch failed");

          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          audioRef.current!.src = url;

          audioRef.current!.play();
          audioRef.current!.onended = advanceQueue;
        }
      }
    };

    playTopItem();
  }, [topItem]);

  // 6. Controls
  const stopNarration = useCallback(() => {
    setNarratingId(null);

    // Cleanup all existing blobs in the queue
    narrationQueue.forEach((item) => {
      if (item.blobUrl) URL.revokeObjectURL(item.blobUrl);
    });
    setNarrationQueue([]);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    isPlayingRef.current = false;
  }, [narrationQueue]);

  const narrate = useCallback(
    async (id: string) => {
      if (narratingId === id) {
        stopNarration();
        return;
      }
      stopNarration(); // Clear existing before starting new
      setNarratingId(id);
    },
    [narratingId, stopNarration],
  );

  return {
    narratingId,
    narrationEnabled,
    setNarrationEnabled,
    narrate,
    narrationQueue,
    stopNarration,
  };
}
