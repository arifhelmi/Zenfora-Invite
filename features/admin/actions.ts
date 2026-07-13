"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
export async function moderateWishAction(wishId: string, status: "APPROVED" | "REJECTED") { const user = await requireRole("ADMIN", "SUPER_ADMIN"); const wish = await prisma.wish.update({ where: { id: wishId }, data: { status } }); await prisma.auditLog.create({ data: { actorId: user.id, eventId: wish.eventId, action: `WISH_${status}`, entity: "Wish", entityId: wish.id } }); revalidatePath("/admin/wishes"); }
export async function toggleThemeAction(themeId: string, isActive: boolean) { await requireRole("ADMIN", "SUPER_ADMIN"); await prisma.theme.update({ where: { id: themeId }, data: { isActive } }); revalidatePath("/admin/themes"); }
export async function togglePackageAction(packageId: string, isActive: boolean) { await requireRole("SUPER_ADMIN"); await prisma.package.update({ where: { id: packageId }, data: { isActive } }); revalidatePath("/admin/packages"); }
