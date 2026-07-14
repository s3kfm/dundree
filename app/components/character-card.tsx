"use client";

import React from "react";
import { Pencil, Trash, User } from "lucide-react";
import { Character } from "@/types";
import { useAsset } from "@/app/hooks/use-asset";

interface CharacterCardProps {
  character: Character;
  onEdit: (characterId: string) => void;
  onDelete: (characterId: string) => void;
  isDeleting?: boolean;
}

export default function CharacterCard({
  character,
  onEdit,
  onDelete,
  isDeleting = false,
}: CharacterCardProps) {
  const { data: photoAsset } = useAsset(character.photoAssetId);

  return (
    <div className="relative bg-base-200 border-2 border-base-content/20 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-102 overflow-hidden p-4">
      {/* Photo and Name - Inline */}
      <div className="flex items-center gap-3">
        {/* Rounded Photo */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-base-content/30 shadow-md bg-gradient-to-br from-primary/30 to-secondary/30 flex-shrink-0">
          {photoAsset?.secureUrl ? (
            <img
              src={photoAsset.secureUrl}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User size={24} className="opacity-40" />
            </div>
          )}
        </div>

        {/* Character Name */}
        <h3 className="text-lg font-bold tracking-wide flex-1">
          {character.name}
        </h3>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          className="btn btn-xs btn-circle btn-warning shadow-md hover:shadow-lg transition-shadow"
          onClick={() => onEdit(character.id)}
          title="Edit character"
        >
          <Pencil className="size-3" />
        </button>
        <button
          className="btn btn-xs btn-circle btn-error shadow-md hover:shadow-lg transition-shadow"
          onClick={() => onDelete(character.id)}
          disabled={isDeleting}
          title="Delete character"
        >
          <Trash className="size-3" />
        </button>
      </div>
    </div>
  );
}
