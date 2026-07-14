import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { InvitationRenderer } from "@/components/invitation/renderer";
import { BuilderInvitationRenderer } from "@/components/invitation/builder-renderer";
import type { BuilderPage } from "@/features/builder/types";
import { createSeoMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ eventSlug: string; guestToken: string }> }) {
  const { eventSlug } = await params;
  const event = await prisma.event.findUnique({ where: { slug: eventSlug }, select: { title: true, description: true, coverImageUrl: true } });
  return createSeoMetadata({
    title: event?.title ?? "Undangan Personal",
    description: event?.description ?? "Undangan digital personal.",
    path: `/i/${eventSlug}`,
    image: event?.coverImageUrl ?? "/og.png",
    noIndex: true,
  });
}
export default async function GuestInvitationPage({ params }: { params: Promise<{ eventSlug: string; guestToken: string }> }) { const { eventSlug, guestToken } = await params; const event = await prisma.event.findFirst({ where: { slug: eventSlug, status: "PUBLISHED" }, include: { theme: { include: { versions: true } }, people: { orderBy: { position: "asc" } }, schedules: { orderBy: { position: "asc" } }, sections: { orderBy: { position: "asc" } }, wishes: { where: { status: "APPROVED" }, select: { id: true, author: true, message: true }, take: 20 }, invitation: { include: { pages: { include: { blocks: { orderBy: { order: "asc" } }, assets: { include: { mediaAsset: { select: { id: true, url: true, width: true, height: true } } } } }, orderBy: { order: "asc" } } } } } }); const guest = event && await prisma.guest.findFirst({ where: { eventId: event.id, token: guestToken, deletedAt: null } }); if (!event || (!event.theme && !event.invitation?.pages.length) || !guest) notFound(); await prisma.invitationVisit.create({ data: { eventId: event.id, guestId: guest.id, day: new Date() } }); const qr = await QRCode.toDataURL(guestToken, { width: 180, margin: 1 }); const personalGuest = { token: guest.token, name: guest.name, seats: guest.seats }; return <>{event.invitation?.pages.length ? <BuilderInvitationRenderer pages={event.invitation.pages as unknown as BuilderPage[]} event={event} guest={personalGuest} /> : <InvitationRenderer theme={event.theme!} event={event} guest={personalGuest} />}<div className="fixed bottom-4 right-4 rounded-xl bg-white p-2 shadow-lg"><img src={qr} width="80" height="80" alt="QR token tamu" /><span className="visually-hidden">QR token untuk check-in</span></div></>; }
