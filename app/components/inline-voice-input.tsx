"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useDeepgramFlux } from "use-deepgram";

interface InlineVoiceInputProps {
  token: string;
  onSend: (transcript: string) => void;
  onCancel: () => void;
}

export default function InlineVoiceInput({
  token,
  onSend,
  onCancel,
}: InlineVoiceInputProps) {
  const { interimTranscript, connected, errored, listening, error } =
    useDeepgramFlux({
      onError: () => { },
      token,
      onTurnEnd: async (transcript) => {
        const audio = new Audio("/sounds/speech-end.mp3");
        await audio.play();
        if (transcript.trim()) onSend(transcript.trim());
      },
    });

  const handleSend = () => {
    // const fullTranscript = transcript.trim();
    // if (fullTranscript) {
    //   onSend(fullTranscript);
    // }
  };

  const handleCancel = () => {
    onCancel();
  };

  // Auto-scroll to bottom as text populates
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [interimTranscript]);

  useEffect(() => {
    if (listening) {
      const audio = new Audio("/sounds/speech-start.mp3");
      audio.play();
    }
  }, [listening]);
  const getDisplayText = () => {
    return interimTranscript;
  };

  return (
    <div className="flex items-center gap-3 flex-1">
      {/* Status indicator */}
      {listening && (
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
        </span>
      )}

      {/* Transcript display */}
      <div
        ref={scrollRef}
        className="flex-1 min-w-0 px-3 py-2 bg-base-100 rounded-lg border border-base-300 h-10 overflow-y-auto"
      >
        {error ? (
          <span className="text-error text-sm">{error.message}</span>
        ) : (
          <span className="text-sm whitespace-pre-wrap break-words">
            <span className="text-base-content">{getDisplayText()}</span>
            {interimTranscript && (
              <span className="text-primary italic animate-pulse"> ●</span>
            )}
          </span>
        )}
      </div>

      {/* Action buttons */}
      {/* <button
        type="button"
        onClick={handleSend}
        disabled={!transcript.trim() || !isListening}
        className="btn btn-primary btn-sm"
      >
        <Send size={16} />
        Send
      </button> */}
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={handleCancel}
      >
        <X size={16} />
        Cancel
      </button>
    </div>
  );
}
