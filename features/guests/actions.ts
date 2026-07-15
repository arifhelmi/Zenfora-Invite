"use server";
import { revalidatePath } from "next/cache";
import { assertEventOwner, requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { createGuestToken } from "@/lib/tokens";
import { guestSchema } from "@/lib/validation";

export async function addGuestAction(eventId: string, _: { error?: string; ok?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  await assertEventOwner(eventId, user.id);
  const parsed = guestSchema.safeParse({ ...Object.fromEntries(formData), isVip: formData.get("isVip") === "on" });
  if (!parsed.success) return { error: "Data tamu belum valid." };
  const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId }, include: { package: true } });
  const currentGuests = await prisma.guest.count({ where: { eventId, deletedAt: null } });
  const limit = event.maxGuests ?? event.package?.guestLimit ?? 20;
  if (currentGuests >= limit) return { error: `Batas paket Anda adalah ${limit} tamu.` };
  const group = parsed.data.groupName
    ? await prisma.guestGroup.upsert({ where: { eventId_name: { eventId, name: parsed.data.groupName } }, update: {}, create: { eventId, name: parsed.data.groupName } })
    : null;
  await prisma.guest.create({ data: { eventId, groupId: group?.id, name: parsed.data.name, email: parsed.data.email || null, phone: parsed.data.phone || null, seats: parsed.data.seats, isVip: parsed.data.isVip, notes: parsed.data.notes || null, token: createGuestToken() } });
  revalidatePath(`/dashboard/events/${eventId}/guests`);
  return { ok: "Tamu dan link personal berhasil dibuat." };
}
export async function deleteGuestAction(eventId: string, guestId: string) { const user = await requireUser(); await assertEventOwner(eventId, user.id); await prisma.guest.update({ where: { id: guestId, eventId }, data: { deletedAt: new Date() } }); revalidatePath(`/dashboard/events/${eventId}/guests`); }
