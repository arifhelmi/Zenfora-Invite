import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InvitationRenderer } from "@/components/invitation/renderer";
import { BuilderInvitationRenderer } from "@/components/invitation/builder-renderer";
import type { BuilderPage } from "@/features/builder/types";
import { createSeoMetadata, truncateSeo } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ eventSlug: string }> }) {
  const { eventSlug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    select: {
      title: true,
      description: true,
      status: true,
      visibility: true,
      startsAt: true,
      locationName: true,
      coverImageUrl: true,
      people: { orderBy: { position: "asc" }, take: 2, select: { name: true, photoUrl: true } },
    },
  });

  const noIndex = !event || event.status !== "PUBLISHED" || event.visibility === "PRIVATE";
  const names = event?.people.map((person) => person.name).filter(Boolean).join(" & ");
  const eventDate = event?.startsAt
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeZone: "Asia/Jakarta" }).format(event.startsAt)
    : null;
  const description = truncateSeo(
    event?.description ??
      [
        names ? `Undangan digital ${names}` : "Undangan digital",
        eventDate ? `pada ${eventDate}` : null,
        event?.locationName ? `di ${event.locationName}` : null,
        "Lengkap dengan detail acara, RSVP, lokasi, galeri, dan ucapan doa.",
      ]
        .filter(Boolean)
        .join(" "),
  );
  const image = event?.coverImageUrl ?? event?.people.find((person) => person.photoUrl)?.photoUrl ?? "/og.png";

  return createSeoMetadata({
    title: event?.title ?? "Undangan Digital",
    description,
    path: `/i/${eventSlug}`,
    image,
    noIndex,
  });
}
export default async function InvitationPage({ params }: { params: Promise<{ eventSlug: string }> }) { const { eventSlug } = await params; const event = await prisma.event.findFirst({ where: { slug: eventSlug, status: "PUBLISHED", visibility: "PUBLIC" }, include: { theme: { include: { versions: true } }, people: { orderBy: { position: "asc" } }, schedules: { orderBy: { position: "asc" } }, sections: { orderBy: { position: "asc" } }, wishes: { where: { status: "APPROVED" }, select: { id: true, author: true, message: true }, take: 20, orderBy: { createdAt: "desc" } }, invitation: { include: { pages: { include: { blocks: { orderBy: { order: "asc" } }, assets: { include: { mediaAsset: { select: { id: true, url: true, width: true, height: true } } } } }, orderBy: { order: "asc" } } } } } }); if (!event || (!event.theme && !event.invitation?.pages.length)) notFound(); await prisma.invitationVisit.create({ data: { eventId: event.id, day: new Date() } }); return event.invitation?.pages.length ? <BuilderInvitationRenderer pages={event.invitation.pages as unknown as BuilderPage[]} event={event} /> : <InvitationRenderer theme={event.theme!} event={event} />; }
