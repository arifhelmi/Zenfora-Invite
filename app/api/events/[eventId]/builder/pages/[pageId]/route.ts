import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assertEventOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { applyPagePatch, deleteBuilderPage, getBuilderPage, saveBuilderPage } from "@/features/builder/service";
import { pagePatchSchema, savePageSchema } from "@/features/builder/validation";

async function authorize(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;
  await assertEventOwner(eventId, session.user.id);
  return session.user;
}

export async function GET(_: Request, { params }: { params: Promise<{ eventId: string; pageId: string }> }) {
  const { eventId, pageId } = await params;
  try {
    if (!await authorize(eventId)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const page = await getBuilderPage(eventId, pageId);
    return page ? NextResponse.json(page) : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Forbidden" }, { status: 403 }); }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ eventId: string; pageId: string }> }) {
  const { eventId, pageId } = await params;
  try {
    const user = await authorize(eventId);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const page = body.action === "apply-ai-patch"
      ? await applyPagePatch(eventId, user.id, pageId, pagePatchSchema.parse(body.patch))
      : await saveBuilderPage(eventId, user.id, pageId, savePageSchema.parse(body));
    if (body.action === "apply-ai-patch") await prisma.auditLog.create({ data: { actorId: user.id, eventId, action: "AI_PAGE_PATCH_APPLIED", entity: "InvitationPage", entityId: pageId } });
    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menyimpan halaman." }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ eventId: string; pageId: string }> }) {
  const { eventId, pageId } = await params;
  try {
    const user = await authorize(eventId);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await deleteBuilderPage(eventId, pageId);
    await prisma.auditLog.create({ data: { actorId: user.id, eventId, action: "BUILDER_PAGE_DELETED", entity: "InvitationPage", entityId: pageId } });
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menghapus halaman." }, { status: 400 }); }
}
