import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { games, playerGames } from "@/db/schema";
import { eq, sql, and, ilike } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter"); // all, shared, umb-only, ags-only, wishlist, playing, dropped, bored
  const search = searchParams.get("search");
  const player = searchParams.get("player"); // UMB or AGS for wishlist

  try {
    // Get all games with player info
    let query = db
      .select({
        id: games.id,
        name: games.name,
        coverUrl: games.coverUrl,
        steamAppId: games.steamAppId,
        genres: games.genres,
        tags: games.tags,
        isMultiplayer: games.isMultiplayer,
        isCoop: games.isCoop,
        releaseYear: games.releaseYear,
      })
      .from(games);

    let allGames;
    if (search) {
      allGames = await db
        .select({
          id: games.id,
          name: games.name,
          coverUrl: games.coverUrl,
          steamAppId: games.steamAppId,
          genres: games.genres,
          tags: games.tags,
          isMultiplayer: games.isMultiplayer,
          isCoop: games.isCoop,
          releaseYear: games.releaseYear,
        })
        .from(games)
        .where(ilike(games.name, `%${search}%`));
    } else {
      allGames = await query;
    }

    // Get all player_games data
    const allPlayerGames = await db.select().from(playerGames);

    // Build enriched game data
    const enriched = allGames.map((game) => {
      const umbData = allPlayerGames.find(
        (pg) => pg.gameId === game.id && pg.player === "UMB"
      );
      const agsData = allPlayerGames.find(
        (pg) => pg.gameId === game.id && pg.player === "AGS"
      );

      return {
        ...game,
        umb: umbData
          ? {
              status: umbData.status,
              hoursPlayed: umbData.hoursPlayed,
              rating: umbData.rating,
              hidden: umbData.hidden,
              notes: umbData.notes,
            }
          : null,
        ags: agsData
          ? {
              status: agsData.status,
              hoursPlayed: agsData.hoursPlayed,
              rating: agsData.rating,
              hidden: agsData.hidden,
              notes: agsData.notes,
            }
          : null,
      };
    });

    // Apply filters
    let filtered = enriched;
    switch (filter) {
      case "shared":
        filtered = enriched.filter((g) => g.umb && g.ags);
        break;
      case "umb-only":
        filtered = enriched.filter((g) => g.umb && !g.ags);
        break;
      case "ags-only":
        filtered = enriched.filter((g) => !g.umb && g.ags);
        break;
      case "wishlist":
        if (player === "AGS") {
          filtered = enriched.filter((g) => g.ags?.status === "wishlist");
        } else if (player === "UMB") {
          filtered = enriched.filter((g) => g.umb?.status === "wishlist");
        } else {
          filtered = enriched.filter(
            (g) => g.umb?.status === "wishlist" || g.ags?.status === "wishlist"
          );
        }
        break;
      case "playing":
        filtered = enriched.filter(
          (g) => g.umb?.status === "playing" || g.ags?.status === "playing"
        );
        break;
      case "dropped":
        filtered = enriched.filter(
          (g) => g.umb?.status === "dropped" || g.ags?.status === "dropped"
        );
        break;
      case "bored":
        filtered = enriched.filter(
          (g) => g.umb?.status === "bored" || g.ags?.status === "bored"
        );
        break;
      default:
        break;
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Games GET error:", error);
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, steamAppId, genres, tags, isMultiplayer, isCoop, releaseYear, player, status } = body;

    const coverUrl = steamAppId
      ? `https://cdn.akamai.steamstatic.com/steam/apps/${steamAppId}/header.jpg`
      : null;

    const [game] = await db
      .insert(games)
      .values({
        name,
        coverUrl,
        steamAppId: steamAppId || null,
        genres: genres || null,
        tags: tags || null,
        isMultiplayer: isMultiplayer ?? false,
        isCoop: isCoop ?? false,
        releaseYear: releaseYear || null,
      })
      .returning();

    if (player && status) {
      await db.insert(playerGames).values({
        gameId: game.id,
        player,
        status,
      });
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error("Games POST error:", error);
    return NextResponse.json({ error: "Failed to create game" }, { status: 500 });
  }
}
