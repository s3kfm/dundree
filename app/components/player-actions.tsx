"use client";

import { useGameContext } from "@/app/components/game-context-provider";
import { Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import InlineVoiceInput from "./inline-voice-input";
import { DiceRoller } from "./diceroller";

export default function PlayerActions() {
  const { currentPlayer, currentResponseType, chat, deepgramToken } =
    useGameContext();
  const [mode, setMode] = useState<"text" | "speak" | null>(null);
  const [text, setText] = useState("");

  const [number, setNumber] = useState<number>();

  useEffect(() => {
    if (chat.status === "ready") {
      setTimeout(() => setNumber(undefined), 0);
    }
  }, [chat.status]);
  if (!currentPlayer) return null;

  const handleSendText = () => {
    if (!text.trim()) return;
    chat.sendMessage({
      role: "user",
      parts: [{ type: "text", text }],
    });
    setText("");
    //setMode(null);
  };

  const handleCancel = () => {
    setText("");
    setMode(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSendText();
  };

  return (
    <div className="sticky bottom-2 left-16  right-0  bg-base-200 border border-primary/80 p-4 shadow-lg max-w-7xl mx-auto rounded-xl ">
      {mode === null && (
        <div className="flex flex-col md:justify-between gap-2">
          <div className="text-sm md:text-lg font-semibold">
            {currentPlayer.name}&apos;s Turn
          </div>
          {currentResponseType === "text" && (
            <div className="flex gap-3">
              <button
                disabled={chat.status !== "ready"}
                className="btn btn-primary"
                onClick={() => setMode("speak")}
              >
                Speak
              </button>
              <button
                disabled={chat.status !== "ready"}
                className="btn btn-secondary"
                onClick={() => setMode("text")}
              >
                Text
              </button>
            </div>
          )}

          {currentResponseType === "dice" && (
            <>
              {" "}
              <div className="text-center">Roll the dice to continue</div>
              <DiceRoller
                value={number}
                onRollComplete={() => {
                  chat.sendMessage({
                    role: "user",
                    parts: [{ type: "text", text: "Rolled a " + number }],
                  });
                }}
              />
              <button
                className="btn btn-primary"
                disabled={chat.status !== "ready"}
                onClick={() => setNumber(Math.floor(Math.random() * 20) + 1)}
              >
                Roll Dice
              </button>
            </>
          )}
        </div>
      )}

      {mode === "text" && (
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="text-sm md:text-lg font-semibold md:whitespace-nowrap">
              {currentPlayer.name}&apos;s Turn
            </div>
            <div className="flex items-center gap-3 flex-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.currentTarget.value)}
                rows={1}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.metaKey &&
                    !e.ctrlKey
                  ) {
                    e.preventDefault();
                    handleSendText();
                  } else if (
                    e.key === "Enter" &&
                    (e.shiftKey || e.metaKey || e.ctrlKey)
                  ) {
                    // Allow default behavior (add new line)
                  }
                }}
                placeholder="Type your action..."
                className=" outline-none flex-1 resize-none border-t-none border-l-none border-r-none border-b border-b-primary"
                autoFocus
              />
              <button
                type="submit"
                disabled={text.trim().length === 0 || chat.status !== "ready"}
                className="btn btn-primary"
              >
                <Send size={20} />
                Send
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                <X size={20} />
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {mode === "speak" && deepgramToken && (
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="text-sm md:text-lg font-semibold md:whitespace-nowrap">
            {currentPlayer.name}&apos;s Turn
          </div>
          <InlineVoiceInput
            token={deepgramToken}
            onSend={(transcript) => {
              chat.sendMessage({
                role: "user",
                parts: [{ type: "text", text: transcript }],
              });
              setMode(null);
            }}
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  );
}
