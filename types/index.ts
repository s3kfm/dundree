import {
  gamesTable,
  characters,
  gameMessagesTable,
  assetsTable,
  scenariosTable,
} from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

/**
 * Game Form Types - Field names match database table columns
 */
export interface GameFormValues {
  theme?: string;
  setting: string;
  summary?: string;
  history?: unknown[];
  name: string;
}

/**
 * Game Type - Inferred from database schema
 */
export type Game = typeof gamesTable.$inferSelect;

export type GameWithDetails = Game & {
  scenario?: InferSelectModel<typeof scenariosTable> | null;
  characters: InferSelectModel<typeof characters>[] | null;
  pictureAssetId: string | null;
}; /**
 * Character Form Types - Field names match database table columns
 */
export interface CharacterFormValues {
  name: string;
  pronoun?: "he/him" | "she/her" | "they/them";
  strength: number;
  dexterity: number;

  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  hp: number;
  armorClass: number;
  level: number;
  description?: string;
  photoAssetId?: string | null;
}

/**
 * Character Type - Inferred from database schema
 */
export type Character = typeof characters.$inferSelect;
export type GameMessage = typeof gameMessagesTable.$inferSelect;

/**
 * Scenario Form Types - Field names match database table columns
 */
export interface ScenarioFormValues {
  id?: string;
  name: string;
  description: string;
  summary?: string;
  pictureAssetId?: string | null;
  theme?: string;
  axioms?: string[];
  locations?: Location[];
}

export interface Location {
  id: string;
  name: string;
  description: string;
  type: string;
  imageUrl?: string;
}

export type Asset = typeof assetsTable.$inferSelect;

/**
 * Scenario Type - Inferred from database schema
 */
export type Scenario = typeof scenariosTable.$inferSelect;
