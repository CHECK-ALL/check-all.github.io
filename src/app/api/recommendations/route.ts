import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { recommendations } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "6");
  const offset = (page - 1) * pageSize;

  try {
    const recs = await db
      .select()
      .from(recommendations)
      .where(eq(recommendations.dismissed, false))
      .orderBy(desc(recommendations.score))
      .limit(pageSize)
      .offset(offset);

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(recommendations)
      .where(eq(recommendations.dismissed, false));

    const total = Number(totalResult[0].count);

    return NextResponse.json({
      recommendations: recs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Recommendations GET error:", error);
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}
