import { useGameContext } from "./game-context-provider";
import { useAsset } from "@/app/hooks/use-asset";
import { Plus, User } from "lucide-react";
import { Character } from "@/types";

export default function GameStartScreen({
  onStart,
  starting,
}: {
  onStart?: () => void;
  starting?: boolean;
}) {
  const { characters, triggerCharacterForm } = useGameContext();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center gap-8">
      {/* Character Grid */}
      {characters.length > 0 && (
        <div className="flex gap-4 items-center justify-center flex-wrap">
          {characters.map((character) => (
            <CharacterBadge key={character.id} character={character} />
          ))}
          <button
            onClick={() => triggerCharacterForm()}
            className="cursor-pointer flex flex-col b items-center gap-2 p-3 border border-dashed border-primary/90  w-30 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
          >
            {/* Character Photo */}
            <div className="avatar">
              <div className="w-16 h-16 rounded-full ring ring-primary ">
                <div className="w-full h-full flex items-center justify-center ">
                  <Plus size={32} className="opacity-50" />
                </div>
              </div>
            </div>

            {/* Character Name */}
            <div className="text-sm font-semibold text-center line-clamp-2 w-full px-1 truncate">
              Add Player
            </div>
          </button>
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <button
          className="btn btn-primary btn-lg"
          disabled={starting}
          onClick={onStart}
        >
          Start game {starting && <div className="loading loading-sm"></div>}
        </button>
      </div>
    </div>
  );
}

function CharacterBadge({ character }: { character: Character }) {
  const { data: photoAsset } = useAsset(character.photoAssetId);

  return (
    <div className="flex flex-col items-center gap-2 p-3 border-primary/30 border w-30 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
      {/* Character Photo */}
      <div className="avatar">
        <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
          {photoAsset?.secureUrl ? (
            <img
              src={photoAsset.secureUrl}
              alt={character.name}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              <User size={32} className="opacity-50" />
            </div>
          )}
        </div>
      </div>

      {/* Character Name */}
      <div className="text-sm font-semibold text-center line-clamp-2 w-full px-1 truncate">
        {character.name}
      </div>
    </div>
  );
}
