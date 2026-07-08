import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  real,
} from "drizzle-orm/pg-core";

export const playerEnum = pgEnum("player", ["UMB", "AGS"]);

export const gameStatusEnum = pgEnum("game_status", [
  "owned",
  "wishlist",
  "played",
  "playing",
  "dropped",
  "completed",
  "bored",
  "tried",
]);

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  coverUrl: text("cover_url"),
  steamAppId: text("steam_app_id"),
  genres: text("genres"),
  tags: text("tags"),
  description: text("description"),
  isMultiplayer: boolean("is_multiplayer").default(false),
  isCoop: boolean("is_coop").default(false),
  releaseYear: integer("release_year"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playerGames = pgTable("player_games", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  player: playerEnum("player").notNull(),
  status: gameStatusEnum("status").notNull().default("owned"),
  hoursPlayed: real("hours_played").default(0),
  rating: integer("rating"),
  hidden: boolean("hidden").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  coverUrl: text("cover_url"),
  steamAppId: text("steam_app_id"),
  reason: text("reason"),
  genres: text("genres"),
  tags: text("tags"),
  score: real("score").default(0),
  dismissed: boolean("dismissed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
