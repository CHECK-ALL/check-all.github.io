import { seedGames, seedRecommendations, type SeedGame } from "./seed-data";

export interface PlayerData {
  status: string;
  hoursPlayed: number;
  hidden: boolean;
}

export interface GameData {
  id: number;
  name: string;
  coverUrl: string | null;
  steamAppId: string | null;
  genres: string | null;
  tags: string | null;
  isMultiplayer: boolean;
  isCoop: boolean;
  releaseYear: number | null;
  umb: PlayerData | null;
  ags: PlayerData | null;
}

export interface RecData {
  id: number;
  name: string;
  coverUrl: string | null;
  steamAppId: string | null;
  reason: string | null;
  genres: string | null;
  tags: string | null;
  score: number;
  dismissed: boolean;
}

const STORAGE_KEYS = {
  games: "game-picker-games",
  recs: "game-picker-recs",
  customGames: "game-picker-custom",
};

function seedGameToGameData(sg: SeedGame, id: number): GameData {
  return {
    id,
    name: sg.name,
    coverUrl: sg.steamAppId
      ? `https://cdn.akamai.steamstatic.com/steam/apps/${sg.steamAppId}/header.jpg`
      : null,
    steamAppId: sg.steamAppId || null,
    genres: sg.genres || null,
    tags: sg.tags || null,
    isMultiplayer: sg.isMultiplayer ?? false,
    isCoop: sg.isCoop ?? false,
    releaseYear: sg.releaseYear || null,
    umb: sg.umbStatus
      ? { status: sg.umbStatus, hoursPlayed: sg.umbHours ?? 0, hidden: false }
      : null,
    ags: sg.agsStatus
      ? { status: sg.agsStatus, hoursPlayed: sg.agsHours ?? 0, hidden: sg.agsHidden ?? false }
      : null,
  };
}

function getInitialGames(): GameData[] {
  return seedGames.map((sg, idx) => seedGameToGameData(sg, idx + 1));
}

function getInitialRecs(): RecData[] {
  return seedRecommendations.map((rec, idx) => ({
    id: idx + 1,
    name: rec.name,
    coverUrl: rec.steamAppId
      ? `https://cdn.akamai.steamstatic.com/steam/apps/${rec.steamAppId}/header.jpg`
      : null,
    steamAppId: rec.steamAppId || null,
    reason: rec.reason,
    genres: rec.genres,
    tags: rec.tags,
    score: rec.score,
    dismissed: false,
  }));
}

export function loadGames(): GameData[] {
  if (typeof window === "undefined") return getInitialGames();
  
  const stored = localStorage.getItem(STORAGE_KEYS.games);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Invalid data, reset
    }
  }
  
  const initial = getInitialGames();
  localStorage.setItem(STORAGE_KEYS.games, JSON.stringify(initial));
  return initial;
}

export function saveGames(games: GameData[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.games, JSON.stringify(games));
}

export function loadRecs(): RecData[] {
  if (typeof window === "undefined") return getInitialRecs();
  
  const stored = localStorage.getItem(STORAGE_KEYS.recs);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Invalid data, reset
    }
  }
  
  const initial = getInitialRecs();
  localStorage.setItem(STORAGE_KEYS.recs, JSON.stringify(initial));
  return initial;
}

export function saveRecs(recs: RecData[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.recs, JSON.stringify(recs));
}

export function resetAllData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.games);
  localStorage.removeItem(STORAGE_KEYS.recs);
  localStorage.removeItem(STORAGE_KEYS.customGames);
}

export function getNextGameId(games: GameData[]): number {
  return Math.max(...games.map((g) => g.id), 0) + 1;
}
