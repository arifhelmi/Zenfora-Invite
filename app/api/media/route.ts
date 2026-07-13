import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assertEventOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";

const acceptedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData(); const file = form.get("file"); const eventId = String(form.get("eventId") ?? "");
  if (!(file instanceof File) || !eventId) return NextResponse.json({ error: "File dan eventId diperlukan." }, { status: 400 });
  if (!acceptedMimeTypes.has(file.type) || file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: "Gunakan JPG, PNG, WebP, atau AVIF hingga 8 MB." }, { status: 400 });
  try { await assertEventOwner(eventId, session.user.id); const stored = await storage.put(file, session.user.id); const asset = await prisma.mediaAsset.create({ data: { ownerId: session.user.id, eventId, filename: file.name, mimeType: file.type, size: file.size, url: stored.url, alt: String(form.get("alt") ?? "") || null } }); return NextResponse.json({ id: asset.id, url: asset.url }, { status: 201 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Upload gagal." }, { status: 400 }); }
}
