import type { CellValue, Worksheet } from "exceljs";

export type ImportedGuest = {
  name: string;
  groupName: string | null;
  phone: string | null;
  email: string | null;
  seats: number;
  isVip: boolean;
  notes: string | null;
  sourceRow: number;
};

type GuestField = Exclude<keyof ImportedGuest, "sourceRow">;

const headerAliases: Record<string, GuestField> = {
  name: "name",
  nama: "name",
  "nama tamu": "name",
  "nama undangan": "name",
  "nama penerima": "name",
  "guest name": "name",
  group: "groupName",
  grup: "groupName",
  keluarga: "groupName",
  kelompok: "groupName",
  kategori: "groupName",
  phone: "phone",
  telepon: "phone",
  "telepon whatsapp": "phone",
  whatsapp: "phone",
  wa: "phone",
  "no whatsapp": "phone",
  "nomor whatsapp": "phone",
  email: "email",
  seats: "seats",
  kursi: "seats",
  pax: "seats",
  "jumlah kursi": "seats",
  vip: "isVip",
  catatan: "notes",
  notes: "notes",
};

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[._/-]+/g, " ")
    .replace(/\s+/g, " ");
}

function cellText(value: CellValue | undefined): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== "object") return String(value).trim();
  if ("text" in value && typeof value.text === "string") return value.text.trim();
  if ("result" in value && value.result !== undefined) return String(value.result).trim();
  if ("richText" in value && Array.isArray(value.richText)) return value.richText.map((part) => part.text).join("").trim();
  return String(value).trim();
}

function parseBoolean(value: unknown) {
  return ["1", "true", "ya", "yes", "y", "vip"].includes(normalizeHeader(value));
}

function parseSeats(value: unknown) {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? Math.min(20, Math.max(1, Math.round(parsed))) : 1;
}

function optionalText(value: unknown, maxLength: number) {
  const text = String(value ?? "").trim();
  return text ? text.slice(0, maxLength) : null;
}

export function normalizeGuestRecords(records: Array<Record<string, unknown>>, firstDataRow = 2) {
  const rows: ImportedGuest[] = [];

  records.forEach((record, index) => {
    const mapped: Partial<Record<GuestField, unknown>> = {};
    Object.entries(record).forEach(([header, value]) => {
      const field = headerAliases[normalizeHeader(header)];
      if (field) mapped[field] = value;
    });

    const sourceRow = firstDataRow + index;
    const name = String(mapped.name ?? "").trim();
    if (!name) return;
    if (name.length < 2 || name.length > 100) throw new Error(`Nama pada baris ${sourceRow} harus terdiri dari 2-100 karakter.`);

    const email = optionalText(mapped.email, 120);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error(`Email pada baris ${sourceRow} tidak valid.`);

    rows.push({
      name,
      groupName: optionalText(mapped.groupName, 80),
      phone: optionalText(mapped.phone, 32),
      email,
      seats: parseSeats(mapped.seats),
      isVip: parseBoolean(mapped.isVip),
      notes: optionalText(mapped.notes, 500),
      sourceRow,
    });
  });

  return rows;
}

export function readGuestWorksheet(worksheet: Worksheet) {
  let headerRowNumber = 0;
  const headers: string[] = [];

  for (let rowNumber = 1; rowNumber <= Math.min(worksheet.rowCount, 15); rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const candidateHeaders: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
      candidateHeaders[columnNumber] = cellText(cell.value);
    });
    if (candidateHeaders.some((header) => headerAliases[normalizeHeader(header)] === "name")) {
      headerRowNumber = rowNumber;
      candidateHeaders.forEach((header, index) => { headers[index] = header; });
      break;
    }
  }

  if (!headerRowNumber) throw new Error('Kolom "Nama Undangan" tidak ditemukan pada 15 baris pertama.');

  const records: Array<Record<string, unknown>> = [];
  for (let rowNumber = headerRowNumber + 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const record: Record<string, unknown> = {};
    headers.forEach((header, columnNumber) => {
      if (header) record[header] = cellText(row.getCell(columnNumber).value);
    });
    records.push(record);
  }

  return normalizeGuestRecords(records, headerRowNumber + 1);
}
