"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { Game, Character, GameMessage, GameWithDetails } from "@/types";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { v4 } from "uuid";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "rsuite";
import CharacterForm from "./character-form";
import { useNarration } from "../use-narration";
import { extractCodeblocks } from "../utils/codeblocks";

type ActiveView = "adventure" | "party" | "settings";

interface GameContextType {
  game: Game;
  characters: Character[];
  showCharacterForm: boolean;
  setShowCharacterForm: React.Dispatch<React.SetStateAction<boolean>>;
  triggerCharacterForm: (id?: string) => void;
  narrationEnabled: boolean;
  currentResponseType: "text" | "dice";
  setNarrationEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  narratingId: string | null;
  narrate: (id: string) => Promise<void>;
  stopNarration: () => void;
  narrationQueue: Array<{
    text: string;
    voice: string;
    blobUrl?: string;
    isPreloading?: boolean;
  }>;
  chat: ReturnType<typeof useChat>;
  currentPlayerId: string | undefined;
  setCurrentPlayerId: React.Dispatch<React.SetStateAction<string | undefined>>;
  currentPlayer: Character | undefined;
  deepgramToken: string | null;
  activeView: ActiveView;
  setActiveView: React.Dispatch<React.SetStateAction<ActiveView>>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameContextProviderProps {
  game: GameWithDetails;
  messages: GameMessage[];
  children: ReactNode;
}

export function GameContextProvider({
  game: initialGame,
  messages,
  children,
}: GameContextProviderProps) {
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>("adventure");

  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(
    null,
  );
  const [version, setVersion] = useState(v4());
  const [currentPlayerId, setCurrentPlayerId] = useState<string | undefined>();

  const [currentResponseType, setCurrentResponseType] = useState<
    "text" | "dice"
  >("text");

  const triggerCharacterForm = (id?: string) => {
    if (id) setEditingCharacterId(id);
    setShowCharacterForm(true);
  };

  const { data: game } = useQuery<GameWithDetails>({
    queryKey: ["games", initialGame.id],
    initialData: initialGame,
  });

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: ["games", game.id, "characters"],
    placeholderData: keepPreviousData,
    initialData: game.characters ?? undefined,
  });

  // Deepgram token management with auto-refresh every 250 seconds
  const { data: deepgramToken = null } = useQuery<string | null>({
    queryKey: ["games", game.id, "grant"],
    queryFn: async () => {
      const response = await axios.post(`/api/games/${game.id}/grant`);
      return response.data.access_token || null;
    },
    refetchInterval: 250000, // Refresh every 250 seconds
    staleTime: 240000, // Consider stale after 240 seconds
  });

  const queryClient = useQueryClient();

  const chat = useChat({
    experimental_throttle: 100,
    generateId: v4,

    messages: messages.map((msg) => {
      return {
        id: msg.id,
        role: msg.role as "user" | "assistant" | "system",
        parts: [{ type: "text", text: msg.message! }],
      };
    }),
    transport: new DefaultChatTransport({
      api: `/api/games/${game.id}/chat`,
    }),

    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: async ({ toolCall }) => {},

    onFinish: ({ isError, message }) => {
      queryClient.invalidateQueries({ queryKey: ["games", game.id] });

      if (!isError) {
        setVersion(v4());
        console.log("Updateing vErsion");
      }
    },
  });

  // Use the narration hook
  const {
    narratingId,
    narrationEnabled,
    setNarrationEnabled,
    narrate,
    stopNarration,
    narrationQueue,
  } = useNarration({
    gameId: game.id,
    chatStatus: chat.status,
    messages: chat.messages,
    token: deepgramToken,
  });
  // Auto-narration effect
  const autoNarratedIdRef = useRef<string | null>(null);
  //This useeffect is just to trigger the narration, it doesn't wait for it to end
  useEffect(() => {
    if (narrationEnabled && chat.status === "streaming") {
      const lastAssistantMessage = chat.messages
        .filter((m) => m.role === "assistant")
        .at(-1);

      if (!lastAssistantMessage || !lastAssistantMessage.id) return;

      // 2. ONLY trigger narrate if this is a BRAND NEW message ID
      if (autoNarratedIdRef.current !== lastAssistantMessage.id) {
        autoNarratedIdRef.current = lastAssistantMessage.id;
        // This sets the narratingId and resets the bookmarks ONCE
        void narrate(lastAssistantMessage.id);
      }
    }
  }, [chat.messages, chat.status, narrationEnabled, narrate]);

  // Extract current turn logic from chat messages
  const lastAssistantMessage = useMemo(
    () => chat.messages.filter(({ role }) => role === "assistant").at(-1),
    [chat.messages],
  );

  const codeblocks = useMemo(() => {
    const parts = lastAssistantMessage?.parts.filter(({ type }) => {
      return type === "text";
    }) as Array<{ type: string; text: string }>;
    const joined = parts?.map((p) => p.text!).join("\n");
    return extractCodeblocks(joined);
  }, [lastAssistantMessage]);

  useEffect(() => {
    const responseCodeBlock = codeblocks.find(
      (bl) => bl.language === "response",
    );
    if (responseCodeBlock) {
      try {
        const json = JSON.parse(responseCodeBlock.code);
        if (json?.id) {
          setTimeout(() => setCurrentPlayerId(json.id), 0);
        }
        if (json.type) {
          setTimeout(() => setCurrentResponseType(json.type));
        }
      } catch (e) {
        console.log("ERROR PARSING JSON");
      }
    }
  }, [codeblocks]);

  // Derived state for current player
  const currentPlayer = useMemo(() => {
    return characters.find((char) => char.id === currentPlayerId);
  }, [currentPlayerId, characters]);

  const value: GameContextType = {
    game,
    characters,
    showCharacterForm,
    setShowCharacterForm,
    narrationEnabled,
    setNarrationEnabled,
    narratingId,
    narrate,
    triggerCharacterForm,
    stopNarration,
    narrationQueue,
    chat: chat as ReturnType<typeof useChat>,
    currentPlayerId,
    setCurrentPlayerId,
    currentResponseType,
    currentPlayer,
    deepgramToken,
    activeView,
    setActiveView,
  };

  return (
    <GameContext.Provider value={value}>
      {showCharacterForm && (
        <Modal
          open={true}
          onClose={() => {
            setEditingCharacterId(null);
            setShowCharacterForm(false);
          }}
          size="md"
        >
          <ModalHeader>
            <ModalTitle>
              {editingCharacterId ? "Edit" : "Create"} Character
            </ModalTitle>
          </ModalHeader>
          <ModalBody className="">
            <CharacterForm
              key={editingCharacterId ?? ""}
              gameId={String(game.id)}
              id={editingCharacterId ?? undefined}
              onSuccess={() => {
                setShowCharacterForm(false);
              }}
            />
          </ModalBody>
        </Modal>
      )}

      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameContextProvider");
  }
  return context;
}
