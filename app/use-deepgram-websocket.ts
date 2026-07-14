"use client";
import { useState, useRef, useCallback, useEffect } from "react";

interface DeepgramSttOptions {
  // Now accepts a function that returns a Promise<string>
  getGrantToken: () => Promise<string | null | undefined>;
  model?: string;
  interimResults?: boolean;
  punctuate?: boolean;
  smartFormatting?: boolean;
  diarize?: boolean;
  timeSliceMs?: number;
  enabled: boolean;
  endpointing: false | number;
}

export const useDeepgramStt = ({
  getGrantToken,
  model = "nova-3",
  interimResults = true,
  punctuate = true,
  smartFormatting = true,
  diarize = false,
  timeSliceMs = 250,
  enabled = true,
  endpointing = false,
}: DeepgramSttOptions) => {
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isConnecting = useRef(false);
  const stopListening = useCallback(() => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    socketRef.current?.close();

    socketRef.current = null;

    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const startListening = useCallback(async () => {
    try {
      if (isConnecting.current || socketRef.current) return;
      isConnecting.current = true;
      // 1. Get a fresh token right when we need it
      const token = await getGrantToken();
      if (!token) {
        throw new Error("Failed to acquire transcription token.");
      }

      // 2. Request mic access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const params = new URLSearchParams({
        model,
        punctuate: String(punctuate),
        interim_results: String(interimResults),
        smart_format: String(smartFormatting),
        diarize: String(diarize),
        ...(endpointing ? { endpointing: String(endpointing) } : {}),
      });

      const socket = new WebSocket(
        `wss://api.deepgram.com/v1/listen?${params.toString()}`,
        ["bearer", token],
      );

      socket.onopen = () => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        });

        mediaRecorder.start(timeSliceMs);
        setIsListening(true);
      };

      socket.onmessage = (message) => {
        const received = JSON.parse(message.data);
        console.log(received.type);
        if (received.type !== "Results") return;

        const result = received.channel.alternatives[0]?.transcript;
        if (!result) return;

        console.log(received);
        if (received.is_final) {
          setTranscript((prev) => prev + " " + result);
          setInterimTranscript("");
        } else {
          setInterimTranscript(result);
        }
      };

      socket.onerror = (err) => {
        console.error("Deepgram Socket Error:", err);
        setError("Connection lost.");
        stopListening();
      };

      socket.onclose = () => setIsListening(false);
      socketRef.current = socket;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start listening.";
      setError(errorMessage);
      console.error(err);
      setIsListening(false);
    }
  }, [
    getGrantToken,
    model,
    interimResults,
    punctuate,
    smartFormatting,
    diarize,
    timeSliceMs,
    stopListening,
  ]);

  const clearTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
  };

  useEffect(() => {
    if (enabled) {
      startListening();
    }
    // Cleanup function runs on unmount or before re-running effect
    return () => {
      stopListening();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return {
    transcript,
    interimTranscript,
    isListening,
    error,
    startListening,
    stopListening,
    clearTranscript,
  };
};
