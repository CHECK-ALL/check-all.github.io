"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import type {
  Game,
  Recommendation,
  RecsResponse,
  SteamSearchResult,
  TabType,
  FilterType,
  Player,
} from "@/lib/types";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_EMOJI,
} from "@/lib/types";

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
  game: Game;
  onUpdateStatus: (gameId: number, player: Player, status: string) => void;
}) {
  const [showMenu, setShowMenu] = useState<Player | null>(null);
  const statuses = ["owned", "wishlist", "played", "playing", "dropped", "completed", "bored", "tried"];

  return (
    <div className="group relative bg-bg-card rounded-2xl overflow-hidden border border-border hover:border-accent/30 card-hover">
      {/* Cover Image */}
      <div className="relative aspect-[460/215] overflow-hidden">
        {game.coverUrl ? (
          <img
            src={game.coverUrl}
            alt={game.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/20 via-purple-600/10 to-bg-card flex items-center justify-center">
            <span className="text-5xl opacity-50">🎮</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent opacity-60" />
        {/* Tags overlay */}
        <div className="absolute top-2.5 right-2.5 flex gap-1.5">
          {game.isCoop && (
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-500/90 text-white rounded-md shadow-lg shadow-emerald-500/20">
              👥 Кооп
            </span>
          )}
          {game.isMultiplayer && !game.isCoop && (
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-sky-500/90 text-white rounded-md shadow-lg shadow-sky-500/20">
              🌐 Мультиплеер
            </span>
          )}
        </div>
        {/* Steam link */}
        {game.steamAppId && (
          <a
            href={`https://store.steampowered.com/app/${game.steamAppId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2.5 left-2.5 text-[10px] px-2 py-0.5 bg-black/50 text-white/70 rounded-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-white hover:bg-black/70"
          >
            Steam ↗
          </a>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        <h3 className="font-bold text-[13px] text-text-primary truncate mb-1.5" title={game.name}>
          {game.name}
        </h3>

        {game.genres && (
          <p className="text-[10px] text-text-muted mb-2.5 truncate font-medium">{game.genres}</p>
        )}

        {/* Player statuses */}
        <div className="space-y-2">
          {/* UMB */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-[10px] font-black text-umb bg-glow-umb px-1.5 py-0.5 rounded-md flex-shrink-0 border border-umb/20">
                UMB
              </span>
              {game.umb ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  <StatusBadge status={game.umb.status} />
                  {(game.umb.hoursPlayed ?? 0) > 0 && (
                    <span className="text-[10px] text-text-muted font-mono">{game.umb.hoursPlayed}ч</span>
                  )}
                </div>
              ) : (
                <span className="text-[10px] text-text-muted italic">не добавлено</span>
              )}
            </div>
            <button
              onClick={() => setShowMenu(showMenu === "UMB" ? null : "UMB")}
              className="text-text-muted hover:text-umb transition-colors p-1 rounded-lg hover:bg-glow-umb flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>

          {/* AGS */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-[10px] font-black text-ags bg-glow-ags px-1.5 py-0.5 rounded-md flex-shrink-0 border border-ags/20">
                АГС
              </span>
              {game.ags ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  <StatusBadge status={game.ags.status} />
                  {(game.ags.hoursPlayed ?? 0) > 0 && (
                    <span className="text-[10px] text-text-muted font-mono">{game.ags.hoursPlayed}ч</span>
                  )}
                  {game.ags.hidden && (
                    <span className="text-[10px]" title="Скрыто для АГС">🚫</span>
                  )}
                </div>
              ) : (
                <span className="text-[10px] text-text-muted italic">не добавлено</span>
              )}
            </div>
            <button
              onClick={() => setShowMenu(showMenu === "AGS" ? null : "AGS")}
              className="text-text-muted hover:text-ags transition-colors p-1 rounded-lg hover:bg-glow-ags flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Status change menu */}
        {showMenu && (
          <div className="mt-2.5 p-2.5 bg-bg-surface rounded-xl border border-border-light animate-scale-in">
            <p className="text-[10px] text-text-muted mb-2 font-medium">
              Статус для <span className={showMenu === "UMB" ? "text-umb" : "text-ags"}>{showMenu === "AGS" ? "АГС" : showMenu}</span>:
            </p>
            <div className="flex flex-wrap gap-1">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onUpdateStatus(game.id, showMenu, s);
                    setShowMenu(null);
                  }}
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
  rec: Recommendation;
  onDismiss: (id: number) => void;
  onAddToLibrary: (rec: Recommendation, player: Player) => void;
}) {
  const scoreColor =
    (rec.score ?? 0) >= 90
      ? "from-emerald-500 to-green-600"
      : (rec.score ?? 0) >= 80
      ? "from-blue-500 to-cyan-600"
      : (rec.score ?? 0) >= 70
      ? "from-amber-500 to-yellow-600"
      : "from-slate-500 to-gray-600";

  return (
    <div className="bg-bg-card rounded-2xl overflow-hidden border border-border hover:border-accent/30 card-hover animate-slide-up group">
      {/* Cover */}
      <div className="relative aspect-[460/215] overflow-hidden">
        {rec.coverUrl ? (
          <img
            src={rec.coverUrl}
            alt={rec.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/20 via-emerald-500/10 to-bg-card flex items-center justify-center">
            <span className="text-5xl opacity-50">✨</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent opacity-60" />
        {/* Score badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`text-xs font-black px-2.5 py-1 rounded-lg bg-gradient-to-r ${scoreColor} text-white shadow-lg`}>
            {rec.score}% совпадение
          </span>
        </div>
        {/* Steam link */}
        {rec.steamAppId && (
          <a
            href={`https://store.steampowered.com/app/${rec.steamAppId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2.5 right-2.5 text-[10px] font-semibold px-2.5 py-1 bg-[#1b2838]/90 text-white rounded-lg shadow-lg backdrop-blur-sm hover:bg-[#2a475e]/90 transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            В Steam
          </a>
        )}
      </div>

      <div className="p-3.5">
        <h3 className="font-bold text-sm text-text-primary mb-1">{rec.name}</h3>
        {rec.genres && (
          <p className="text-[10px] text-text-muted mb-2 font-medium">{rec.genres}</p>
        )}
        {rec.reason && (
          <p className="text-xs text-text-secondary mb-3 leading-relaxed">{rec.reason}</p>
        )}
        {rec.tags && (
          <div className="flex flex-wrap gap-1 mb-3">
            {rec.tags.split(", ").slice(0, 5).map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 bg-accent/8 text-accent-light rounded-md border border-accent/10 font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAddToLibrary(rec, "UMB")}
            className="flex-1 text-[11px] py-2 rounded-xl bg-glow-umb text-umb hover:bg-umb/20 transition-all border border-umb/20 font-semibold hover:scale-[1.02]"
          >
            ⭐ UMB хочет
          </button>
          <button
            onClick={() => onAddToLibrary(rec, "AGS")}
            className="flex-1 text-[11px] py-2 rounded-xl bg-glow-ags text-ags hover:bg-ags/20 transition-all border border-ags/20 font-semibold hover:scale-[1.02]"
          >
            ⭐ АГС хочет
          </button>
          <button
            onClick={() => onDismiss(rec.id)}
            className="text-[11px] py-2 px-3 rounded-xl bg-danger/8 text-danger hover:bg-danger/15 transition-all border border-danger/15 font-semibold"
            title="Не интересно"
          >
            ✕
          </button>
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
  onAdd: (data: {
    name: string;
    steamAppId?: string;
    player: Player;
    status: string;
  }) => void;
  defaultPlayer?: Player;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SteamSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedGame, setSelectedGame] = useState<SteamSearchResult | null>(null);
  const [player, setPlayer] = useState<Player>(defaultPlayer || "UMB");
  const [status, setStatus] = useState("wishlist");
  const [customName, setCustomName] = useState("");

  const searchSteam = useCallback(async (q: string) => {
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/steam-search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch { setSearchResults([]); }
    setSearching(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchSteam(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery, searchSteam]);

  const handleAdd = () => {
    if (selectedGame) {
      onAdd({ name: selectedGame.name, steamAppId: selectedGame.steamAppId, player, status });
    } else if (customName.trim()) {
      onAdd({ name: customName.trim(), player, status });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-bg-card border border-border-light rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-scale-in shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center text-sm">➕</span>
              Добавить игру
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-bg-surface flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-danger/15 hover:text-danger transition-all">✕</button>
          </div>

          <div className="mb-4">
            <label className="text-xs text-text-secondary font-semibold block mb-2">Поиск в Steam:</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSelectedGame(null); }}
                placeholder="Начните вводить название..."
                className="w-full pl-9 pr-4 py-2.5 bg-bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              />
            </div>
          </div>

          {searching && <p className="text-sm text-text-muted mb-3 animate-pulse">🔍 Ищу в Steam...</p>}

          {searchResults.length > 0 && !selectedGame && (
            <div className="mb-4 max-h-48 overflow-y-auto space-y-0.5 border border-border rounded-xl p-1">
              {searchResults.map((result) => (
                <button
                  key={result.steamAppId}
                  onClick={() => { setSelectedGame(result); setSearchQuery(result.name); setSearchResults([]); }}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-bg-elevated transition-colors text-left"
                >
                  <img src={result.tinyImage} alt="" className="w-[72px] h-[34px] rounded-md object-cover flex-shrink-0" />
                  <span className="text-sm text-text-primary truncate">{result.name}</span>
                </button>
              ))}
            </div>
          )}

          {selectedGame && (
            <div className="mb-4 p-3 bg-bg-surface rounded-xl border border-accent/20 animate-fade-in">
              <div className="flex items-center gap-3">
                <img src={selectedGame.coverUrl} alt="" className="w-32 h-[68px] rounded-lg object-cover" />
                <div>
                  <p className="text-sm font-bold text-text-primary">{selectedGame.name}</p>
                  <p className="text-[10px] text-text-muted mt-0.5 font-mono">Steam: {selectedGame.steamAppId}</p>
                </div>
              </div>
            </div>
          )}

          {!selectedGame && (
            <div className="mb-4">
              <label className="text-xs text-text-secondary font-semibold block mb-2">Или введите вручную:</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Название игры"
                className="w-full px-4 py-2.5 bg-bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="text-xs text-text-secondary font-semibold block mb-2">Для кого:</label>
              <div className="flex gap-2">
                {(["UMB", "AGS"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlayer(p)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      player === p
                        ? p === "UMB" ? "bg-umb text-black shadow-lg shadow-umb/20" : "bg-ags text-black shadow-lg shadow-ags/20"
                        : "bg-bg-surface text-text-secondary hover:text-text-primary border border-border"
                    }`}
                  >
                    {p === "AGS" ? "АГС" : p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-text-secondary font-semibold block mb-2">Статус:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent transition-all"
              >
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{STATUS_EMOJI[key]} {label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={!selectedGame && !customName.trim()}
            className="w-full py-3 bg-gradient-to-r from-accent to-accent-dim hover:from-accent-light hover:to-accent text-white font-bold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-accent/20 hover:shadow-accent/30"
          >
            Добавить в коллекцию
          </button>
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   RANDOM PICK MODAL
   ====================================================== */
function RandomPickModal({ games, onClose, title }: { games: Game[]; onClose: () => void; title?: string }) {
  const coopGames = games.filter(
    (g) =>
      (g.isCoop || g.isMultiplayer) &&
      g.umb?.status !== "bored" &&
      g.ags?.status !== "bored" &&
      g.umb?.status !== "dropped" &&
      g.ags?.status !== "dropped" &&
      !g.ags?.hidden
  );

  const [picked, setPicked] = useState<Game | null>(null);
  const [spinning, setSpinning] = useState(false);

  const spin = () => {
    if (coopGames.length === 0) return;
    setSpinning(true);
    setPicked(null);
    let count = 0;
    const interval = setInterval(() => {
      setPicked(coopGames[Math.floor(Math.random() * coopGames.length)]);
      count++;
      if (count > 18) {
        clearInterval(interval);
        setSpinning(false);
      }
    }, 80 + count * 25);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-bg-card border border-border-light rounded-2xl w-full max-w-md animate-scale-in shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold mb-1">🎰 {title || "Рулетка игр"}</h2>
          <p className="text-xs text-text-secondary mb-5">
            Из <span className="text-accent-light font-bold">{coopGames.length}</span> подходящих игр
          </p>

          {picked ? (
            <div className={`mb-5 ${spinning ? "opacity-50" : "animate-scale-in"}`}>
              {picked.coverUrl && (
                <img src={picked.coverUrl} alt={picked.name} className={`w-full rounded-xl mb-3 shadow-2xl ${spinning ? "" : "pulse-glow"}`} />
              )}
              <h3 className="text-lg font-black text-accent-light">{picked.name}</h3>
              {picked.genres && <p className="text-xs text-text-muted mt-1">{picked.genres}</p>}
              {!spinning && picked.steamAppId && (
                <a
                  href={`https://store.steampowered.com/app/${picked.steamAppId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-xs text-accent-light hover:text-white transition-colors underline"
                >
                  Открыть в Steam ↗
                </a>
              )}
            </div>
          ) : (
            <div className="mb-5 py-12 text-text-muted">
              <span className="text-6xl">🎲</span>
              <p className="mt-4 text-sm">Нажмите кнопку!</p>
            </div>
          )}

          <button
            onClick={spin}
            disabled={spinning || coopGames.length === 0}
            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-black rounded-xl transition-all disabled:opacity-30 shadow-lg text-sm"
          >
            {spinning ? "🎰 Крутим..." : coopGames.length === 0 ? "Нет подходящих игр" : "🎲 Крутить рулетку!"}
          </button>
          <button onClick={onClose} className="mt-3 text-xs text-text-muted hover:text-text-primary transition-colors block mx-auto">Закрыть</button>
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   STATS PANEL
   ====================================================== */
function StatsPanel({ games }: { games: Game[] }) {
  const shared = games.filter((g) => g.umb && g.ags);
  const coopReady = games.filter(
    (g) => (g.isCoop || g.isMultiplayer) && g.umb && g.ags && g.umb.status !== "bored" && g.ags.status !== "bored" && g.umb.status !== "dropped" && g.ags.status !== "dropped"
  );
  const bored = games.filter((g) => g.umb?.status === "bored" || g.ags?.status === "bored");
  const wishlist = games.filter((g) => g.umb?.status === "wishlist" || g.ags?.status === "wishlist");

  const stats = [
    { label: "Всего", value: games.length, icon: "🎮", gradient: "from-accent/20 to-violet-500/20", border: "border-accent/15" },
    { label: "Общие", value: shared.length, icon: "🤝", gradient: "from-emerald-500/20 to-green-500/20", border: "border-emerald-500/15" },
    { label: "Можно вместе", value: coopReady.length, icon: "👥", gradient: "from-cyan-500/20 to-blue-500/20", border: "border-cyan-500/15" },
    { label: "Хотим", value: wishlist.length, icon: "⭐", gradient: "from-violet-500/20 to-purple-500/20", border: "border-violet-500/15" },
    { label: "Заебалось", value: bored.length, icon: "🤬", gradient: "from-red-500/20 to-orange-500/20", border: "border-red-500/15" },
  ];

  return (
    <div className="grid grid-cols-5 gap-2 mb-6">
      {stats.map((s) => (
        <div key={s.label} className={`bg-gradient-to-br ${s.gradient} rounded-xl p-3 border ${s.border} text-center`}>
          <div className="text-base mb-0.5">{s.icon}</div>
          <div className="text-xl font-black text-text-primary">{s.value}</div>
          <div className="text-[9px] text-text-muted font-semibold uppercase tracking-wide">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ======================================================
   MAIN PAGE
   ====================================================== */
export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("coop");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRandom, setShowRandom] = useState(false);
  const [addModalPlayer, setAddModalPlayer] = useState<Player | undefined>(undefined);
  const [tab, setTab] = useState<TabType>("library");
  const [wishlistPlayer, setWishlistPlayer] = useState<string>("all");

  // Recs state
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [recsPage, setRecsPage] = useState(1);
  const [recsTotalPages, setRecsTotalPages] = useState(1);
  const [recsLoading, setRecsLoading] = useState(false);

  // Personal roulette
  const [showPersonalRandom, setShowPersonalRandom] = useState<Player | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await fetch("/api/seed", { method: "POST" });
        await loadGames();
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    init();
  }, []);

  const loadGames = async () => {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();
      setGames(data);
    } catch (e) { console.error(e); }
  };

  const loadRecs = useCallback(async (page: number) => {
    setRecsLoading(true);
    try {
      const res = await fetch(`/api/recommendations?page=${page}&pageSize=10`);
      const data: RecsResponse = await res.json();
      setRecs(data.recommendations);
      setRecsTotalPages(data.totalPages);
      setRecsPage(data.page);
    } catch (e) { console.error(e); }
    setRecsLoading(false);
  }, []);

  useEffect(() => {
    if (tab === "recs") loadRecs(recsPage);
  }, [tab, recsPage, loadRecs]);

  const updateStatus = async (gameId: number, player: Player, status: string) => {
    await fetch(`/api/games/${gameId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player, status }),
    });
    await loadGames();
  };

  const addGame = async (data: { name: string; steamAppId?: string; player: Player; status: string }) => {
    await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await loadGames();
    setShowAddModal(false);
  };

  const dismissRec = async (id: number) => {
    await fetch(`/api/recommendations/${id}/dismiss`, { method: "POST" });
    await loadRecs(recsPage);
  };

  const addRecToLibrary = async (rec: Recommendation, player: Player) => {
    await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: rec.name, steamAppId: rec.steamAppId, player, status: "wishlist" }),
    });
    await loadGames();
    await dismissRec(rec.id);
  };

  // Filtered games for library
  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      // Hide games where both players have less than 1 hour (unless wishlist/playing)
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

  // Wishlist games
  const wishlistGames = useMemo(() => {
    return games.filter((g) => {
      if (wishlistPlayer === "UMB") return g.umb?.status === "wishlist";
      if (wishlistPlayer === "AGS") return g.ags?.status === "wishlist";
      return g.umb?.status === "wishlist" || g.ags?.status === "wishlist";
    });
  }, [games, wishlistPlayer]);

  // Player-specific games
  const playerGames = useCallback((player: Player) => {
    return games.filter((g) => player === "UMB" ? g.umb : g.ags);
  }, [games]);

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🎮</div>
          <p className="text-text-secondary text-sm font-medium">Загружаю вашу коллекцию...</p>
          <div className="mt-4 w-48 h-1 bg-bg-card rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-accent rounded-full loading-shimmer" style={{ width: "60%" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ===== HEADER ===== */}
      <header className="border-b border-border glass">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center text-lg shadow-lg shadow-accent/20">🎮</div>
              <div>
                <h1 className="text-base font-black tracking-tight">Game Picker</h1>
                <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-semibold">
                  <span className="text-umb">UMB</span>
                  <span className="opacity-40">&</span>
                  <span className="text-ags">АГС</span>
                  <span className="opacity-40">•</span>
                  <span>Во что поиграть?</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRandom(true)}
                className="px-3.5 py-2 text-xs font-bold bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white rounded-xl transition-all shadow-lg shadow-violet-600/20 hover:shadow-violet-500/30 hover:scale-[1.02]"
              >
                🎲 Рулетка
              </button>
              <button
                onClick={() => { setAddModalPlayer(undefined); setShowAddModal(true); }}
                className="px-3.5 py-2 text-xs font-bold bg-accent hover:bg-accent-light text-white rounded-xl transition-all shadow-lg shadow-accent/20"
              >
                ➕ Добавить
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5 -mb-px">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
                  tab === t.key
                    ? "bg-bg-card text-text-primary border-accent"
                    : "text-text-muted hover:text-text-secondary border-transparent hover:border-border"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-5 flex-1 w-full">

        {/* ===== LIBRARY TAB ===== */}
        {tab === "library" && (
          <>
            <StatsPanel games={games} />

            <div className="mb-5 space-y-3">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по названию..."
                  className="w-full pl-10 pr-4 py-3 bg-bg-card border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {filters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                      filter === f.key
                        ? "bg-accent text-white shadow-lg shadow-accent/25"
                        : "bg-bg-card text-text-secondary hover:text-text-primary border border-border hover:border-border-light"
                    }`}
                  >
                    {f.icon} {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredGames.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-6xl opacity-40">🕹️</span>
                <p className="mt-4 text-text-muted text-sm">Нет игр по этому фильтру</p>
              </div>
            ) : (
              <>
                <p className="text-[10px] text-text-muted mb-3 font-semibold uppercase tracking-widest">
                  Показано {filteredGames.length} из {games.length}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredGames.map((game) => (
                    <GameCard key={game.id} game={game} onUpdateStatus={updateStatus} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ===== RECS TAB ===== */}
        {tab === "recs" && (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center text-xl border border-emerald-500/15">✨</div>
                <div>
                  <h2 className="text-lg font-black">Рекомендации для вас</h2>
                  <p className="text-xs text-text-secondary">
                    Алгоритм на основе перекрытия ваших интересов
                  </p>
                </div>
              </div>
              <div className="mt-3 p-3 rounded-xl bg-accent/5 border border-accent/10 text-xs text-text-secondary leading-relaxed">
                📊 Учтены: совместные часы, жанры, теги, предпочтение АГС к реализму, любовь обоих к средневековью и кооп. Сортировка по % совпадения.
              </div>
            </div>

            {recsLoading ? (
              <div className="text-center py-20">
                <div className="text-5xl animate-pulse">✨</div>
                <p className="mt-4 text-text-muted text-sm">Загружаю рекомендации...</p>
              </div>
            ) : recs.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-6xl">🎉</span>
                <p className="mt-4 text-text-muted text-sm">Все рекомендации просмотрены!</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {recs.map((rec) => (
                    <RecCard key={rec.id} rec={rec} onDismiss={dismissRec} onAddToLibrary={addRecToLibrary} />
                  ))}
                </div>

                <div className="flex items-center justify-center gap-3 mt-8">
                  <button
                    onClick={() => setRecsPage((p) => Math.max(1, p - 1))}
                    disabled={recsPage <= 1}
                    className="px-5 py-2.5 bg-bg-card border border-border rounded-xl text-sm font-semibold text-text-secondary hover:text-text-primary disabled:opacity-20 transition-all"
                  >
                    ← Назад
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: recsTotalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setRecsPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          p === recsPage
                            ? "bg-accent text-white shadow-lg shadow-accent/20"
                            : "bg-bg-card text-text-muted hover:text-text-primary border border-border"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setRecsPage((p) => Math.min(recsTotalPages, p + 1))}
                    disabled={recsPage >= recsTotalPages}
                    className="px-5 py-2.5 bg-bg-card border border-border rounded-xl text-sm font-semibold text-text-secondary hover:text-text-primary disabled:opacity-20 transition-all"
                  >
                    Далее →
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* ===== WISHLIST TAB ===== */}
        {tab === "wishlist" && (
          <>
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center text-xl border border-violet-500/15">⭐</div>
                <div>
                  <h2 className="text-lg font-black">Списки желаний</h2>
                  <p className="text-xs text-text-secondary">Что хотим купить или попробовать</p>
                </div>
              </div>
              <div className="flex gap-2">
                {([
                  { key: "all", label: "Все", icon: "📋" },
                  { key: "UMB", label: "UMB", icon: "🟡" },
                  { key: "AGS", label: "АГС", icon: "🔵" },
                ] as const).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setWishlistPlayer(opt.key)}
                    className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
                      wishlistPlayer === opt.key
                        ? opt.key === "UMB"
                          ? "bg-umb text-black shadow-lg shadow-umb/20"
                          : opt.key === "AGS"
                          ? "bg-ags text-black shadow-lg shadow-ags/20"
                          : "bg-accent text-white shadow-lg shadow-accent/20"
                        : "bg-bg-card text-text-secondary border border-border hover:text-text-primary"
                    }`}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {wishlistGames.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-6xl opacity-40">📝</span>
                <p className="mt-4 text-text-muted text-sm">Список пуст</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 px-4 py-2 text-xs font-bold bg-accent/15 text-accent-light rounded-xl hover:bg-accent/25 transition-all"
                >
                  ➕ Добавить игру
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {wishlistGames.map((game) => (
                  <GameCard key={game.id} game={game} onUpdateStatus={updateStatus} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== PLAYER TAB (UMB or AGS) ===== */}
        {(tab === "umb" || tab === "ags") && (() => {
          const player: Player = tab === "umb" ? "UMB" : "AGS";
          const playerLabel = player === "AGS" ? "АГС" : "UMB";
          const pGames = playerGames(player);
          const color = player === "UMB" ? "umb" : "ags";

          return (
            <>
              <div className="mb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${player === "UMB" ? "from-umb/20 to-amber-500/20 border-umb/15" : "from-ags/20 to-cyan-500/20 border-ags/15"} flex items-center justify-center text-xl border`}>
                      {player === "UMB" ? "🟡" : "🔵"}
                    </div>
                    <div>
                      <h2 className="text-lg font-black">Игры {playerLabel}</h2>
                      <p className="text-xs text-text-secondary">
                        {pGames.length} игр в коллекции
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPersonalRandom(player)}
                      className={`px-3.5 py-2 text-xs font-bold bg-gradient-to-r ${player === "UMB" ? "from-umb/80 to-amber-600/80 shadow-umb/20" : "from-ags/80 to-cyan-600/80 shadow-ags/20"} text-white rounded-xl transition-all shadow-lg hover:scale-[1.02]`}
                    >
                      🎲 Моя рулетка
                    </button>
                    <button
                      onClick={() => { setAddModalPlayer(player); setShowAddModal(true); }}
                      className={`px-3.5 py-2 text-xs font-bold bg-${color}/15 text-${color} rounded-xl border border-${color}/20 hover:bg-${color}/25 transition-all`}
                    >
                      ➕ Добавить
                    </button>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {[
                    { label: "Играли", count: pGames.filter((g) => (player === "UMB" ? g.umb : g.ags)?.status === "played").length, icon: "✅" },
                    { label: "Хочу", count: pGames.filter((g) => (player === "UMB" ? g.umb : g.ags)?.status === "wishlist").length, icon: "⭐" },
                    { label: "Заебалось", count: pGames.filter((g) => (player === "UMB" ? g.umb : g.ags)?.status === "bored").length, icon: "🤬" },
                    { label: "Забросили", count: pGames.filter((g) => (player === "UMB" ? g.umb : g.ags)?.status === "dropped").length, icon: "⏸️" },
                  ].map((s) => (
                    <div key={s.label} className="bg-bg-card rounded-xl p-2.5 border border-border text-center">
                      <div className="text-sm">{s.icon}</div>
                      <div className="text-lg font-black">{s.count}</div>
                      <div className="text-[9px] text-text-muted font-semibold uppercase">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {pGames.length === 0 ? (
                <div className="text-center py-20">
                  <span className="text-6xl opacity-40">📦</span>
                  <p className="mt-4 text-text-muted text-sm">Коллекция пуста</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {pGames.map((game) => (
                    <GameCard key={game.id} game={game} onUpdateStatus={updateStatus} />
                  ))}
                </div>
              )}
            </>
          );
        })()}
      </main>

      {/* ===== MODALS ===== */}
      {showAddModal && (
        <AddGameModal
          onClose={() => setShowAddModal(false)}
          onAdd={addGame}
          defaultPlayer={addModalPlayer}
        />
      )}
      {showRandom && (
        <RandomPickModal games={games} onClose={() => setShowRandom(false)} title="Во что поиграть вместе?" />
      )}
      {showPersonalRandom && (
        <RandomPickModal
          games={playerGames(showPersonalRandom)}
          onClose={() => setShowPersonalRandom(null)}
          title={`Рулетка ${showPersonalRandom === "AGS" ? "АГС" : "UMB"}`}
        />
      )}

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-[10px] text-text-muted">
          <p>🎮 Game Picker — помощник в выборе игр</p>
          <p className="opacity-50">Обложки из Steam Store</p>
        </div>
      </footer>
    </div>
  );
}
