export interface PlayerData {
  status: string;
  hoursPlayed: number | null;
  rating: number | null;
  hidden: boolean | null;
  notes: string | null;
}

export interface Game {
  id: number;
  name: string;
  coverUrl: string | null;
  steamAppId: string | null;
  genres: string | null;
  tags: string | null;
  isMultiplayer: boolean | null;
  isCoop: boolean | null;
  releaseYear: number | null;
  umb: PlayerData | null;
  ags: PlayerData | null;
}

export interface Recommendation {
  id: number;
  name: string;
  coverUrl: string | null;
  steamAppId: string | null;
  reason: string | null;
  genres: string | null;
  tags: string | null;
  score: number | null;
  dismissed: boolean | null;
}

export interface RecsResponse {
  recommendations: Recommendation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SteamSearchResult {
  steamAppId: string;
  name: string;
  coverUrl: string;
  tinyImage: string;
}

export type TabType = "library" | "recs" | "wishlist" | "umb" | "ags";

export type FilterType =
  | "all"
  | "coop"
  | "shared"
  | "bored"
  | "dropped";

export type Player = "UMB" | "AGS";

export const STATUS_LABELS: Record<string, string> = {
  owned: "В библиотеке",
  wishlist: "Хочу купить",
  played: "Играли",
  playing: "Сейчас играем",
  dropped: "Забросили",
  completed: "Прошли",
  bored: "Заебалось",
  tried: "Пробовали",
  none: "Не играл",
};

export const STATUS_COLORS: Record<string, string> = {
  owned: "bg-sky-500/15 text-sky-400 border-sky-500/25",
  wishlist: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  played: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  playing: "bg-green-400/20 text-green-300 border-green-400/30",
  dropped: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  completed: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  bored: "bg-red-500/15 text-red-400 border-red-500/25",
  tried: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
  none: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
};

export const STATUS_EMOJI: Record<string, string> = {
  owned: "📦",
  wishlist: "⭐",
  played: "✅",
  playing: "🎮",
  dropped: "⏸️",
  completed: "🏆",
  bored: "🤬",
  tried: "👀",
  none: "➖",
};
