"use server";
import { revalidatePath } from "next/cache";
import { assertEventOwner, requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function checkInGuestAction(eventId: string, guestToken: string) { const user = await requireUser(); await assertEventOwner(eventId, user.id); const guest = await prisma.guest.findFirst({ where: { eventId, token: guestToken, deletedAt: null }, include: { rsvp: true, checkIn: true } }); if (!guest) return { error: "Tamu tidak ditemukan." }; if (guest.checkIn) return { error: `${guest.name} sudah check-in.` }; if (guest.rsvp?.status === "DECLINED") return { error: `${guest.name} tercatat tidak hadir.` }; await prisma.checkIn.create({ data: { eventId, guestId: guest.id, method: "QR" } }); revalidatePath(`/dashboard/events/${eventId}/checkin`); return { ok: `${guest.name} berhasil check-in.` }; }
