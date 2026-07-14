"use server";
import { revalidatePath } from "next/cache";
import { assertEventOwner, requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { createGuestToken } from "@/lib/tokens";
import { guestSchema } from "@/lib/validation";

export async function addGuestAction(eventId: string, _: { error?: string; ok?: string } | undefined, formData: FormData) { const user = await requireUser(); await assertEventOwner(eventId, user.id); const parsed = guestSchema.safeParse({ ...Object.fromEntries(formData), isVip: formData.get("isVip") === "on" }); if (!parsed.success) return { error: "Data tamu belum valid." }; const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId }, include: { package: true, _count: { select: { guests: true } } } }); const limit = event.maxGuests ?? event.package?.guestLimit ?? 20; if (event._count.guests >= limit) return { error: `Batas paket Anda adalah ${limit} tamu.` }; await prisma.guest.create({ data: { eventId, name: parsed.data.name, email: parsed.data.email || null, phone: parsed.data.phone || null, seats: parsed.data.seats, isVip: parsed.data.isVip, token: createGuestToken() } }); revalidatePath(`/dashboard/events/${eventId}/guests`); return { ok: "Tamu ditambahkan." }; }
export async function deleteGuestAction(eventId: string, guestId: string) { const user = await requireUser(); await assertEventOwner(eventId, user.id); await prisma.guest.update({ where: { id: guestId, eventId }, data: { deletedAt: new Date() } }); revalidatePath(`/dashboard/events/${eventId}/guests`); }
