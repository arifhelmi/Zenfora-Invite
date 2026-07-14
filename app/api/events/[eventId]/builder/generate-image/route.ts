import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assertEventOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { storage } from "@/lib/storage";
import { createGenerationJob, failGenerationJob, getAICreditStatus } from "@/features/builder/credits";
import { getImageGenerationProvider } from "@/features/builder/mock-image-provider";
import { moderateBuilderPrompt } from "@/features/builder/ai-page-generator";
import { imageGenerationInputSchema } from "@/features/builder/validation";

export async function GET(_: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { await assertEventOwner(eventId, session.user.id); return NextResponse.json(await getAICreditStatus(session.user.id, eventId)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Forbidden" }, { status: 403 }); }
}

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let jobId: string | undefined;
  try {
    await assertEventOwner(eventId, session.user.id);
    if (!rateLimit(`ai-image:${session.user.id}`, 8, 60_000)) return NextResponse.json({ error: "Terlalu banyak generate gambar. Coba kembali sebentar lagi." }, { status: 429 });
    const body = await request.json();
    const page = await prisma.invitationPage.findFirst({ where: { id: body.pageId, invitation: { eventId } }, select: { id: true } });
    if (!page) throw new Error("Halaman tidak ditemukan.");
    const input = imageGenerationInputSchema.parse(body.input);
    moderateBuilderPrompt(input.prompt);
    const idempotencyKey = request.headers.get("Idempotency-Key") ?? `image:${crypto.randomUUID()}`;
    const providerName = process.env.AI_IMAGE_PROVIDER ?? "mock";
    const created = await createGenerationJob({ userId: session.user.id, eventId, pageId: page.id, kind: "IMAGE_GENERATION", provider: providerName, payload: input, idempotencyKey });
    jobId = created.job.id;
    if (created.existing) return NextResponse.json({ jobId, results: created.job.results, idempotent: true });
    const generated = await getImageGenerationProvider().generate(input);
    const results = [];
    for (const image of generated.images) {
      if (!image.mimeType.startsWith("image/") || image.bytes.byteLength > 12 * 1024 * 1024) throw new Error("Hasil provider tidak lolos validasi file.");
      const file = new File([image.bytes as BlobPart], image.filename, { type: image.mimeType });
      const stored = await storage.put(file, session.user.id);
      const result = await prisma.$transaction(async (tx) => {
        const media = await tx.mediaAsset.create({ data: { ownerId: session.user.id, eventId, filename: image.filename, mimeType: image.mimeType, size: image.bytes.byteLength, url: stored.url, width: image.width, height: image.height, alt: `Hasil AI: ${input.purpose}` } });
        const pageAsset = await tx.pageAsset.create({ data: { pageId: page.id, mediaAssetId: media.id, name: `${input.purpose} AI`, purpose: input.purpose, metadata: { provider: generated.provider, prompt: input.prompt, license: generated.license, ...image.providerMetadata } } });
        return tx.aIGenerationResult.create({ data: { jobId: created.job.id, mediaAssetId: media.id, pageAssetId: pageAsset.id, url: media.url, mimeType: media.mimeType, width: media.width, height: media.height, metadata: { license: generated.license, provider: generated.provider } } });
      });
      results.push(result);
    }
    await prisma.aIGenerationJob.update({ where: { id: created.job.id }, data: { status: "COMPLETED", completedAt: new Date() } });
    await prisma.auditLog.create({ data: { actorId: session.user.id, eventId, action: "AI_IMAGE_GENERATED", entity: "AIGenerationJob", entityId: created.job.id, metadata: { pageId: page.id, purpose: input.purpose, resultCount: results.length } } });
    return NextResponse.json({ jobId: created.job.id, results }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generate gambar gagal.";
    if (jobId) await failGenerationJob(jobId, message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
