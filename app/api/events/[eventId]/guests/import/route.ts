import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import ExcelJS from "exceljs";
import { auth } from "@/lib/auth";
import { normalizeGuestRecords, readGuestWorksheet } from "@/lib/guest-spreadsheet";
import { assertEventOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { createGuestToken } from "@/lib/tokens";

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await assertEventOwner(eventId, session.user.id);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size > 5_000_000) return NextResponse.json({ error: "Unggah file Excel atau CSV maksimal 5 MB." }, { status: 400 });
    const extension = file.name.toLowerCase().split(".").pop();
    if (!extension || !["xlsx", "csv"].includes(extension)) return NextResponse.json({ error: "Format yang didukung adalah .xlsx dan .csv." }, { status: 400 });

    const rows = extension === "xlsx"
      ? await (async () => {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(await file.arrayBuffer());
          const worksheet = workbook.worksheets[0];
          if (!worksheet) throw new Error("Workbook tidak memiliki worksheet.");
          return readGuestWorksheet(worksheet);
        })()
      : normalizeGuestRecords(parse(await file.text(), { columns: true, skip_empty_lines: true, trim: true }) as Array<Record<string, unknown>>);

    if (!rows.length) return NextResponse.json({ error: "Tidak ada Nama Undangan yang dapat diimpor." }, { status: 400 });
    if (rows.length > 500) return NextResponse.json({ error: "Maksimal 500 undangan per impor." }, { status: 400 });

    const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId }, select: { maxGuests: true, package: { select: { guestLimit: true } } } });
    const currentGuests = await prisma.guest.count({ where: { eventId, deletedAt: null } });
    const limit = event.maxGuests ?? event.package?.guestLimit ?? 20;
    const remaining = Math.max(0, limit - currentGuests);
    if (rows.length > remaining) return NextResponse.json({ error: `File berisi ${rows.length} undangan, sedangkan sisa kapasitas paket hanya ${remaining}.` }, { status: 400 });

    await prisma.$transaction(async (transaction) => {
      const groupNames = [...new Set(rows.map((row) => row.groupName).filter((name): name is string => Boolean(name)))];
      if (groupNames.length) await transaction.guestGroup.createMany({ data: groupNames.map((name) => ({ eventId, name })), skipDuplicates: true });
      const groups = groupNames.length ? await transaction.guestGroup.findMany({ where: { eventId, name: { in: groupNames } }, select: { id: true, name: true } }) : [];
      const groupIds = new Map(groups.map((group) => [group.name, group.id]));
      await transaction.guest.createMany({
        data: rows.map((row) => ({
          eventId,
          groupId: row.groupName ? groupIds.get(row.groupName) : undefined,
          name: row.name,
          phone: row.phone,
          email: row.email,
          seats: row.seats,
          isVip: row.isVip,
          notes: row.notes,
          token: createGuestToken(),
        })),
      });
    });

    return NextResponse.json({ imported: rows.length, remaining: remaining - rows.length });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal mengimpor tamu." }, { status: 400 });
  }
}
