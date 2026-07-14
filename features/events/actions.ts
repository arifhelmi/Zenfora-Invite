"use server";
import { EventStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertEventOwner, requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { sectionRegistry } from "@/lib/section-registry";
import { uniqueSlug } from "@/lib/utils";
import { eventSchema } from "@/lib/validation";

export async function createEventAction(_: { error?: string; ok?: string } | undefined, formData: FormData) {
  const parsed = eventSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Lengkapi tipe acara, tema, dan judul undangan." };
  const user = await requireUser();
  const slugBase = uniqueSlug(parsed.data.title);
  const event = await prisma.event.create({ data: { ownerId: user.id, eventTypeId: parsed.data.eventTypeId, themeId: parsed.data.themeId, title: parsed.data.title, slug: slugBase, startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : undefined, locationName: parsed.data.locationName || null, locationAddress: parsed.data.locationAddress || null, sections: { create: sectionRegistry.map(([key], position) => ({ key, position, enabled: true })) } } });
  await prisma.auditLog.create({ data: { actorId: user.id, eventId: event.id, action: "EVENT_CREATED", entity: "Event", entityId: event.id } });
  redirect(`/dashboard/events/${event.id}`);
  return {};
}

export async function updateEventAction(eventId: string, _: { error?: string; ok?: string } | undefined, formData: FormData) {
  const user = await requireUser(); await assertEventOwner(eventId, user.id);
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 3) return { error: "Judul harus minimal 3 karakter." };
  const musicUrl = String(formData.get("musicUrl") ?? "").trim();
  const musicTitle = String(formData.get("musicTitle") ?? "").trim();
  if (musicTitle.length > 100) return { error: "Judul lagu maksimal 100 karakter." };
  if (musicUrl) {
    try {
      const url = new URL(musicUrl);
      if (!['http:', 'https:'].includes(url.protocol)) return { error: "URL lagu harus menggunakan http atau https." };
    } catch {
      return { error: "URL lagu tidak valid." };
    }
  }
  const current = await prisma.event.findUniqueOrThrow({ where: { id: eventId }, select: { details: true } });
  const details = current.details && typeof current.details === "object" && !Array.isArray(current.details) ? current.details as Record<string, unknown> : {};
  await prisma.event.update({ where: { id: eventId }, data: { title, description: String(formData.get("description") ?? "") || null, startsAt: formData.get("startsAt") ? new Date(String(formData.get("startsAt"))) : null, locationName: String(formData.get("locationName") ?? "") || null, locationAddress: String(formData.get("locationAddress") ?? "") || null, details: { ...details, music: musicUrl ? { url: musicUrl, title: musicTitle || null } : null } } });
  revalidatePath(`/dashboard/events/${eventId}`); revalidatePath(`/i/[eventSlug]`, "page");
  return { ok: "Perubahan disimpan." };
}

export async function selectThemeAction(eventId: string, themeId: string) { const user = await requireUser(); await assertEventOwner(eventId, user.id); await prisma.event.update({ where: { id: eventId }, data: { themeId } }); await prisma.auditLog.create({ data: { actorId: user.id, eventId, action: "THEME_CHANGED", entity: "Event", entityId: eventId, metadata: { themeId } } }); revalidatePath(`/dashboard/events/${eventId}/design`); }
export async function publishEventAction(eventId: string) { const user = await requireUser(); await assertEventOwner(eventId, user.id); const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId }, include: { package: true } }); if (!event.package) throw new Error("Pilih paket sebelum menerbitkan undangan."); await prisma.event.update({ where: { id: eventId }, data: { status: EventStatus.PUBLISHED, packageExpiresAt: new Date(Date.now() + event.package.activeDays * 86400000), maxGuests: event.package.guestLimit } }); await prisma.auditLog.create({ data: { actorId: user.id, eventId, action: "EVENT_PUBLISHED", entity: "Event", entityId: eventId } }); revalidatePath(`/dashboard/events/${eventId}`); }

export async function reorderSectionsAction(eventId: string, keys: string[]) {
  const user = await requireUser();
  await assertEventOwner(eventId, user.id);
  const supportedKeys = sectionRegistry.map(([key]) => key);
  if (keys.length !== supportedKeys.length || new Set(keys).size !== keys.length || keys.some((key) => !supportedKeys.includes(key as typeof supportedKeys[number]))) throw new Error("Urutan section tidak valid.");
  await prisma.$transaction(keys.map((key, position) => prisma.eventSection.update({ where: { eventId_key: { eventId, key } }, data: { position } })));
  revalidatePath(`/dashboard/events/${eventId}/content`);
  revalidatePath(`/dashboard/events/${eventId}/preview`);
}
export async function toggleSectionAction(eventId: string, key: string, enabled: boolean) {
  const user = await requireUser();
  await assertEventOwner(eventId, user.id);
  if (!sectionRegistry.some(([registeredKey]) => registeredKey === key)) throw new Error("Section tidak valid.");
  await prisma.eventSection.update({ where: { eventId_key: { eventId, key } }, data: { enabled } });
  revalidatePath(`/dashboard/events/${eventId}/content`);
  revalidatePath(`/dashboard/events/${eventId}/preview`);
}

type CouplePersonInput = { id?: string; name: string; role: string; photoUrl?: string | null };

export async function saveCouplePeopleAction(eventId: string, people: CouplePersonInput[]) {
  const user = await requireUser();
  await assertEventOwner(eventId, user.id);
  if (!Array.isArray(people) || people.length !== 2) throw new Error("Lengkapi dua profil mempelai.");
  const normalized = people.map((person) => ({
    id: person.id,
    name: person.name.trim(),
    role: person.role.trim() || "Mempelai",
    photoUrl: person.photoUrl?.trim() || null
  }));
  if (normalized.some((person) => person.name.length < 2 || person.name.length > 100 || person.role.length > 80)) throw new Error("Nama mempelai harus terdiri dari 2–100 karakter.");

  const existing = await prisma.eventPerson.findMany({ where: { eventId }, select: { id: true } });
  const existingIds = new Set(existing.map((person) => person.id));
  if (normalized.some((person) => person.id && !existingIds.has(person.id))) throw new Error("Profil mempelai tidak valid.");

  await prisma.$transaction(normalized.map((person, position) => person.id
    ? prisma.eventPerson.update({ where: { id: person.id }, data: { name: person.name, role: person.role, photoUrl: person.photoUrl, position } })
    : prisma.eventPerson.create({ data: { eventId, name: person.name, role: person.role, photoUrl: person.photoUrl, position } })
  ));
  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/dashboard/events/${eventId}/preview`);
  revalidatePath(`/i/[eventSlug]`, "page");
}
