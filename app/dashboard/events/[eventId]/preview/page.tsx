import Link from "next/link";
import { InvitationRenderer } from "@/components/invitation/renderer";
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
      wishes: { where: { status: "APPROVED" }, select: { id: true, author: true, message: true }, take: 20, orderBy: { createdAt: "desc" } }
    }
  });

  if (!event.theme) return <main className="card p-6"><p>Pilih tema terlebih dahulu sebelum melihat preview.</p><Link className="button mt-4" href={`/dashboard/events/${eventId}/design`}>Pilih tema</Link></main>;

  return <main>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
      <p><strong>Mode preview.</strong> Draf ini hanya dapat dilihat oleh Anda dan belum dibuka untuk tamu.</p>
      <Link className="button secondary text-sm" href={`/dashboard/events/${eventId}`}>Kembali ke editor</Link>
    </div>
    <InvitationRenderer theme={event.theme} event={event} isPreview />
  </main>;
}
