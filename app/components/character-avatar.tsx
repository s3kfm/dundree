"use client";

import { Character } from "@/types";
import { useAsset } from "../hooks/use-asset";
import { User } from "lucide-react";

interface CharacterAvatarProps {
  character: Character;
  size?: "sm" | "md" | "lg";
}

export default function CharacterAvatar({
  character,
  size = "sm",
}: CharacterAvatarProps) {
  const asset = useAsset(character.photoAssetId);

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
  };

  console.log(character);
  return (
    <div className="avatar placeholder border-2 border-base-200 rounded-full">
      <div
        className={`bg-base-300 text-base-content ${sizeClasses[size]} rounded-full flex items-center justify-center overflow-hidden ring ring-primary/50`}
      >
        {asset?.data?.secureUrl ? (
          <img
            src={asset.data.secureUrl}
            alt={character.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className={`${textSizeClasses[size]} font-semibold`}>
            <User className="size-4" />
          </span>
        )}
      </div>
    </div>
  );
}
