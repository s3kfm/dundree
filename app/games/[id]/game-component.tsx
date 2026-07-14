"use client";

import { ArrowLeft, Volume2 } from "lucide-react";
import { Game, GameMessage, GameWithDetails } from "@/types";
import {
  GameContextProvider,
  useGameContext,
} from "@/app/components/game-context-provider";
import ChatRegion from "@/app/components/chat-region";
import GameActionBar from "@/app/components/game-action-bar";
import CharacterUI from "@/app/components/character-ui";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

interface GameComponentProps {
  game: GameWithDetails;
  messages: GameMessage[];
}

// Adventure Panel Component
function AdventurePanel() {
  return <ChatRegion />;
}

// Party Panel Component
function PartyPanel() {
  return (
    <div className="h-full overflow-y-auto p-4">
      <CharacterUI />
    </div>
  );
}

// Settings Panel Component
function SettingsPanel() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center text-sm opacity-60 py-8">
        Settings panel - Coming soon
      </div>
    </div>
  );
}

function GameContent() {
  const { game, narrationEnabled, setNarrationEnabled, activeView } =
    useGameContext();

  return (
    <div className="bg-base-300 text-base-content flex flex-col h-screen">
      {/* Header with game name */}
      <header className="  sticky top-0 bg-base-100 border-b border-base-300 shadow-xl flex-none z-2">
        <div className="navbar">
          <div className="flex md:flex-row md:items-center md:justify-between w-full gap-3 ellipsis">
            <div className="flex gap-2 items-center">
              <Link href="/games" className="btn btn-ghost btn-sm transition">
                <ArrowLeft />
              </Link>
              <h1 className="text-lg text-primary font-label uppercase font-bold">
                {game.name}
              </h1>
            </div>
            <div className="flex justify-end md:justify-between gap-2">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={narrationEnabled}
                onChange={() => {
                  setNarrationEnabled((val) => !val);
                }}
              />
              <Volume2
                className={`${narrationEnabled ? "text-primary" : ""}`}
              />
            </div>
          </div>
        </div>
        <GameActionBar />
      </header>

      {/* Navigation */}

      {/* Main content area - renders based on active view */}
      <main className="flex-1 overflow-hidden ">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeView}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full h-full"
          >
            {activeView === "adventure" && <AdventurePanel />}
            {activeView === "party" && <PartyPanel />}
            {activeView === "settings" && <SettingsPanel />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function GameComponent({ game, messages }: GameComponentProps) {
  return (
    <GameContextProvider messages={messages} game={game}>
      <GameContent />
    </GameContextProvider>
  );
}
