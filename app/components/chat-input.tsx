"use client";

import { Keyboard, Mic, Send, X } from "lucide-react";
import { useState } from "react";
import VadListener from "./vad-listener";
import { transcribe } from "../use-deeepgram";

interface ChatInputProps {
  gameId: string;
  onSendMessage: (text: string) => void;
}

export default function ChatInput({ gameId, onSendMessage }: ChatInputProps) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [promptFormMode, setPromptFormMode] = useState<"text" | "voice" | null>(
    null,
  );

  const sendText = (text: string) => {
    onSendMessage(text);
    setText("");
  };

  const resetMode = () => {
    setPromptFormMode(null);
    setListening(false);
    setSpeaking(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendText(text);
    resetMode();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-base-200 shadow-xl border-t border-base-300">
      {promptFormMode === null && (
        <div className="flex justify-center gap-2 items-center">
          <button
            className={`btn ${listening ? "btn-success" : "btn-primary"}`}
            type="button"
            onClick={() => {
              setPromptFormMode("voice");
              setListening(true);
            }}
          >
            <Mic size={20} />
            Talk
          </button>
          <button
            className={`btn ${listening ? "btn-success" : "btn-primary"}`}
            type="button"
            onClick={() => {
              setPromptFormMode("text");
            }}
          >
            <Keyboard size={20} />
            Type
          </button>
          {text && (
            <button
              className="btn btn-error"
              type="button"
              onClick={() => setText("")}
            >
              <X size={20} />
              Reset
            </button>
          )}
        </div>
      )}
      {promptFormMode === "voice" && (
        <div className="max-w-5xl mx-auto">
          {listening && (
            <VadListener
              autoStart={true}
              onSpeechStart={() => {
                setSpeaking(true);
              }}
              onSpeechEnd={async (segment) => {
                const tts = await transcribe(segment, gameId);
                if (tts) setText((prev) => prev + " " + tts);
                setSpeaking(false);
              }}
            />
          )}
          <div className="flex  gap-4 relative">
            <div className="flex-1">
              {text} {speaking ? "..." : null}
            </div>
            <button
              disabled={text.trim().length === 0}
              className="btn btn-primary"
              type="button"
              onClick={() => {
                sendText(text);
                resetMode();
              }}
            >
              <Send size={20} />
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => resetMode()}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
      {promptFormMode === "text" && (
        <form onSubmit={handleSubmit} className=" ">
          <div className="flex items-center gap-4 relative">
            <textarea
              onChange={(e) => setText(e.currentTarget.value)}
              value={text}
              rows={1}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.metaKey &&
                  !e.ctrlKey
                ) {
                  e.preventDefault();
                  sendText(text);
                  resetMode();
                } else if (
                  e.key === "Enter" &&
                  (e.shiftKey || e.metaKey || e.ctrlKey)
                ) {
                  // Allow default behavior (add new line)
                }
              }}
              placeholder="Type your action..."
              className="input  flex-1  resize-none"
            />

            <button
              disabled={text.trim().length === 0}
              type="submit"
              className="btn btn-primary  "
            >
              <Send size={20} />
            </button>
            <button
              type="button"
              className="btn btn-secondary  "
              onClick={() => resetMode()}
            >
              <X size={20} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
