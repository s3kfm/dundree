import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  pgEnum,
  varchar,
  bigint,
} from "drizzle-orm/pg-core";

export const gameStatusEnum = pgEnum("game_status", [
  "waiting",
  "active",
  "completed",
]);
export const gamesTable = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  status: gameStatusEnum("status").default("waiting"), // 'waiting', 'active', 'completed'
  setting: text("setting").notNull(), // "Gritty Star Trek", "High Fantasy", etc.
  axioms: text("axioms").array(),
  scenarioId: uuid("scenarioId").references(() => scenariosTable.id),
  summary: text("summary").default("").notNull(),
  history: jsonb("history").default([]), // Stores the last ~10 actions for context
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").notNull(),
});
export const gameMessagesTable = pgTable("game_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  message: text("message"),
  gameId: uuid("game_id").references(() => gamesTable.id),
  characterId: uuid("character_id").references(() => characters.id),
  order: integer("order").generatedAlwaysAsIdentity(),
  role: varchar("role", { length: 50 }).notNull(), // 'user' | 'assistant' | 'system'
  createdAt: timestamp("created_at").defaultNow(),
});

export const pronounEnum = pgEnum("pronoun", [
  "he/him",
  "she/her",
  "they/them",
]);

export const characters = pgTable("characters", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("game_id")
    .notNull()
    .references(() => gamesTable.id),

  name: text("name").notNull(),
  pronoun: pronounEnum("pronoun").default("they/them"),

  photoAssetId: uuid("photo_asset_id").references(() => assetsTable.id),
  // DND Ability Scores
  strength: integer("strength").default(10),
  dexterity: integer("dexterity").default(10),
  constitution: integer("constitution").default(10),
  intelligence: integer("intelligence").default(10),
  wisdom: integer("wisdom").default(10),
  charisma: integer("charisma").default(10),

  // Core combat stats
  hp: integer("hp").default(10),
  armorClass: integer("armor_class").default(10),

  // Level progression
  level: integer("level").default(1),

  // Free-form character description
  description: text("description"),
});

export const scenesTable = pgTable("scenes", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title").notNull(),
  description: text("title").notNull(),
  visualPrompt: text("visual_prompt").notNull(),
  location: text("location").notNull(),
});

export const npcsTable = pgTable("npcs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  voiceId: varchar("voice_id"),
});

export const fileTypeEnum = pgEnum("fileType", [
  "audio",
  "image",
  "video",
  "other",
]);
export const assetsTable = pgTable("assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  version: text("version"), // Cloudinary version for cache busting
  width: integer("width"),
  height: integer("height"),
  bytes: bigint({ mode: "number" }),
  fileType: fileTypeEnum("file_type"),
  format: varchar("format", { length: 10 }),
  secureUrl: text("signed_url"),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  claimedAt: timestamp("claimed_at"),
});
export const themeEnum = pgEnum("theme", [
  "sci-fi",
  "cyberpunk",
  "fantasy",
  " ",
]);

export const scenariosTable = pgTable("scenarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  pictureAssetId: uuid("picture_asset_id").references(() => assetsTable.id),
  description: text("description").notNull(),
  theme: varchar("theme"),
  axioms: text("axioms").array(),
  locations: jsonb("locations"),
  userId: varchar("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
});
