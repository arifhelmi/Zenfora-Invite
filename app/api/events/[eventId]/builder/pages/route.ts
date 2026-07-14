import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assertEventOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { addBuilderPage, createPageFromAI, duplicateBuilderPage, ensureBuilderDocument, reorderBuilderPages } from "@/features/builder/service";
import { allowedPageConfigSchema, createPageSchema, reorderPagesSchema } from "@/features/builder/validation";

async function authorize(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;
  await assertEventOwner(eventId, session.user.id);
  return session.user;
}

export async function GET(_: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  try {
    const user = await authorize(eventId);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json(await ensureBuilderDocument(eventId));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Builder tidak tersedia." }, { status: 403 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  try {
    const user = await authorize(eventId);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    let page;
    if (body.action === "create") {
      const input = createPageSchema.parse(body);
      page = await addBuilderPage(eventId, user.id, input.pageType, input.name);
      await prisma.auditLog.create({ data: { actorId: user.id, eventId, action: "BUILDER_PAGE_CREATED", entity: "InvitationPage", entityId: page.id, metadata: { pageType: input.pageType } } });
    } else if (body.action === "create-ai") {
      const config = allowedPageConfigSchema.parse(body.config);
      page = await createPageFromAI(eventId, user.id, config);
      await prisma.auditLog.create({ data: { actorId: user.id, eventId, action: "AI_PAGE_APPLIED", entity: "InvitationPage", entityId: page.id } });
    } else if (body.action === "duplicate") {
      if (typeof body.pageId !== "string") throw new Error("pageId diperlukan.");
      page = await duplicateBuilderPage(eventId, user.id, body.pageId);
      await prisma.auditLog.create({ data: { actorId: user.id, eventId, action: "BUILDER_PAGE_DUPLICATED", entity: "InvitationPage", entityId: page.id, metadata: { sourcePageId: body.pageId } } });
    } else if (body.action === "reorder") {
      const input = reorderPagesSchema.parse(body);
      await reorderBuilderPages(eventId, input.pageIds);
      return NextResponse.json({ ok: true });
    } else throw new Error("Aksi tidak dikenali.");
    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Perubahan gagal." }, { status: 400 });
  }
}
