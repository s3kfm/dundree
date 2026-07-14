"use client";

import { Users, Settings, Home } from "lucide-react";
import { useGameContext } from "@/app/components/game-context-provider";

export default function GameActionBar() {
  const { activeView, setActiveView } = useGameContext();

  return (
    <>
      <div className="sticky top-0">
        {/* Desktop: Horizontal icon bar with labels */}
        <div className="flex bg-base-100 border-b border-primary/20 shadow-sm px-4 py-2 gap-2 items-center">
          {/* Adventure/Home */}
          <button
            className={`btn btn-sm gap-2 ${
              activeView === "adventure" ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => setActiveView("adventure")}
          >
            <Home size={18} />
            <span>Adventure</span>
          </button>

          {/* Party */}
          <button
            className={`btn btn-sm gap-2 ${
              activeView === "party" ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => setActiveView("party")}
          >
            <Users size={18} />
            <span>Party</span>
          </button>

          {/* Settings */}
          <button
            className={`btn btn-sm gap-2 ${
              activeView === "settings" ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => setActiveView("settings")}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Mobile: Bottom navigation bar */}
    </>
  );
}
