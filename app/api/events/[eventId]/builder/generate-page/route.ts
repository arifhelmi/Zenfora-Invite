import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assertEventOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { createGenerationJob, failGenerationJob } from "@/features/builder/credits";
import { generateStructuredPage, generateStructuredPatch } from "@/features/builder/ai-page-generator";
import { generatePageRequestSchema } from "@/features/builder/validation";

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await assertEventOwner(eventId, session.user.id);
    if (!rateLimit(`ai-page:${session.user.id}`, 12, 60_000)) return NextResponse.json({ error: "Terlalu banyak permintaan AI. Coba kembali sebentar lagi." }, { status: 429 });
    const input = generatePageRequestSchema.parse(await request.json());
    const idempotencyKey = request.headers.get("Idempotency-Key") ?? `page:${crypto.randomUUID()}`;
    const created = await createGenerationJob({ userId: session.user.id, eventId, pageId: input.pageId, kind: input.mode === "edit" ? "PAGE_EDIT" : "PAGE_CREATE", provider: "mock-structured", payload: input, idempotencyKey });
    if (created.existing && created.job.status === "COMPLETED") return NextResponse.json({ error: "Permintaan ini sudah diproses. Silakan kirim ulang untuk preview baru." }, { status: 409 });
    const result = input.mode === "edit"
      ? generateStructuredPatch(input.prompt, (await prisma.pageBlock.findMany({ where: { pageId: input.pageId, page: { invitation: { eventId } } }, select: { id: true } })).map((block) => block.id))
      : generateStructuredPage(input.prompt);
    await prisma.aIGenerationJob.update({ where: { id: created.job.id }, data: { status: "COMPLETED", completedAt: new Date() } });
    await prisma.auditLog.create({ data: { actorId: session.user.id, eventId, action: input.mode === "edit" ? "AI_PAGE_PATCH_GENERATED" : "AI_PAGE_GENERATED", entity: "AIGenerationJob", entityId: created.job.id, metadata: { pageId: input.pageId } } });
    return NextResponse.json({ jobId: created.job.id, mode: input.mode, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generate halaman gagal.";
    const key = request.headers.get("Idempotency-Key");
    if (key) { const job = await prisma.aIGenerationJob.findUnique({ where: { idempotencyKey: key } }); if (job) await failGenerationJob(job.id, message); }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
