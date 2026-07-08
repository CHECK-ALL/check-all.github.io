import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { recommendations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recId = parseInt(id);
    await db
      .update(recommendations)
      .set({ dismissed: true })
      .where(eq(recommendations.id, recId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Dismiss error:", error);
    return NextResponse.json({ error: "Failed to dismiss" }, { status: 500 });
  }
}
