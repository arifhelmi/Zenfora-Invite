import Link from "next/link";
import { CoupleEditor } from "@/components/dashboard/couple-editor";
import { EventDetailsForm, PublishButton } from "@/components/dashboard/event-forms";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EventOverview({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    include: {
      eventType: true,
      theme: true,
      package: true,
      people: { select: { id: true, name: true, role: true, photoUrl: true }, orderBy: { position: "asc" }, take: 2 },
      _count: { select: { guests: true, rsvps: true, wishes: true, checkIns: true } }
    }
  });
  const details = event.details && typeof event.details === "object" && !Array.isArray(event.details) ? event.details as Record<string, unknown> : {};
  const music = details.music && typeof details.music === "object" && !Array.isArray(details.music) ? details.music as Record<string, unknown> : {};

  return <>
    <div className="flex flex-wrap items-start justify-between gap-5">
      <div><p className="eyebrow">{event.status}</p><h1 className="mt-1 text-3xl font-bold">{event.title}</h1><p className="mt-2 text-slate-600">{event.eventType.name} · {event.theme?.name ?? "Tema belum dipilih"} · {formatDate(event.startsAt)}</p></div>
      <div className="flex gap-2"><Link className="button secondary" href={`/dashboard/events/${event.id}/preview`} target="_blank">Buka preview ↗</Link><PublishButton eventId={event.id} disabled={!event.package || event.status === "PUBLISHED"} /></div>
    </div>
    {!event.package && <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Pilih paket dan lakukan pembayaran mock untuk menerbitkan undangan. <Link className="font-bold underline" href={`/dashboard/events/${eventId}/design`}>Pilih desain/paket</Link></div>}
    <div className="mt-7 grid gap-4 sm:grid-cols-4">{[["Tamu", event._count.guests], ["RSVP", event._count.rsvps], ["Ucapan", event._count.wishes], ["Check-in", event._count.checkIns]].map(([label, value]) => <div className="card p-4" key={label as string}><p className="text-sm text-slate-500">{label as string}</p><p className="text-2xl font-bold">{value as number}</p></div>)}</div>
    <h2 className="mt-8 text-lg font-bold">Informasi inti</h2><div className="mt-3 max-w-2xl"><EventDetailsForm event={{ ...event, musicUrl: typeof music.url === "string" ? music.url : undefined, musicTitle: typeof music.title === "string" ? music.title : undefined }} /></div>
    <section className="mt-10 max-w-3xl"><p className="eyebrow">Mempelai</p><h2 className="mt-1 text-2xl font-bold">Foto dan profil mempelai</h2><div className="card mt-4 p-5 sm:p-6"><CoupleEditor eventId={event.id} people={event.people} /></div></section>
  </>;
}
