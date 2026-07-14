"use client";

import { useGameContext } from "@/app/components/game-context-provider";
import CharacterEmptyScreen from "./character-empty-screen";
import GameStartScreen from "./game-start-screen";
import MessageList from "./message-list";
import { FlowingConduitLoader } from "./ui/flowing-conduit-loader";
import { useMemo, useState } from "react";
import PlayerActions from "./player-actions";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Asset } from "@/types";
import { LucideCheck } from "lucide-react";

export default function ChatRegion() {
  const {
    game,
    characters,
    narrationQueue,

    chat: { sendMessage, status, messages },
  } = useGameContext();

  const [showDebugQueue, setShowDebugQueue] = useState(false);

  const handleSendMessage = (text: string) => {
    sendMessage({ role: "user", parts: [{ type: "text", text }] });
  };

  // Get messages without the first system message
  const displayMessages = useMemo(() => {
    return messages.slice(1);
  }, [messages]);

  // Fetch scenario image if available
  const { data: scenarioImage } = useQuery<Asset | null>({
    queryKey: ["scenarios", game.scenarioId, "image"],
    queryFn: async () => {
      if (!game.scenarioId) return null;
      try {
        const scenarioResponse = await axios.get(
          `/api/scenarios/${game.scenarioId}`,
        );
        const scenario = scenarioResponse.data;
        if (!scenario.pictureAssetId) return null;

        const assetResponse = await axios.get(
          `/api/assets/${scenario.pictureAssetId}`,
        );
        return assetResponse.data;
      } catch (error) {
        console.error("Error fetching scenario image:", error);
        return null;
      }
    },
    enabled: !!game.scenarioId,
  });

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-base-300 relative">
      {/* Full-screen background image with opacity and blur */}
      {displayMessages.length > 0 && scenarioImage && (
        <div className="absolute inset-0 pointer-events-none ">
          <img
            alt="Scenario Atmosphere"
            className="w-full h-full object-cover "
            src={scenarioImage.secureUrl || ""}
          />
        </div>
      )}

      {displayMessages.length > 0 && scenarioImage && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-80 bg-base-300"></div>
      )}

      {/* Narrative / Interaction Log - Takes full screen, scrollable */}
      <div className="relative ">
        {characters.length === 0 ? <CharacterEmptyScreen /> : <></>}
        {displayMessages.length === 0 && characters.length > 0 && (
          <GameStartScreen
            starting={status === "streaming" || status === "submitted"}
            onStart={() => {
              handleSendMessage(">>>START");
            }}
          />
        )}

        {/* {game.status === "waiting" && characters.length > 0 && <GamePlayScreen />} */}
        {displayMessages.length > 0 && (
          <MessageList messages={displayMessages} />
        )}
        {status === "streaming" || status === "submitted" ? (
          <FlowingConduitLoader />
        ) : null}
      </div>

      {/* Debug Section */}
      {process.env.NEXT_PUBLIC_ENVIRONMENT === "development" && (
        <div className="p-3 flex gap-3 border-t border-base-100 relative z-10">
          <span className="text-sm">Debug:</span>
          <button
            className="btn btn-info btn-sm"
            onClick={() => setShowDebugQueue(!showDebugQueue)}
          >
            Narration Queue ({narrationQueue.length})
          </button>
        </div>
      )}

      {/* Debug Narration Queue - Inline scrollable box */}
      {showDebugQueue && narrationQueue.length > 0 && (
        <div className="px-3 pb-3 relative z-10">
          <div className="bg-base-100 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
            {narrationQueue.map((item, index) => (
              <div
                key={index}
                className="bg-base-200 rounded p-2 text-xs font-mono"
              >
                <div className="flex gap-2 mb-1">
                  <span className="badge badge-sm badge-primary">
                    #{index + 1}
                  </span>
                  <span className="badge badge-sm badge-secondary">
                    {item.voice}
                  </span>
                </div>
                <div className="text-base-content/80 break-words">
                  {item.text}
                </div>
                <div className="text-base-content/80 break-words">
                  {item.isPreloading ? (
                    <div className="loading loading-sm"></div>
                  ) : (
                    ""
                  )}
                </div>
                <div className="text-base-content/80 break-words">
                  {item.blobUrl ? <LucideCheck className="size-4" /> : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="h-20"></div>
      <div className="relative z-10">
        <PlayerActions />
      </div>
      {/* Input Region - Floating at bottom */}
      {/* <ChatInput gameId={game.id} onSendMessage={handleSendMessage} /> */}
    </div>
  );
}
