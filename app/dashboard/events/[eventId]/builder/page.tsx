import { InvitationBuilder } from "@/components/builder/invitation-builder";
import { ensureBuilderDocument } from "@/features/builder/service";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BuilderPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const [event, document] = await Promise.all([
    prisma.event.findUniqueOrThrow({ where: { id: eventId }, select: { id: true, title: true, slug: true, description: true, startsAt: true, locationName: true, locationAddress: true, locationUrl: true, people: { orderBy: { position: "asc" }, select: { name: true, role: true, bio: true, photoUrl: true } }, schedules: { orderBy: { position: "asc" }, select: { title: true, startsAt: true, location: true } }, wishes: { where: { status: "APPROVED" }, orderBy: { createdAt: "desc" }, take: 8, select: { id: true, author: true, message: true } } } }),
    ensureBuilderDocument(eventId),
  ]);
  return <InvitationBuilder event={event} initialDocument={JSON.parse(JSON.stringify(document))} />;
}
