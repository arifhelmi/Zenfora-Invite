import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assertEventOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";
import { getBuilderPage, saveBuilderPage } from "@/features/builder/service";

export async function PATCH(request: Request, { params }: { params: Promise<{ eventId: string; assetId: string }> }) {
  const { eventId, assetId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await assertEventOwner(eventId, session.user.id);
    const asset = await prisma.pageAsset.findFirstOrThrow({ where: { id: assetId, page: { invitation: { eventId } } }, include: { mediaAsset: true } });
    if (!asset.mediaAsset) throw new Error("File aset tidak tersedia.");
    const body = await request.json();
    const page = await getBuilderPage(eventId, asset.pageId);
    if (!page) throw new Error("Halaman tidak ditemukan.");
    const background = page.backgroundConfig as Record<string, unknown>;
    const blocks = page.blocks.map((block) => ({ ...block }));
    if (body.action === "background") {
      await saveBuilderPage(eventId, session.user.id, page.id, { backgroundConfig: { ...background, assetId: asset.id, url: asset.mediaAsset.url }, versionLabel: "Sebelum mengganti background" });
    } else if (body.action === "image") {
      blocks.push({ id: undefined, pageId: page.id, blockType: "generated-image", content: { url: asset.mediaAsset.url, alt: asset.name }, dataBinding: null, positionConfig: { layoutPreset: "center", width: 78, maxWidth: 640 }, styleConfig: { borderRadius: 18 }, responsiveConfig: {}, animationConfig: { preset: "rise", duration: 500 }, order: blocks.length, isVisible: true } as never);
      await saveBuilderPage(eventId, session.user.id, page.id, { blocks: blocks as never, versionLabel: "Sebelum menambah gambar AI" });
    } else throw new Error("Aksi aset tidak dikenali.");
    await prisma.auditLog.create({ data: { actorId: session.user.id, eventId, action: "AI_ASSET_APPLIED", entity: "PageAsset", entityId: asset.id, metadata: { pageId: page.id, action: body.action } } });
    return NextResponse.json(await getBuilderPage(eventId, page.id));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Aset gagal diterapkan." }, { status: 400 }); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ eventId: string; assetId: string }> }) {
  const { eventId, assetId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await assertEventOwner(eventId, session.user.id);
    const asset = await prisma.pageAsset.findFirstOrThrow({ where: { id: assetId, page: { invitation: { eventId } } }, include: { mediaAsset: true } });
    const key = asset.mediaAsset?.url.startsWith("/api/uploads/") ? asset.mediaAsset.url.slice("/api/uploads/".length) : null;
    await prisma.$transaction(async (tx) => { await tx.pageAsset.delete({ where: { id: asset.id } }); if (asset.mediaAssetId) await tx.mediaAsset.delete({ where: { id: asset.mediaAssetId } }); });
    if (key) await storage.remove(key);
    await prisma.auditLog.create({ data: { actorId: session.user.id, eventId, action: "AI_ASSET_DELETED", entity: "PageAsset", entityId: asset.id } });
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Aset gagal dihapus." }, { status: 400 }); }
}
