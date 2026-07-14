import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assertEventOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { listPageVersions, restorePageVersion } from "@/features/builder/service";

export async function GET(_: Request, { params }: { params: Promise<{ eventId: string; pageId: string }> }) {
  const { eventId, pageId } = await params; const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { await assertEventOwner(eventId, session.user.id); return NextResponse.json(await listPageVersions(eventId, pageId)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Forbidden" }, { status: 403 }); }
}

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string; pageId: string }> }) {
  const { eventId, pageId } = await params; const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await assertEventOwner(eventId, session.user.id); const { versionId } = await request.json();
    if (typeof versionId !== "string") throw new Error("versionId diperlukan.");
    const page = await restorePageVersion(eventId, session.user.id, pageId, versionId);
    await prisma.auditLog.create({ data: { actorId: session.user.id, eventId, action: "BUILDER_VERSION_RESTORED", entity: "InvitationPage", entityId: pageId, metadata: { versionId } } });
    return NextResponse.json(page);
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Versi gagal dipulihkan." }, { status: 400 }); }
}
