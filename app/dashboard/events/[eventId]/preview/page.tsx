import Link from "next/link";
import { InvitationRenderer } from "@/components/invitation/renderer";
import { BuilderInvitationRenderer } from "@/components/invitation/builder-renderer";
import type { BuilderPage } from "@/features/builder/types";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EventPreviewPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    include: {
      theme: { include: { versions: true } },
      people: { orderBy: { position: "asc" } },
      schedules: { orderBy: { position: "asc" } },
      sections: { orderBy: { position: "asc" } },
      wishes: { where: { status: "APPROVED" }, select: { id: true, author: true, message: true }, take: 20, orderBy: { createdAt: "desc" } },
      invitation: { include: { pages: { include: { blocks: { orderBy: { order: "asc" } }, assets: { include: { mediaAsset: { select: { id: true, url: true, width: true, height: true } } } } }, orderBy: { order: "asc" } } } }
    }
  });

  if (!event.theme && !event.invitation?.pages.length) return <main className="card p-6"><p>Pilih tema atau buat halaman dengan AI Page Builder sebelum melihat preview.</p><div className="mt-4 flex gap-2"><Link className="button" href={`/dashboard/events/${eventId}/builder`}>Buka Page Builder</Link><Link className="button secondary" href={`/dashboard/events/${eventId}/design`}>Pilih tema</Link></div></main>;

  return <main>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
      <p><strong>Mode preview.</strong> Draf ini hanya dapat dilihat oleh Anda dan belum dibuka untuk tamu.</p>
      <Link className="button secondary text-sm" href={event.invitation?.pages.length ? `/dashboard/events/${eventId}/builder` : `/dashboard/events/${eventId}`}>Kembali ke editor</Link>
    </div>
    {event.invitation?.pages.length
      ? <BuilderInvitationRenderer pages={event.invitation.pages as unknown as BuilderPage[]} event={event} isPreview />
      : event.theme && <InvitationRenderer theme={event.theme} event={event} isPreview />}
  </main>;
}
