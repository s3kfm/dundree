"use client";

import { Users, UserPlus } from "lucide-react";
import { useGameContext } from "@/app/components/game-context-provider";

export default function CharacterEmptyScreen() {
  const { triggerCharacterForm } = useGameContext();

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
      {/* Background Atmosphere Element */}

      {/* Empty State Artifact */}
      <div className="w-full max-w-lg flex flex-col items-center justify-center p-12 relative ">
        <div className="  flex flex-col items-center justify-center p-8 text-center">
          <div className="relative mb-6">
            <Users size={96} className="text-base-content/20" />
          </div>
          <h2 className="font-bold font-headline text-xl text-base-content mb-2  tracking-tight">
            Add Players
          </h2>
          <p className="text-sm text-base-content/70 leading-relaxed">
            No players have been added yet. Add at least one player to start the
            scenario.
          </p>
        </div>

        {/* CTA Area */}
        <div className="w-full flex flex-col items-center gap-6">
          <button
            onClick={() => triggerCharacterForm()}
            className="btn btn-primary"
          >
            <UserPlus size={24} className="font-bold" />
            <span>Add Character</span>
          </button>
        </div>
      </div>

      {/* Lore Bits (Decorative Layout) */}
    </div>
  );
}
