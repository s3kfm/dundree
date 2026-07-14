"use client";

import { Game, GameWithDetails } from "@/types";
import { MoreVertical } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useAsset } from "../hooks/use-asset";
import CharacterAvatar from "../components/character-avatar";

interface GameCardProps {
  game: GameWithDetails;
}

export default function GameCard({ game }: GameCardProps) {
  const { user } = useUser();
  const isCreator = game.userId === user?.id;

  const asset = useAsset(game.pictureAssetId);
  return (
    <div className="campaign-card group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={asset?.data?.secureUrl ?? "/bonfire.png"}
          alt={game.name || "Campaign"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <span
            className={`campaign-badge ${
              isCreator ? "campaign-badge-created" : "campaign-badge-joined"
            }`}
          >
            {isCreator ? "Created" : "Joined"}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-base-200 to-transparent opacity-60"></div>
      </div>
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="campaign-title">{game.name || "Untitled Campaign"}</h3>
          <button className="btn btn-ghost btn-xs btn-circle">
            <MoreVertical className="w-4 h-4 text-base-content/50" />
          </button>
        </div>
        <p className="campaign-description">
          {game.summary || game.setting || "No description available"}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex -space-x-2">
            {game.characters?.map((char) => (
              <CharacterAvatar key={char.id} character={char} size="sm" />
            ))}
          </div>
          <span className="text-[10px] font-label text-base-content/50 uppercase tracking-wider">
            {game.status || "waiting"}
          </span>
        </div>
      </div>
      <Link href={`/games/${game.id}`} className="campaign-button ">
        Continue
      </Link>
    </div>
  );
}
