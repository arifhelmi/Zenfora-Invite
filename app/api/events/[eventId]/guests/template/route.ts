import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createGuestTemplateWorkbook } from "@/lib/guest-workbook";
import { assertEventOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await assertEventOwner(eventId, session.user.id);
    const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId }, select: { title: true } });
    const workbook = createGuestTemplateWorkbook(event.title);
    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="template-daftar-tamu-200.xlsx"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Template belum dapat dibuat." }, { status: 403 });
  }
}
