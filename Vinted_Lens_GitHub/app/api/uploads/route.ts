import { NextRequest, NextResponse } from "next/server";
import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";

export async function POST(request: NextRequest) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const image = form.get("image");
  if (!(image instanceof File) || !image.type.startsWith("image/")) return NextResponse.json({ error: "Valid image required" }, { status: 400 });
  if (image.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Image must be under 10 MB" }, { status: 413 });
  if (!env.BUCKET) return NextResponse.json({ error: "Upload storage unavailable" }, { status: 503 });
  const key = `${user.userId}/${crypto.randomUUID()}-${image.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  await env.BUCKET.put(key, image.stream(), { httpMetadata: { contentType: image.type } });
  return NextResponse.json({ key }, { status: 201 });
}
