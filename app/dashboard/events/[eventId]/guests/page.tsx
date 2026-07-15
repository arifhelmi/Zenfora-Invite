import { GuestForm } from "@/components/dashboard/event-forms";
import { GuestBulkTools, GuestLinkActions } from "@/components/dashboard/guest-manager";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function GuestsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId }, select: { slug: true, maxGuests: true, package: { select: { guestLimit: true } } } });
  const guests = await prisma.guest.findMany({ where: { eventId, deletedAt: null }, include: { group: true, rsvp: true, checkIn: true }, orderBy: { name: "asc" } });
  const limit = event.maxGuests ?? event.package?.guestLimit ?? 20;
  const totalSeats = guests.reduce((total, guest) => total + guest.seats, 0);
  const responded = guests.filter((guest) => guest.rsvp).length;
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

  return <>
    <p className="eyebrow">Buku tamu digital</p>
    <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-3xl font-bold">Satu tamu, satu link personal</h1><p className="mt-2 max-w-2xl text-slate-600">Nama seperti “Andi dan Keluarga” akan tampil langsung pada sampul undangan dan dapat dibagikan melalui WhatsApp.</p></div>
      <div className="rounded-full bg-emerald-950 px-4 py-2 text-sm font-bold text-white">{guests.length} / {limit} link</div>
    </div>
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      {[{ label: "Undangan dibuat", value: guests.length }, { label: "Kapasitas kursi", value: totalSeats }, { label: "Sudah merespons", value: responded }].map((item) => <article className="card p-4" key={item.label}><p className="text-xs font-bold uppercase tracking-[.14em] text-slate-500">{item.label}</p><p className="mt-2 text-3xl font-bold text-emerald-950">{item.value}</p></article>)}
    </div>
    <div className="mt-7 grid items-start gap-6 xl:grid-cols-[380px_1fr]">
      <div className="grid gap-5"><GuestBulkTools eventId={eventId} currentCount={guests.length} limit={limit} /><GuestForm eventId={eventId} /></div>
      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-bold">Pusat link undangan</h2><p className="mt-1 text-sm text-slate-500">Salin satu per satu, buka untuk preview, kirim WhatsApp, atau ekspor semuanya ke Excel.</p></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-210 text-left text-sm">
            <thead className="border-b bg-stone-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="p-3">Nama pada undangan</th><th className="p-3">Grup</th><th className="p-3">Kursi</th><th className="p-3">RSVP</th><th className="p-3">Link personal</th></tr></thead>
            <tbody>{guests.map((guest) => {
              const invitationUrl = `${baseUrl}/i/${event.slug}/${guest.token}`;
              return <tr className="border-b border-slate-100 align-top last:border-0" key={guest.id}><td className="p-3"><p className="font-semibold text-slate-900">{guest.name}{guest.isVip && <span className="ml-2 status">VIP</span>}</p><p className="mt-1 max-w-52 truncate text-xs text-slate-400" title={invitationUrl}>{invitationUrl}</p></td><td className="p-3 text-slate-600">{guest.group?.name ?? "—"}</td><td className="p-3 font-semibold">{guest.seats}</td><td className="p-3">{guest.rsvp?.status ?? "Belum"}</td><td className="p-3"><GuestLinkActions url={invitationUrl} guestName={guest.name} phone={guest.phone} /></td></tr>;
            })}</tbody>
          </table>
          {guests.length === 0 && <div className="p-8 text-center"><p className="font-semibold text-slate-700">Belum ada link tamu.</p><p className="mt-1 text-sm text-slate-500">Tambahkan satu tamu atau impor daftar Excel di sebelah kiri.</p></div>}
        </div>
      </div>
    </div>
  </>;
}
