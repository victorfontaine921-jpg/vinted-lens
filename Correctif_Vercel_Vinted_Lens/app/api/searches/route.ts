import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ searches: [], persistence: "browser" });
}

export async function POST(request: NextRequest) {
  const body = await request.json() as { query?: string; sourceUrl?: string; intent?: string };
  if (!body.query?.trim()) return NextResponse.json({ error: "Query required" }, { status: 400 });
  return NextResponse.json({ search: { id: crypto.randomUUID(), query: body.query.trim(), sourceUrl: body.sourceUrl?.trim() || null, intent: body.intent === "style" ? "style" : "exact", createdAt: Date.now() }, persistence: "browser" }, { status: 201 });
}
