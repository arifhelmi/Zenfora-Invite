import { NewEventForm } from "@/components/dashboard/event-forms";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function NewEventPage() { const [types, themes] = await Promise.all([prisma.eventType.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }), prisma.theme.findMany({ where: { isActive: true }, select: { id: true, name: true, isPremium: true }, orderBy: { isPremium: "asc" } })]); return <><p className="eyebrow">Wizard undangan · langkah 1–3</p><h1 className="mt-1 text-3xl font-bold">Mulai dari informasi inti</h1><p className="mt-2 text-slate-600">Anda dapat melengkapi profil, jadwal, media, dan section setelah draf dibuat.</p><NewEventForm types={types} themes={themes} /></>; }
