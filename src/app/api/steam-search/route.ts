import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    // Use Steam store search suggestions API
    const res = await fetch(
      `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=russian&cc=RU`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const data = await res.json();

    if (!data.items) {
      return NextResponse.json([]);
    }

    const results = data.items.map((item: { id: number; name: string; tiny_image: string }) => ({
      steamAppId: String(item.id),
      name: item.name,
      coverUrl: `https://cdn.akamai.steamstatic.com/steam/apps/${item.id}/header.jpg`,
      tinyImage: item.tiny_image,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Steam search error:", error);
    return NextResponse.json([]);
  }
}
