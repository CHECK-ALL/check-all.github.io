import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, playerGames, recommendations } from "@/db/schema";
import { seedGames, seedRecommendations } from "@/lib/seed-data";
import { sql } from "drizzle-orm";

export async function POST() {
  try {
    // Check if already seeded
    const existing = await db.select({ count: sql<number>`count(*)` }).from(games);
    if (Number(existing[0].count) > 0) {
      return NextResponse.json({ message: "Already seeded", count: Number(existing[0].count) });
    }

    // Insert games and player associations
    for (const sg of seedGames) {
      const [game] = await db
        .insert(games)
        .values({
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
        })
        .returning();

      if (sg.umbStatus) {
        await db.insert(playerGames).values({
          gameId: game.id,
          player: "UMB",
          status: sg.umbStatus as "owned" | "wishlist" | "played" | "playing" | "dropped" | "completed" | "bored" | "tried",
          hoursPlayed: sg.umbHours ?? 0,
        });
      }

      if (sg.agsStatus) {
        await db.insert(playerGames).values({
          gameId: game.id,
          player: "AGS",
          status: sg.agsStatus as "owned" | "wishlist" | "played" | "playing" | "dropped" | "completed" | "bored" | "tried",
          hoursPlayed: sg.agsHours ?? 0,
          hidden: sg.agsHidden ?? false,
        });
      }
    }

    // Insert recommendations
    for (const rec of seedRecommendations) {
      await db.insert(recommendations).values({
        name: rec.name,
        coverUrl: rec.steamAppId
          ? `https://cdn.akamai.steamstatic.com/steam/apps/${rec.steamAppId}/header.jpg`
          : null,
        steamAppId: rec.steamAppId || null,
        reason: rec.reason,
        genres: rec.genres,
        tags: rec.tags,
        score: rec.score,
      });
    }

    return NextResponse.json({
      message: "Seeded successfully",
      gamesCount: seedGames.length,
      recsCount: seedRecommendations.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
