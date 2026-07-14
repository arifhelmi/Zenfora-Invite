import { prisma } from "@/lib/prisma";

export async function getAICreditStatus(userId: string, eventId: string, provider = process.env.AI_IMAGE_PROVIDER ?? "mock") {
  const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId }, select: { package: { select: { aiMonthlyCredits: true } } } });
  const config = await prisma.aIProviderConfiguration.findUnique({ where: { provider } });
  const monthlyLimit = event.package?.aiMonthlyCredits ?? 10;
  const start = new Date();
  start.setUTCDate(1); start.setUTCHours(0, 0, 0, 0);
  const aggregate = await prisma.aIUsage.aggregate({ where: { userId, eventId, status: "DEBITED", createdAt: { gte: start } }, _sum: { credits: true } });
  const used = aggregate._sum.credits ?? 0;
  const isMock = provider.startsWith("mock");
  const cost = isMock ? 0 : config?.creditCost ?? 1;
  return { provider, cost, monthlyLimit, used, remaining: Math.max(0, monthlyLimit - used), isMock };
}

export async function createGenerationJob(input: { userId: string; eventId: string; pageId?: string; kind: string; provider: string; payload: unknown; idempotencyKey: string }) {
  const existing = await prisma.aIGenerationJob.findUnique({ where: { idempotencyKey: input.idempotencyKey }, include: { results: true } });
  if (existing) return { job: existing, existing: true };
  const credits = await getAICreditStatus(input.userId, input.eventId, input.provider);
  if (credits.cost > credits.remaining) throw new Error("Kredit AI bulan ini tidak mencukupi.");
  const job = await prisma.$transaction(async (tx) => {
    const created = await tx.aIGenerationJob.create({ data: { userId: input.userId, eventId: input.eventId, pageId: input.pageId, provider: input.provider, kind: input.kind, status: "RUNNING", input: input.payload as never, creditCost: credits.cost, idempotencyKey: input.idempotencyKey, startedAt: new Date() } });
    await tx.aIUsage.create({ data: { userId: input.userId, eventId: input.eventId, jobId: created.id, credits: credits.cost, status: credits.cost === 0 ? "FREE" : "DEBITED", idempotencyKey: `usage:${input.idempotencyKey}`, metadata: { provider: input.provider, kind: input.kind } } });
    return created;
  });
  return { job: { ...job, results: [] }, existing: false };
}

export async function failGenerationJob(jobId: string, message: string) {
  await prisma.$transaction(async (tx) => {
    await tx.aIGenerationJob.update({ where: { id: jobId }, data: { status: "FAILED", errorMessage: message, completedAt: new Date() } });
    await tx.aIUsage.updateMany({ where: { jobId, status: "DEBITED" }, data: { status: "REFUNDED" } });
  });
}
