import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { defaultBlocksForPage, PAGE_TYPE_LABELS } from "@/features/builder/registry";
import type { AllowedBlockConfig, AllowedPageConfig, BuilderDocument, PagePatch, PageType } from "@/features/builder/types";

const pageInclude = {
  blocks: { orderBy: { order: "asc" as const } },
  assets: { include: { mediaAsset: { select: { id: true, url: true, width: true, height: true } } }, orderBy: { createdAt: "desc" as const } },
} satisfies Prisma.InvitationPageInclude;

function json(value: unknown): Prisma.InputJsonValue {
  return (value ?? {}) as Prisma.InputJsonValue;
}

function pageData(pageType: PageType, name?: string, order = 0) {
  const title = name?.trim() || PAGE_TYPE_LABELS[pageType];
  return {
    name: title,
    slug: `${slugify(title) || "page"}-${Date.now().toString(36)}`,
    pageType,
    order,
    heightMode: pageType === "story" || pageType === "wishes" ? "minimum-viewport" : "viewport",
    backgroundConfig: json({ size: "cover", positionX: 50, positionY: 50, color: pageType === "cover" ? "#1f2d28" : "#f3eee5", overlayColor: "#101815", overlayOpacity: pageType === "cover" ? 0.24 : 0 }),
    layoutConfig: json({ preset: "center", gap: 14 }),
    responsiveConfig: json({}),
    animationConfig: json({ preset: "rise", duration: 600 }),
  };
}

function blockCreate(rawConfig: ReturnType<typeof defaultBlocksForPage>[number] | AllowedBlockConfig, order: number) {
  const config = rawConfig as AllowedBlockConfig;
  return {
    blockType: config.type,
    content: json(config.content ?? {}),
    dataBinding: config.dataBinding ?? null,
    positionConfig: json({ layoutPreset: config.layoutPreset ?? "stack", width: 86, maxWidth: 720, ...(config.positionConfig ?? {}) }),
    styleConfig: json({ stylePreset: config.stylePreset, ...(config.styleConfig ?? {}) }),
    responsiveConfig: json(config.responsiveConfig ?? {}),
    animationConfig: json(config.animationConfig ?? { preset: "rise", duration: 500, delay: order * 80 }),
    order,
  };
}

export async function ensureBuilderDocument(eventId: string): Promise<BuilderDocument> {
  let invitation = await prisma.invitation.findUnique({ where: { eventId }, include: { pages: { include: pageInclude, orderBy: { order: "asc" } } } });
  if (!invitation) {
    invitation = await prisma.invitation.create({
      data: { eventId, pages: { create: pageData("blank", "Halaman Kosong") } },
      include: { pages: { include: pageInclude, orderBy: { order: "asc" } } },
    });
  }
  return invitation as unknown as BuilderDocument;
}

export async function getBuilderPage(eventId: string, pageId: string) {
  return prisma.invitationPage.findFirst({ where: { id: pageId, invitation: { eventId } }, include: pageInclude });
}

async function createSnapshot(tx: Prisma.TransactionClient, pageId: string, userId: string, label: string, source = "manual") {
  const page = await tx.invitationPage.findUniqueOrThrow({ where: { id: pageId }, include: { blocks: { orderBy: { order: "asc" } } } });
  const snapshot = {
    name: page.name, pageType: page.pageType, heightMode: page.heightMode, backgroundConfig: page.backgroundConfig,
    layoutConfig: page.layoutConfig, responsiveConfig: page.responsiveConfig, animationConfig: page.animationConfig,
    isVisible: page.isVisible,
    blocks: page.blocks.map(({ id, blockType, content, dataBinding, positionConfig, styleConfig, responsiveConfig, animationConfig, order, isVisible }) => ({ id, blockType, content, dataBinding, positionConfig, styleConfig, responsiveConfig, animationConfig, order, isVisible })),
  };
  await tx.pageVersion.create({ data: { pageId, createdById: userId, label, source, snapshot: json(snapshot) } });
  const pageWithPlan = await tx.invitationPage.findUnique({ where: { id: pageId }, select: { invitation: { select: { event: { select: { package: { select: { pageVersionLimit: true } } } } } } } });
  const versionLimit = pageWithPlan?.invitation.event.package?.pageVersionLimit ?? 20;
  const oldVersions = await tx.pageVersion.findMany({ where: { pageId }, orderBy: { createdAt: "desc" }, skip: versionLimit, select: { id: true } });
  if (oldVersions.length) await tx.pageVersion.deleteMany({ where: { id: { in: oldVersions.map((item) => item.id) } } });
}

export async function addBuilderPage(eventId: string, userId: string, pageType: PageType, name?: string) {
  const invitation = await prisma.invitation.upsert({ where: { eventId }, create: { eventId }, update: {}, include: { _count: { select: { pages: true } } } });
  return prisma.$transaction(async (tx) => {
    const defaults = defaultBlocksForPage(pageType);
    const page = await tx.invitationPage.create({
      data: { invitationId: invitation.id, ...pageData(pageType, name, invitation._count.pages), blocks: { create: defaults.map(blockCreate) } },
      include: pageInclude,
    });
    await createSnapshot(tx, page.id, userId, "Halaman dibuat");
    return page;
  });
}

export async function createPageFromAI(eventId: string, userId: string, config: AllowedPageConfig) {
  const invitation = await prisma.invitation.upsert({ where: { eventId }, create: { eventId }, update: {}, include: { _count: { select: { pages: true } } } });
  return prisma.$transaction(async (tx) => {
    const base = pageData(config.pageType, config.name, invitation._count.pages);
    const page = await tx.invitationPage.create({
      data: {
        invitationId: invitation.id,
        ...base,
        heightMode: config.heightMode,
        backgroundConfig: json({ ...(base.backgroundConfig as object), ...config.backgroundConfig }),
        layoutConfig: json(config.layoutConfig ?? { preset: "center", gap: 14 }),
        responsiveConfig: json(config.responsiveConfig ?? {}),
        animationConfig: json(config.animationConfig ?? { preset: "rise", duration: 600 }),
        blocks: { create: config.blocks.map(blockCreate) },
      },
      include: pageInclude,
    });
    await createSnapshot(tx, page.id, userId, "Dibuat dengan AI", "ai");
    return page;
  });
}

export async function duplicateBuilderPage(eventId: string, userId: string, pageId: string) {
  const source = await prisma.invitationPage.findFirstOrThrow({ where: { id: pageId, invitation: { eventId } }, include: { blocks: { orderBy: { order: "asc" } }, invitation: { include: { _count: { select: { pages: true } } } } } });
  return prisma.$transaction(async (tx) => {
    const page = await tx.invitationPage.create({
      data: {
        invitationId: source.invitationId, name: `${source.name} (Salinan)`, slug: `${source.slug}-copy-${Date.now().toString(36)}`,
        pageType: source.pageType, order: source.invitation._count.pages, heightMode: source.heightMode,
        backgroundConfig: json(source.backgroundConfig), layoutConfig: json(source.layoutConfig), responsiveConfig: json(source.responsiveConfig), animationConfig: json(source.animationConfig),
        blocks: { create: source.blocks.map((block) => ({ blockType: block.blockType, content: json(block.content), dataBinding: block.dataBinding, positionConfig: json(block.positionConfig), styleConfig: json(block.styleConfig), responsiveConfig: json(block.responsiveConfig), animationConfig: json(block.animationConfig), order: block.order, isVisible: block.isVisible })) },
      }, include: pageInclude,
    });
    await createSnapshot(tx, page.id, userId, "Halaman diduplikasi");
    return page;
  });
}

export async function reorderBuilderPages(eventId: string, pageIds: string[]) {
  const count = await prisma.invitationPage.count({ where: { id: { in: pageIds }, invitation: { eventId } } });
  if (count !== pageIds.length) throw new Error("Urutan halaman tidak valid.");
  await prisma.$transaction(pageIds.map((id, order) => prisma.invitationPage.update({ where: { id }, data: { order } })));
}

export async function saveBuilderPage(eventId: string, userId: string, pageId: string, input: {
  name?: string; pageType?: PageType; heightMode?: string; backgroundConfig?: unknown; layoutConfig?: unknown;
  responsiveConfig?: unknown; animationConfig?: unknown; isVisible?: boolean; blocks?: Array<Record<string, unknown>>; versionLabel?: string;
}) {
  const existing = await prisma.invitationPage.findFirst({ where: { id: pageId, invitation: { eventId } }, select: { id: true } });
  if (!existing) throw new Error("Halaman tidak ditemukan.");
  return prisma.$transaction(async (tx) => {
    if (input.versionLabel) await createSnapshot(tx, pageId, userId, input.versionLabel);
    if (input.blocks) {
      const ids = input.blocks.flatMap((block) => typeof block.id === "string" ? [block.id] : []);
      await tx.pageBlock.deleteMany({ where: { pageId, ...(ids.length ? { id: { notIn: ids } } : {}) } });
      for (const [index, block] of input.blocks.entries()) {
        const data = {
          blockType: String(block.blockType), content: json(block.content), dataBinding: typeof block.dataBinding === "string" ? block.dataBinding : null,
          positionConfig: json(block.positionConfig), styleConfig: json(block.styleConfig), responsiveConfig: json(block.responsiveConfig), animationConfig: json(block.animationConfig),
          order: Number(block.order ?? index), isVisible: block.isVisible !== false,
        };
        if (typeof block.id === "string") await tx.pageBlock.update({ where: { id: block.id, pageId }, data });
        else await tx.pageBlock.create({ data: { pageId, ...data } });
      }
    }
    return tx.invitationPage.update({
      where: { id: pageId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}), ...(input.pageType ? { pageType: input.pageType } : {}),
        ...(input.heightMode ? { heightMode: input.heightMode } : {}), ...(input.backgroundConfig ? { backgroundConfig: json(input.backgroundConfig) } : {}),
        ...(input.layoutConfig ? { layoutConfig: json(input.layoutConfig) } : {}), ...(input.responsiveConfig ? { responsiveConfig: json(input.responsiveConfig) } : {}),
        ...(input.animationConfig ? { animationConfig: json(input.animationConfig) } : {}), ...(input.isVisible !== undefined ? { isVisible: input.isVisible } : {}),
      }, include: pageInclude,
    });
  });
}

export async function applyPagePatch(eventId: string, userId: string, pageId: string, patch: PagePatch) {
  const page = await prisma.invitationPage.findFirstOrThrow({ where: { id: pageId, invitation: { eventId } }, include: { blocks: { orderBy: { order: "asc" } } } });
  const removed = new Set(patch.blockIdsToRemove ?? []);
  const updates = new Map((patch.blocksToUpdate ?? []).map((item) => [item.blockId, item.patch]));
  const blocks = page.blocks.filter((block) => !removed.has(block.id)).map((block) => {
    const update = updates.get(block.id);
    return {
      id: block.id, blockType: update?.type ?? block.blockType, content: { ...(block.content as object), ...(update?.content ?? {}) },
      dataBinding: update?.dataBinding ?? block.dataBinding, positionConfig: { ...(block.positionConfig as object), layoutPreset: update?.layoutPreset, ...(update?.positionConfig ?? {}) },
      styleConfig: { ...(block.styleConfig as object), stylePreset: update?.stylePreset, ...(update?.styleConfig ?? {}) },
      responsiveConfig: { ...(block.responsiveConfig as object), ...(update?.responsiveConfig ?? {}) }, animationConfig: { ...(block.animationConfig as object), ...(update?.animationConfig ?? {}) },
      order: block.order, isVisible: block.isVisible,
    };
  });
  for (const config of patch.blocksToAdd ?? []) blocks.push({ ...blockCreate(config, blocks.length), pageId, isVisible: true } as unknown as typeof blocks[number]);
  const pagePatch = patch.page ?? {};
  return saveBuilderPage(eventId, userId, pageId, { ...pagePatch, blocks, versionLabel: "Sebelum edit AI" });
}

export async function listPageVersions(eventId: string, pageId: string) {
  return prisma.pageVersion.findMany({ where: { pageId, page: { invitation: { eventId } } }, select: { id: true, label: true, source: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 30 });
}

export async function restorePageVersion(eventId: string, userId: string, pageId: string, versionId: string) {
  const version = await prisma.pageVersion.findFirstOrThrow({ where: { id: versionId, pageId, page: { invitation: { eventId } } } });
  const snapshot = version.snapshot as Record<string, unknown>;
  await prisma.$transaction(async (tx) => {
    await createSnapshot(tx, pageId, userId, "Sebelum pemulihan versi");
    await tx.pageBlock.deleteMany({ where: { pageId } });
    const blocks = Array.isArray(snapshot.blocks) ? snapshot.blocks as Array<Record<string, unknown>> : [];
    await tx.invitationPage.update({
      where: { id: pageId }, data: {
        name: String(snapshot.name ?? "Halaman"), pageType: String(snapshot.pageType ?? "custom"), heightMode: String(snapshot.heightMode ?? "viewport"),
        backgroundConfig: json(snapshot.backgroundConfig), layoutConfig: json(snapshot.layoutConfig), responsiveConfig: json(snapshot.responsiveConfig), animationConfig: json(snapshot.animationConfig), isVisible: snapshot.isVisible !== false,
        blocks: { create: blocks.map((block, order) => ({ blockType: String(block.blockType), content: json(block.content), dataBinding: typeof block.dataBinding === "string" ? block.dataBinding : null, positionConfig: json(block.positionConfig), styleConfig: json(block.styleConfig), responsiveConfig: json(block.responsiveConfig), animationConfig: json(block.animationConfig), order: Number(block.order ?? order), isVisible: block.isVisible !== false })) },
      },
    });
  });
  return getBuilderPage(eventId, pageId);
}

export async function deleteBuilderPage(eventId: string, pageId: string) {
  const page = await prisma.invitationPage.findFirstOrThrow({ where: { id: pageId, invitation: { eventId } }, select: { id: true, invitationId: true } });
  const count = await prisma.invitationPage.count({ where: { invitationId: page.invitationId } });
  if (count <= 1) throw new Error("Undangan harus memiliki setidaknya satu halaman.");
  await prisma.invitationPage.delete({ where: { id: pageId } });
  const remaining = await prisma.invitationPage.findMany({ where: { invitationId: page.invitationId }, orderBy: { order: "asc" }, select: { id: true } });
  await prisma.$transaction(remaining.map((item, order) => prisma.invitationPage.update({ where: { id: item.id }, data: { order } })));
}

export type BuilderPrisma = PrismaClient;
