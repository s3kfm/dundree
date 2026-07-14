"use client";

import { UserPlus } from "lucide-react";
import { useGameContext } from "@/app/components/game-context-provider";
import { useDialog } from "rsuite";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import CharacterCard from "@/app/components/character-card";

export default function CharacterUI() {
  const { characters, triggerCharacterForm, game } = useGameContext();
  const dialog = useDialog();
  const queryClient = useQueryClient();

  console.log(game);
  // Delete character mutation
  const deleteCharacterMutation = useMutation({
    mutationFn: async (characterId: string) => {
      const response = await axios.delete(`/api/characters/${characterId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the characters query to refetch the list
      queryClient.invalidateQueries({
        queryKey: ["games", game.id, "characters"],
      });
    },
    onError: (error) => {
      console.error("Failed to delete character:", error);
    },
  });

  const handleDeleteCharacter = async (characterId: string) => {
    const confirmed = await dialog.confirm(
      "Are you sure you want to delete this character?",
      {
        okText: "Yes",
        cancelText: "No",
      },
    );

    if (confirmed) {
      deleteCharacterMutation.mutate(characterId);
    }
  };
  return (
    <div className="space-y-4">
      {/* Characters List */}
      {characters.length === 0 && (
        <div className="text-center text-sm opacity-60 py-8">
          No characters yet. Add one to get started!
        </div>
      )}

      {characters.map((char) => (
        <CharacterCard
          key={char.id}
          character={char}
          onEdit={triggerCharacterForm}
          onDelete={handleDeleteCharacter}
          isDeleting={deleteCharacterMutation.isPending}
        />
      ))}

      {/* Add Character Button */}
      <button
        onClick={() => triggerCharacterForm()}
        className="btn btn-primary w-full"
      >
        <UserPlus size={20} />
        <span>Add Character</span>
      </button>
    </div>
  );
}
