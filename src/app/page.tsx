"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  loadGames,
  saveGames,
  loadRecs,
  saveRecs,
  resetAllData,
  getNextGameId,
  type GameData,
  type RecData,
} from "@/lib/storage";

/* ======================================================
   TYPES & CONSTANTS
   ====================================================== */
type TabType = "library" | "recs" | "wishlist" | "umb" | "ags";
type FilterType = "all" | "coop" | "shared" | "bored" | "dropped";
type Player = "UMB" | "AGS";

const STATUS_LABELS: Record<string, string> = {
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

const STATUS_COLORS: Record<string, string> = {
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

const STATUS_EMOJI: Record<string, string> = {
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

/* ======================================================
   STATUS BADGE
   ====================================================== */
function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status] || status;
  const color = STATUS_COLORS[status] || "bg-slate-500/15 text-slate-400 border-slate-500/25";
  const emoji = STATUS_EMOJI[status] || "•";
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium ${color}`}>
      <span>{emoji}</span> {label}
    </span>
  );
}

/* ======================================================
   GAME CARD
   ====================================================== */
function GameCard({
  game,
  onUpdateStatus,
}: {
  game: GameData;
  onUpdateStatus: (gameId: number, player: Player, status: string) => void;
}) {
  const [showMenu, setShowMenu] = useState<Player | null>(null);
  const statuses = ["owned", "wishlist", "played", "playing", "dropped", "completed", "bored", "tried"];

  return (
    <div className="group relative bg-[#12151f] rounded-2xl overflow-hidden border border-[#1e2235] hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
      {/* Cover */}
      <div className="relative aspect-[460/215] overflow-hidden">
        {game.coverUrl ? (
          <img
            src={game.coverUrl}
            alt={game.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 via-purple-600/10 to-[#12151f] flex items-center justify-center">
            <span className="text-5xl opacity-50">🎮</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12151f] via-transparent to-transparent opacity-60" />
        <div className="absolute top-2.5 right-2.5 flex gap-1.5">
          {game.isCoop && (
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-500/90 text-white rounded-md">👥 Кооп</span>
          )}
          {game.isMultiplayer && !game.isCoop && (
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-sky-500/90 text-white rounded-md">🌐 МП</span>
          )}
        </div>
        {game.steamAppId && (
          <a
            href={`https://store.steampowered.com/app/${game.steamAppId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2.5 left-2.5 text-[10px] px-2 py-0.5 bg-black/50 text-white/70 rounded-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
          >
            Steam ↗
          </a>
        )}
      </div>

      <div className="p-3.5">
        <h3 className="font-bold text-[13px] text-gray-100 truncate mb-1.5" title={game.name}>{game.name}</h3>
        {game.genres && <p className="text-[10px] text-gray-500 mb-2.5 truncate font-medium">{game.genres}</p>}

        <div className="space-y-2">
          {/* UMB */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">UMB</span>
              {game.umb ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  <StatusBadge status={game.umb.status} />
                  {game.umb.hoursPlayed > 0 && <span className="text-[10px] text-gray-500 font-mono">{game.umb.hoursPlayed}ч</span>}
                </div>
              ) : (
                <span className="text-[10px] text-gray-600 italic">не добавлено</span>
              )}
            </div>
            <button
              onClick={() => setShowMenu(showMenu === "UMB" ? null : "UMB")}
              className="text-gray-500 hover:text-amber-500 transition-colors p-1 rounded-lg hover:bg-amber-500/10"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>

          {/* AGS */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-[10px] font-black text-cyan-500 bg-cyan-500/10 px-1.5 py-0.5 rounded-md border border-cyan-500/20">АГС</span>
              {game.ags ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  <StatusBadge status={game.ags.status} />
                  {game.ags.hoursPlayed > 0 && <span className="text-[10px] text-gray-500 font-mono">{game.ags.hoursPlayed}ч</span>}
                  {game.ags.hidden && <span className="text-[10px]" title="Скрыто для АГС">🚫</span>}
                </div>
              ) : (
                <span className="text-[10px] text-gray-600 italic">не добавлено</span>
              )}
            </div>
            <button
              onClick={() => setShowMenu(showMenu === "AGS" ? null : "AGS")}
              className="text-gray-500 hover:text-cyan-500 transition-colors p-1 rounded-lg hover:bg-cyan-500/10"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </div>

        {showMenu && (
          <div className="mt-2.5 p-2.5 bg-[#0e1019] rounded-xl border border-[#2a2f45] animate-[scaleIn_0.2s_ease-out]">
            <p className="text-[10px] text-gray-500 mb-2 font-medium">
              Статус для <span className={showMenu === "UMB" ? "text-amber-500" : "text-cyan-500"}>{showMenu === "AGS" ? "АГС" : showMenu}</span>:
            </p>
            <div className="flex flex-wrap gap-1">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => { onUpdateStatus(game.id, showMenu, s); setShowMenu(null); }}
                  className={`text-[10px] px-2 py-1 rounded-lg border transition-all hover:scale-105 ${STATUS_COLORS[s]}`}
                >
                  {STATUS_EMOJI[s]} {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ======================================================
   RECOMMENDATION CARD
   ====================================================== */
function RecCard({
  rec,
  onDismiss,
  onAddToLibrary,
}: {
  rec: RecData;
  onDismiss: (id: number) => void;
  onAddToLibrary: (rec: RecData, player: Player) => void;
}) {
  const scoreColor =
    rec.score >= 90 ? "from-emerald-500 to-green-600" :
    rec.score >= 80 ? "from-blue-500 to-cyan-600" :
    rec.score >= 70 ? "from-amber-500 to-yellow-600" : "from-slate-500 to-gray-600";

  return (
    <div className="bg-[#12151f] rounded-2xl overflow-hidden border border-[#1e2235] hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5 group">
      <div className="relative aspect-[460/215] overflow-hidden">
        {rec.coverUrl ? (
          <img src={rec.coverUrl} alt={rec.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 via-emerald-500/10 to-[#12151f] flex items-center justify-center">
            <span className="text-5xl opacity-50">✨</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12151f] via-transparent to-transparent opacity-60" />
        <div className="absolute top-2.5 left-2.5">
          <span className={`text-xs font-black px-2.5 py-1 rounded-lg bg-gradient-to-r ${scoreColor} text-white shadow-lg`}>
            {rec.score}%
          </span>
        </div>
        {rec.steamAppId && (
          <a
            href={`https://store.steampowered.com/app/${rec.steamAppId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2.5 right-2.5 text-[10px] font-semibold px-2.5 py-1 bg-[#1b2838]/90 text-white rounded-lg hover:bg-[#2a475e]/90 transition-colors flex items-center gap-1"
          >
            В Steam ↗
          </a>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm text-gray-100 mb-1">{rec.name}</h3>
        {rec.genres && <p className="text-[10px] text-gray-500 mb-1.5 font-medium">{rec.genres}</p>}
        {rec.reason && <p className="text-[11px] text-gray-400 mb-2 leading-relaxed line-clamp-2">{rec.reason}</p>}
        {rec.tags && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {rec.tags.split(", ").slice(0, 4).map((tag) => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/15 font-medium">{tag}</span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <button onClick={() => onAddToLibrary(rec, "UMB")} className="flex-1 text-[10px] py-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 font-semibold">⭐ UMB</button>
          <button onClick={() => onAddToLibrary(rec, "AGS")} className="flex-1 text-[10px] py-1.5 rounded-lg bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 border border-cyan-500/20 font-semibold">⭐ АГС</button>
          <button onClick={() => onDismiss(rec.id)} className="text-[10px] py-1.5 px-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/15 border border-red-500/15 font-semibold">✕</button>
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   ADD GAME MODAL
   ====================================================== */
function AddGameModal({
  onClose,
  onAdd,
  defaultPlayer,
}: {
  onClose: () => void;
  onAdd: (data: { name: string; steamAppId?: string; player: Player; status: string }) => void;
  defaultPlayer?: Player;
}) {
  const [name, setName] = useState("");
  const [steamAppId, setSteamAppId] = useState("");
  const [player, setPlayer] = useState<Player>(defaultPlayer || "UMB");
  const [status, setStatus] = useState("wishlist");

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), steamAppId: steamAppId.trim() || undefined, player, status });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#12151f] border border-[#2a2f45] rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center text-sm">➕</span>
              Добавить игру
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#0e1019] flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors">✕</button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 font-semibold block mb-1.5">Название игры *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Elden Ring"
                className="w-full px-3 py-2.5 bg-[#0e1019] border border-[#1e2235] rounded-xl text-sm text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-semibold block mb-1.5">Steam App ID (опционально)</label>
              <input
                type="text"
                value={steamAppId}
                onChange={(e) => setSteamAppId(e.target.value)}
                placeholder="1245620"
                className="w-full px-3 py-2.5 bg-[#0e1019] border border-[#1e2235] rounded-xl text-sm text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <p className="text-[10px] text-gray-600 mt-1">Найти ID: откройте игру в Steam → число в URL</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 font-semibold block mb-1.5">Для кого</label>
                <div className="flex gap-2">
                  {(["UMB", "AGS"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlayer(p)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        player === p
                          ? p === "UMB" ? "bg-amber-500 text-black" : "bg-cyan-500 text-black"
                          : "bg-[#0e1019] text-gray-400 border border-[#1e2235]"
                      }`}
                    >
                      {p === "AGS" ? "АГС" : p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold block mb-1.5">Статус</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0e1019] border border-[#1e2235] rounded-xl text-sm text-gray-100 focus:outline-none focus:border-indigo-500"
                >
                  {Object.entries(STATUS_LABELS).filter(([k]) => k !== "none").map(([key, label]) => (
                    <option key={key} value={key}>{STATUS_EMOJI[key]} {label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="w-full mt-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   ROULETTE MODAL
   ====================================================== */
function RouletteModal({ games, onClose, title }: { games: GameData[]; onClose: () => void; title?: string }) {
  const validGames = games.filter(
    (g) => (g.isCoop || g.isMultiplayer) && g.umb?.status !== "bored" && g.ags?.status !== "bored" && g.umb?.status !== "dropped" && g.ags?.status !== "dropped" && !g.ags?.hidden
  );
  const [picked, setPicked] = useState<GameData | null>(null);
  const [spinning, setSpinning] = useState(false);

  const spin = () => {
    if (validGames.length === 0) return;
    setSpinning(true);
    setPicked(null);
    let count = 0;
    const interval = setInterval(() => {
      setPicked(validGames[Math.floor(Math.random() * validGames.length)]);
      count++;
      if (count > 18) { clearInterval(interval); setSpinning(false); }
    }, 80 + count * 25);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#12151f] border border-[#2a2f45] rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold mb-1">🎰 {title || "Рулетка"}</h2>
          <p className="text-xs text-gray-400 mb-5">Из <span className="text-indigo-400 font-bold">{validGames.length}</span> подходящих игр</p>
          
          {picked ? (
            <div className={`mb-5 ${spinning ? "opacity-50" : ""}`}>
              {picked.coverUrl && <img src={picked.coverUrl} alt={picked.name} className="w-full rounded-xl mb-3 shadow-2xl" />}
              <h3 className="text-lg font-black text-indigo-400">{picked.name}</h3>
              {picked.genres && <p className="text-xs text-gray-500 mt-1">{picked.genres}</p>}
              {!spinning && picked.steamAppId && (
                <a href={`https://store.steampowered.com/app/${picked.steamAppId}`} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-xs text-indigo-400 hover:text-white underline">
                  Открыть в Steam ↗
                </a>
              )}
            </div>
          ) : (
            <div className="mb-5 py-12 text-gray-500">
              <span className="text-6xl">🎲</span>
              <p className="mt-4 text-sm">Нажмите кнопку!</p>
            </div>
          )}

          <button
            onClick={spin}
            disabled={spinning || validGames.length === 0}
            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-black rounded-xl transition-all disabled:opacity-30 shadow-lg text-sm"
          >
            {spinning ? "🎰 Крутим..." : validGames.length === 0 ? "Нет подходящих игр" : "🎲 Крутить!"}
          </button>
          <button onClick={onClose} className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors">Закрыть</button>
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   STATS PANEL
   ====================================================== */
function StatsPanel({ games }: { games: GameData[] }) {
  const shared = games.filter((g) => g.umb && g.ags);
  const coopReady = shared.filter((g) => (g.isCoop || g.isMultiplayer) && g.umb?.status !== "bored" && g.ags?.status !== "bored" && g.umb?.status !== "dropped" && g.ags?.status !== "dropped");
  const bored = games.filter((g) => g.umb?.status === "bored" || g.ags?.status === "bored");
  const wishlist = games.filter((g) => g.umb?.status === "wishlist" || g.ags?.status === "wishlist");

  const stats = [
    { label: "Всего", value: games.length, icon: "🎮", bg: "from-indigo-500/20 to-violet-500/20", border: "border-indigo-500/15" },
    { label: "Общие", value: shared.length, icon: "🤝", bg: "from-emerald-500/20 to-green-500/20", border: "border-emerald-500/15" },
    { label: "Можно вместе", value: coopReady.length, icon: "👥", bg: "from-cyan-500/20 to-blue-500/20", border: "border-cyan-500/15" },
    { label: "Хотим", value: wishlist.length, icon: "⭐", bg: "from-violet-500/20 to-purple-500/20", border: "border-violet-500/15" },
    { label: "Заебалось", value: bored.length, icon: "🤬", bg: "from-red-500/20 to-orange-500/20", border: "border-red-500/15" },
  ];

  return (
    <div className="grid grid-cols-5 gap-2 mb-6">
      {stats.map((s) => (
        <div key={s.label} className={`bg-gradient-to-br ${s.bg} rounded-xl p-3 border ${s.border} text-center`}>
          <div className="text-base mb-0.5">{s.icon}</div>
          <div className="text-xl font-black text-gray-100">{s.value}</div>
          <div className="text-[9px] text-gray-500 font-semibold uppercase tracking-wide">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ======================================================
   MAIN APP
   ====================================================== */
export default function Home() {
  const [games, setGames] = useState<GameData[]>([]);
  const [recs, setRecs] = useState<RecData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>("library");
  const [filter, setFilter] = useState<FilterType>("coop");
  const [search, setSearch] = useState("");
  const [wishlistPlayer, setWishlistPlayer] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoulette, setShowRoulette] = useState(false);
  const [addModalPlayer, setAddModalPlayer] = useState<Player | undefined>();
  const [showPersonalRoulette, setShowPersonalRoulette] = useState<Player | null>(null);
  const [recsPage, setRecsPage] = useState(1);
  const RECS_PER_PAGE = 10;

  useEffect(() => {
    setGames(loadGames());
    setRecs(loadRecs());
    setLoading(false);
  }, []);

  const updateStatus = useCallback((gameId: number, player: Player, status: string) => {
    setGames((prev) => {
      const updated = prev.map((g) => {
        if (g.id !== gameId) return g;
        const playerData = player === "UMB" ? g.umb : g.ags;
        const newPlayerData = { status, hoursPlayed: playerData?.hoursPlayed ?? 0, hidden: playerData?.hidden ?? false };
        return player === "UMB" ? { ...g, umb: newPlayerData } : { ...g, ags: newPlayerData };
      });
      saveGames(updated);
      return updated;
    });
  }, []);

  const addGame = useCallback((data: { name: string; steamAppId?: string; player: Player; status: string }) => {
    setGames((prev) => {
      const newGame: GameData = {
        id: getNextGameId(prev),
        name: data.name,
        coverUrl: data.steamAppId ? `https://cdn.akamai.steamstatic.com/steam/apps/${data.steamAppId}/header.jpg` : null,
        steamAppId: data.steamAppId || null,
        genres: null,
        tags: null,
        isMultiplayer: true,
        isCoop: true,
        releaseYear: null,
        umb: data.player === "UMB" ? { status: data.status, hoursPlayed: 0, hidden: false } : null,
        ags: data.player === "AGS" ? { status: data.status, hoursPlayed: 0, hidden: false } : null,
      };
      const updated = [...prev, newGame];
      saveGames(updated);
      return updated;
    });
    setShowAddModal(false);
  }, []);

  const dismissRec = useCallback((id: number) => {
    setRecs((prev) => {
      const updated = prev.map((r) => r.id === id ? { ...r, dismissed: true } : r);
      saveRecs(updated);
      return updated;
    });
  }, []);

  const addRecToLibrary = useCallback((rec: RecData, player: Player) => {
    addGame({ name: rec.name, steamAppId: rec.steamAppId || undefined, player, status: "wishlist" });
    dismissRec(rec.id);
  }, [addGame, dismissRec]);

  const handleReset = useCallback(() => {
    if (confirm("Сбросить все изменения к начальным данным?")) {
      resetAllData();
      setGames(loadGames());
      setRecs(loadRecs());
    }
  }, []);

  // Filtered games
  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      const umbHours = g.umb?.hoursPlayed ?? 0;
      const agsHours = g.ags?.hoursPlayed ?? 0;
      const isWishlist = g.umb?.status === "wishlist" || g.ags?.status === "wishlist";
      const isPlaying = g.umb?.status === "playing" || g.ags?.status === "playing";
      if (umbHours < 1 && agsHours < 1 && !isWishlist && !isPlaying) return false;
      if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
      switch (filter) {
        case "coop": return g.isCoop || g.isMultiplayer;
        case "shared": return g.umb && g.ags;
        case "bored": return g.umb?.status === "bored" || g.ags?.status === "bored";
        case "dropped": return g.umb?.status === "dropped" || g.ags?.status === "dropped";
        default: return true;
      }
    });
  }, [games, filter, search]);

  const wishlistGames = useMemo(() => {
    return games.filter((g) => {
      if (wishlistPlayer === "UMB") return g.umb?.status === "wishlist";
      if (wishlistPlayer === "AGS") return g.ags?.status === "wishlist";
      return g.umb?.status === "wishlist" || g.ags?.status === "wishlist";
    });
  }, [games, wishlistPlayer]);

  const playerGames = useCallback((player: Player) => games.filter((g) => player === "UMB" ? g.umb : g.ags), [games]);

  const activeRecs = useMemo(() => recs.filter((r) => !r.dismissed), [recs]);
  const pagedRecs = useMemo(() => activeRecs.slice((recsPage - 1) * RECS_PER_PAGE, recsPage * RECS_PER_PAGE), [activeRecs, recsPage]);
  const totalRecsPages = Math.ceil(activeRecs.length / RECS_PER_PAGE);

  const filters: { key: FilterType; label: string; icon: string }[] = [
    { key: "coop", label: "Кооп / МП", icon: "👥" },
    { key: "all", label: "Все", icon: "📋" },
    { key: "shared", label: "Общие", icon: "🤝" },
    { key: "bored", label: "Заебалось", icon: "🤬" },
    { key: "dropped", label: "Забросили", icon: "⏸️" },
  ];

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: "library", label: "Библиотека", icon: "📚" },
    { key: "recs", label: "Рекомендации", icon: "✨" },
    { key: "wishlist", label: "Хотелки", icon: "⭐" },
    { key: "umb", label: "UMB", icon: "🟡" },
    { key: "ags", label: "АГС", icon: "🔵" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0c14]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🎮</div>
          <p className="text-gray-400 text-sm">Загружаю...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c14] text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1e2235] bg-[#12151f]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg shadow-lg">🎮</div>
              <div>
                <h1 className="text-base font-black tracking-tight">Game Picker</h1>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold">
                  <span className="text-amber-500">UMB</span>
                  <span className="opacity-40">&</span>
                  <span className="text-cyan-500">АГС</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleReset} className="px-3 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors" title="Сбросить данные">↺</button>
              <button onClick={() => setShowRoulette(true)} className="px-3 py-2 text-xs font-bold bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-xl shadow-lg">🎲 Рулетка</button>
              <button onClick={() => { setAddModalPlayer(undefined); setShowAddModal(true); }} className="px-3 py-2 text-xs font-bold bg-indigo-500 text-white rounded-xl shadow-lg">➕ Добавить</button>
            </div>
          </div>
          <div className="flex gap-0.5 -mb-px">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${tab === t.key ? "bg-[#12151f] text-gray-100 border-indigo-500" : "text-gray-500 border-transparent hover:text-gray-300"}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-5 flex-1 w-full">
        {/* LIBRARY */}
        {tab === "library" && (
          <>
            <StatsPanel games={games} />
            <div className="mb-5 space-y-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 Поиск..."
                className="w-full px-4 py-3 bg-[#12151f] border border-[#1e2235] rounded-xl text-sm text-gray-100 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex flex-wrap gap-1.5">
                {filters.map((f) => (
                  <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${filter === f.key ? "bg-indigo-500 text-white shadow-lg" : "bg-[#12151f] text-gray-400 border border-[#1e2235] hover:text-gray-200"}`}>
                    {f.icon} {f.label}
                  </button>
                ))}
              </div>
            </div>
            {filteredGames.length === 0 ? (
              <div className="text-center py-20"><span className="text-6xl opacity-40">🕹️</span><p className="mt-4 text-gray-500 text-sm">Нет игр</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredGames.map((g) => <GameCard key={g.id} game={g} onUpdateStatus={updateStatus} />)}
              </div>
            )}
          </>
        )}

        {/* RECS */}
        {tab === "recs" && (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-black mb-1">✨ Рекомендации</h2>
              <p className="text-xs text-gray-400">На основе ваших интересов • {activeRecs.length} игр</p>
            </div>
            {pagedRecs.length === 0 ? (
              <div className="text-center py-20"><span className="text-6xl">🎉</span><p className="mt-4 text-gray-500">Все просмотрено!</p></div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {pagedRecs.map((r) => <RecCard key={r.id} rec={r} onDismiss={dismissRec} onAddToLibrary={addRecToLibrary} />)}
                </div>
                {totalRecsPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: totalRecsPages }, (_, i) => i + 1).map((p) => (
                      <button key={p} onClick={() => setRecsPage(p)} className={`w-8 h-8 rounded-lg text-xs font-bold ${p === recsPage ? "bg-indigo-500 text-white" : "bg-[#12151f] text-gray-500 border border-[#1e2235]"}`}>{p}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* WISHLIST */}
        {tab === "wishlist" && (
          <>
            <div className="mb-5">
              <h2 className="text-lg font-black mb-3">⭐ Хотелки</h2>
              <div className="flex gap-2">
                {["all", "UMB", "AGS"].map((k) => (
                  <button key={k} onClick={() => setWishlistPlayer(k)} className={`px-4 py-2 text-xs font-bold rounded-xl ${wishlistPlayer === k ? (k === "UMB" ? "bg-amber-500 text-black" : k === "AGS" ? "bg-cyan-500 text-black" : "bg-indigo-500 text-white") : "bg-[#12151f] text-gray-400 border border-[#1e2235]"}`}>
                    {k === "all" ? "📋 Все" : k === "AGS" ? "🔵 АГС" : "🟡 UMB"}
                  </button>
                ))}
              </div>
            </div>
            {wishlistGames.length === 0 ? (
              <div className="text-center py-20"><span className="text-6xl opacity-40">📝</span><p className="mt-4 text-gray-500">Пусто</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {wishlistGames.map((g) => <GameCard key={g.id} game={g} onUpdateStatus={updateStatus} />)}
              </div>
            )}
          </>
        )}

        {/* PLAYER TAB */}
        {(tab === "umb" || tab === "ags") && (() => {
          const player: Player = tab === "umb" ? "UMB" : "AGS";
          const pGames = playerGames(player);
          return (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-black">{player === "UMB" ? "🟡 UMB" : "🔵 АГС"}</h2>
                  <p className="text-xs text-gray-400">{pGames.length} игр</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowPersonalRoulette(player)} className={`px-3 py-2 text-xs font-bold ${player === "UMB" ? "bg-amber-500/80" : "bg-cyan-500/80"} text-black rounded-xl`}>🎲 Рулетка</button>
                  <button onClick={() => { setAddModalPlayer(player); setShowAddModal(true); }} className="px-3 py-2 text-xs font-bold bg-[#12151f] text-gray-300 border border-[#1e2235] rounded-xl">➕</button>
                </div>
              </div>
              {pGames.length === 0 ? (
                <div className="text-center py-20"><span className="text-6xl opacity-40">📦</span><p className="mt-4 text-gray-500">Пусто</p></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {pGames.map((g) => <GameCard key={g.id} game={g} onUpdateStatus={updateStatus} />)}
                </div>
              )}
            </>
          );
        })()}
      </main>

      <footer className="border-t border-[#1e2235] py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-[10px] text-gray-600">
          🎮 Game Picker • Данные хранятся локально в браузере
        </div>
      </footer>

      {showAddModal && <AddGameModal onClose={() => setShowAddModal(false)} onAdd={addGame} defaultPlayer={addModalPlayer} />}
      {showRoulette && <RouletteModal games={games} onClose={() => setShowRoulette(false)} title="Во что поиграть?" />}
      {showPersonalRoulette && <RouletteModal games={playerGames(showPersonalRoulette)} onClose={() => setShowPersonalRoulette(null)} title={`Рулетка ${showPersonalRoulette === "AGS" ? "АГС" : "UMB"}`} />}
    </div>
  );
}
