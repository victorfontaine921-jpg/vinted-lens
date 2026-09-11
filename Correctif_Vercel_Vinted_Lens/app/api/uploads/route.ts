import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const image = form.get("image");
  if (!(image instanceof File) || !image.type.startsWith("image/")) return NextResponse.json({ error: "Valid image required" }, { status: 400 });
  if (image.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Image must be under 10 MB" }, { status: 413 });
  return NextResponse.json({ accepted: true, name: image.name, previewOnly: true }, { status: 201 });
}
