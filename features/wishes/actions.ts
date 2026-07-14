"use server";
import sanitizeHtml from "sanitize-html";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { wishSchema } from "@/lib/validation";

export async function submitWishAction(eventSlug: string, guestToken: string | undefined, _: { error?: string; ok?: string } | undefined, formData: FormData) { const parsed = wishSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) return { error: "Nama dan ucapan harus diisi." }; const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "local"; if (!rateLimit(`wish:${ip}`)) return { error: "Terlalu banyak ucapan. Coba kembali sebentar lagi." }; const event = await prisma.event.findFirst({ where: { slug: eventSlug, status: "PUBLISHED" } }); if (!event) return { error: "Undangan tidak tersedia." }; const guest = guestToken ? await prisma.guest.findFirst({ where: { eventId: event.id, token: guestToken } }) : null; await prisma.wish.create({ data: { eventId: event.id, guestId: guest?.id, author: sanitizeHtml(parsed.data.author, { allowedTags: [], allowedAttributes: {} }), message: sanitizeHtml(parsed.data.message, { allowedTags: [], allowedAttributes: {} }) } }); revalidatePath(`/i/${eventSlug}`); return { ok: "Ucapan Anda dikirim dan menunggu moderasi." }; }
