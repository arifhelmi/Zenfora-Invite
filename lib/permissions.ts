import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { canAccessEvent } from "@/lib/access";

export type AppRole = "SUPER_ADMIN" | "ADMIN" | "CUSTOMER";
export { canAccessEvent } from "@/lib/access";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

export async function requireRole(...roles: AppRole[]) {
  const user = await requireUser();
  if (!user.role || !roles.includes(user.role as AppRole)) redirect("/dashboard");
  return user;
}

export async function assertEventOwner(eventId: string, userId?: string) {
  const actor = userId ? { id: userId, role: "CUSTOMER" } : await requireUser();
  const event = await prisma.event.findFirst({ where: { id: eventId, deletedAt: null }, select: { id: true, ownerId: true } });
  if (!event || !canAccessEvent(event.ownerId, actor.id, actor.role)) {
    throw new Error("Anda tidak memiliki akses ke undangan ini.");
  }
  return event;
}
