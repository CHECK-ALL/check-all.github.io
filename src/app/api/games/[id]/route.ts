import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { games, playerGames } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gameId = parseInt(id);
    const body = await req.json();
    const { player, status, hoursPlayed, rating, hidden, notes } = body;

    if (player) {
      // Update or create player_game entry
      const existing = await db
        .select()
        .from(playerGames)
        .where(
          and(eq(playerGames.gameId, gameId), eq(playerGames.player, player))
        );

      if (existing.length > 0) {
        const updates: Record<string, unknown> = {};
        if (status !== undefined) updates.status = status;
        if (hoursPlayed !== undefined) updates.hoursPlayed = hoursPlayed;
        if (rating !== undefined) updates.rating = rating;
        if (hidden !== undefined) updates.hidden = hidden;
        if (notes !== undefined) updates.notes = notes;

        await db
          .update(playerGames)
          .set(updates)
          .where(
            and(eq(playerGames.gameId, gameId), eq(playerGames.player, player))
          );
      } else {
        await db.insert(playerGames).values({
          gameId,
          player,
          status: status || "owned",
          hoursPlayed: hoursPlayed ?? 0,
          rating: rating ?? null,
          hidden: hidden ?? false,
          notes: notes ?? null,
        });
      }
    }

    // Update game info if provided
    if (body.name || body.genres || body.tags) {
      const gameUpdates: Record<string, unknown> = {};
      if (body.name) gameUpdates.name = body.name;
      if (body.genres) gameUpdates.genres = body.genres;
      if (body.tags) gameUpdates.tags = body.tags;
      if (body.isMultiplayer !== undefined) gameUpdates.isMultiplayer = body.isMultiplayer;
      if (body.isCoop !== undefined) gameUpdates.isCoop = body.isCoop;

      await db.update(games).set(gameUpdates).where(eq(games.id, gameId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Game PUT error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gameId = parseInt(id);
    await db.delete(games).where(eq(games.id, gameId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Game DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
