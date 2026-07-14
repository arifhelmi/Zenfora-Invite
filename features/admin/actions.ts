"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
export async function moderateWishAction(wishId: string, status: "APPROVED" | "REJECTED") { const user = await requireRole("ADMIN", "SUPER_ADMIN"); const wish = await prisma.wish.update({ where: { id: wishId }, data: { status } }); await prisma.auditLog.create({ data: { actorId: user.id, eventId: wish.eventId, action: `WISH_${status}`, entity: "Wish", entityId: wish.id } }); revalidatePath("/admin/wishes"); }
export async function toggleThemeAction(themeId: string, isActive: boolean) { await requireRole("ADMIN", "SUPER_ADMIN"); await prisma.theme.update({ where: { id: themeId }, data: { isActive } }); revalidatePath("/admin/themes"); }
export async function togglePackageAction(packageId: string, isActive: boolean) { await requireRole("SUPER_ADMIN"); await prisma.package.update({ where: { id: packageId }, data: { isActive } }); revalidatePath("/admin/packages"); }

export async function updateAIProviderAction(_: { error?: string; ok?: string } | undefined, formData: FormData) {
  await requireRole("SUPER_ADMIN");
  const parsed = z.object({ provider: z.string().regex(/^[a-z0-9-]+$/).max(40), displayName: z.string().trim().min(2).max(80), creditCost: z.coerce.number().int().min(0).max(1000), isEnabled: z.boolean() }).safeParse({ ...Object.fromEntries(formData), isEnabled: formData.get("isEnabled") === "on" });
  if (!parsed.success) return { error: "Konfigurasi provider belum valid." };
  await prisma.aIProviderConfiguration.upsert({ where: { provider: parsed.data.provider }, update: { displayName: parsed.data.displayName, creditCost: parsed.data.creditCost, isEnabled: parsed.data.isEnabled }, create: { ...parsed.data, configuration: { adapter: parsed.data.provider, secrets: "environment-only" } } });
  revalidatePath("/admin/settings");
  return { ok: "Biaya kredit provider diperbarui." };
}

export async function updatePackageAIQuotaAction(packageId: string, _: { error?: string; ok?: string } | undefined, formData: FormData) {
  await requireRole("SUPER_ADMIN");
  const parsed = z.object({ aiMonthlyCredits: z.coerce.number().int().min(0).max(100000), pageVersionLimit: z.coerce.number().int().min(1).max(1000) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Kuota AI atau batas versi belum valid." };
  await prisma.package.update({ where: { id: packageId }, data: parsed.data });
  revalidatePath("/admin/packages");
  return { ok: "Kuota builder diperbarui." };
}
