import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createGuestExportWorkbook } from "@/lib/guest-workbook";
import { assertEventOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await assertEventOwner(eventId, session.user.id);
    const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId }, select: { title: true, slug: true } });
    const guests = await prisma.guest.findMany({ where: { eventId, deletedAt: null }, include: { group: true, rsvp: true, checkIn: true }, orderBy: { name: "asc" } });
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin).replace(/\/$/, "");
    const workbook = createGuestExportWorkbook(event.title, guests.map((guest) => ({
      name: guest.name,
      groupName: guest.group?.name,
      phone: guest.phone,
      email: guest.email,
      seats: guest.seats,
      isVip: guest.isVip,
      rsvp: guest.rsvp?.status,
      checkedIn: Boolean(guest.checkIn),
      token: guest.token,
      invitationUrl: `${baseUrl}/i/${event.slug}/${guest.token}`,
      notes: guest.notes,
    })));
    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="daftar-tamu-dan-link.xlsx"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Ekspor belum dapat dibuat." }, { status: 403 });
  }
}
