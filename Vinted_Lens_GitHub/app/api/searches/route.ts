import { NextRequest, NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { searches } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await getDb().select().from(searches).where(eq(searches.userId, user.userId)).orderBy(desc(searches.createdAt)).limit(30);
  return NextResponse.json({ searches: rows });
}

export async function POST(request: NextRequest) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as { query?: string; sourceUrl?: string; intent?: string };
  if (!body.query?.trim()) return NextResponse.json({ error: "Query required" }, { status: 400 });
  const row = { id: crypto.randomUUID(), userId: user.userId, query: body.query.trim(), sourceUrl: body.sourceUrl?.trim() || null, imageKey: null, intent: body.intent === "style" ? "style" : "exact", analysisJson: JSON.stringify({ category: "blazer", color: "camel beige", fit: "oversized", material: "wool blend", style: "minimalist" }), createdAt: Date.now() };
  await getDb().insert(searches).values(row);
  return NextResponse.json({ search: row }, { status: 201 });
}
