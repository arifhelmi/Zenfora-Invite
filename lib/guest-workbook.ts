import "server-only";
import ExcelJS from "exceljs";

const colors = {
  ink: "FF173D38",
  green: "FF1F5A4F",
  gold: "FFC99A48",
  cream: "FFF7F1E4",
  pale: "FFE7EFEA",
  white: "FFFFFFFF",
  muted: "FF62716D",
};

const columns = [
  { header: "No.", width: 7 },
  { header: "Nama Undangan", width: 30 },
  { header: "Grup", width: 20 },
  { header: "Telepon / WhatsApp", width: 23 },
  { header: "Email", width: 28 },
  { header: "Jumlah Kursi", width: 14 },
  { header: "VIP", width: 10 },
  { header: "RSVP", width: 15 },
  { header: "Check-in", width: 13 },
  { header: "Token", width: 21 },
  { header: "Link Personal", width: 48 },
  { header: "Catatan", width: 30 },
];

function prepareSheet(workbook: ExcelJS.Workbook, title: string, subtitle: string) {
  workbook.creator = "Zenvora Invite";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet("Daftar Tamu", { views: [{ state: "frozen", ySplit: 5, showGridLines: false }] });
  sheet.properties.defaultRowHeight = 22;
  sheet.mergeCells("A1:L1");
  sheet.getCell("A1").value = title;
  sheet.getCell("A1").font = { name: "Aptos Display", size: 22, bold: true, color: { argb: colors.white } };
  sheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.green } };
  sheet.getCell("A1").alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(1).height = 38;
  sheet.mergeCells("A2:L2");
  sheet.getCell("A2").value = subtitle;
  sheet.getCell("A2").font = { name: "Aptos", size: 11, color: { argb: colors.ink } };
  sheet.getCell("A2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.cream } };
  sheet.getCell("A2").alignment = { vertical: "middle" };
  sheet.getRow(2).height = 28;
  sheet.mergeCells("A3:L3");
  sheet.getCell("A3").value = "Setiap baris menghasilkan satu link undangan unik. Jangan mengubah kolom Token dan Link Personal pada hasil ekspor.";
  sheet.getCell("A3").font = { name: "Aptos", size: 10, italic: true, color: { argb: colors.muted } };
  sheet.getCell("A3").alignment = { vertical: "middle" };
  sheet.getRow(3).height = 24;

  columns.forEach((column, index) => {
    const cell = sheet.getCell(5, index + 1);
    cell.value = column.header;
    cell.font = { name: "Aptos", bold: true, color: { argb: colors.white } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.ink } };
    cell.alignment = { vertical: "middle", horizontal: index === 0 || index === 5 ? "center" : "left" };
    cell.border = { bottom: { style: "medium", color: { argb: colors.gold } } };
    sheet.getColumn(index + 1).width = column.width;
  });
  sheet.getRow(5).height = 28;
  sheet.autoFilter = "A5:L5";
  return sheet;
}

function finishDataArea(sheet: ExcelJS.Worksheet, lastRow: number) {
  for (let rowNumber = 6; rowNumber <= lastRow; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowNumber % 2 === 0 ? colors.white : colors.pale } };
    row.font = { name: "Aptos", size: 10, color: { argb: colors.ink } };
    row.alignment = { vertical: "middle" };
    row.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
    row.getCell(6).alignment = { vertical: "middle", horizontal: "center" };
    row.getCell(7).alignment = { vertical: "middle", horizontal: "center" };
    row.getCell(9).alignment = { vertical: "middle", horizontal: "center" };
    row.height = 23;
  }
  sheet.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
}

export function createGuestTemplateWorkbook(eventTitle?: string) {
  const workbook = new ExcelJS.Workbook();
  const sheet = prepareSheet(
    workbook,
    "Template Daftar Tamu Zenvora",
    `${eventTitle ? `${eventTitle} | ` : ""}Tersedia 200 baris untuk undangan personal`,
  );
  sheet.getCell("A4").value = "ISI DATA";
  sheet.getCell("A4").font = { bold: true, color: { argb: colors.green } };
  sheet.getCell("B6").value = "Andi dan Keluarga";
  sheet.getCell("C6").value = "Keluarga";
  sheet.getCell("D6").value = "628123456789";
  sheet.getCell("F6").value = 4;
  sheet.getCell("G6").value = "Tidak";
  sheet.getCell("L6").value = "Contoh, silakan ganti dengan nama tamu sebenarnya.";
  sheet.getCell("B7").value = "Bapak Budi & Ibu Sari";
  sheet.getCell("C7").value = "Rekan Kerja";
  sheet.getCell("F7").value = 2;
  sheet.getCell("G7").value = "Ya";

  for (let index = 0; index < 200; index += 1) sheet.getCell(index + 6, 1).value = index + 1;
  for (let rowNumber = 6; rowNumber <= 205; rowNumber += 1) {
    sheet.getCell(rowNumber, 6).dataValidation = { type: "whole", operator: "between", allowBlank: true, formulae: [1, 20], showErrorMessage: true, errorTitle: "Jumlah kursi tidak valid", error: "Isi jumlah kursi antara 1 sampai 20." };
    sheet.getCell(rowNumber, 7).dataValidation = { type: "list", allowBlank: true, formulae: ['"Ya,Tidak"'] };
  }
  finishDataArea(sheet, 205);

  const guide = workbook.addWorksheet("Petunjuk", { views: [{ showGridLines: false }] });
  guide.getColumn("A").width = 25;
  guide.getColumn("B").width = 80;
  guide.mergeCells("A1:B1");
  guide.getCell("A1").value = "Cara Menyiapkan 200 Undangan";
  guide.getCell("A1").font = { name: "Aptos Display", size: 20, bold: true, color: { argb: colors.white } };
  guide.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.green } };
  guide.getRow(1).height = 38;
  [
    ["1. Nama Undangan", 'Isi teks yang ingin tampil setelah "Kepada Yth.", misalnya "Andi dan Keluarga".'],
    ["2. Nomor WhatsApp", "Gunakan kode negara, misalnya 628123456789, agar tombol kirim WhatsApp dapat dipakai."],
    ["3. Jumlah Kursi", "Isi 1-20. Satu baris adalah satu undangan/link, bukan satu orang."],
    ["4. Unggah", "Buka Dashboard > Tamu > Impor massal, lalu pilih file ini."],
    ["5. Bagikan", "Setelah impor, salin link dari dashboard atau unduh Excel hasil yang sudah berisi Link Personal."],
    ["Catatan", "Hapus dua baris contoh bila tidak diperlukan. Baris tanpa Nama Undangan akan dilewati."],
  ].forEach((values, index) => {
    const row = guide.getRow(index + 3);
    row.values = values;
    row.getCell(1).font = { bold: true, color: { argb: colors.green } };
    row.getCell(2).alignment = { wrapText: true, vertical: "top" };
    row.height = 34;
  });
  return workbook;
}

export type GuestExportRow = {
  name: string;
  groupName?: string | null;
  phone?: string | null;
  email?: string | null;
  seats: number;
  isVip: boolean;
  rsvp?: string | null;
  checkedIn: boolean;
  token: string;
  invitationUrl: string;
  notes?: string | null;
};

export function createGuestExportWorkbook(eventTitle: string, rows: GuestExportRow[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = prepareSheet(workbook, `Daftar Tamu | ${eventTitle}`, `${rows.length} link undangan personal telah dibuat`);
  sheet.getCell("A4").value = "TOTAL UNDANGAN";
  sheet.getCell("B4").value = rows.length;
  sheet.getCell("D4").value = "TOTAL KURSI";
  sheet.getCell("E4").value = rows.reduce((total, row) => total + row.seats, 0);
  ["A4", "D4"].forEach((address) => { sheet.getCell(address).font = { bold: true, color: { argb: colors.green } }; });
  ["B4", "E4"].forEach((address) => { sheet.getCell(address).font = { bold: true, size: 14, color: { argb: colors.gold } }; });

  finishDataArea(sheet, Math.max(6, rows.length + 5));
  rows.forEach((guest, index) => {
    const rowNumber = index + 6;
    const values = [index + 1, guest.name, guest.groupName ?? "", guest.phone ?? "", guest.email ?? "", guest.seats, guest.isVip ? "Ya" : "Tidak", guest.rsvp ?? "Belum merespons", guest.checkedIn ? "Sudah" : "Belum", guest.token, guest.invitationUrl, guest.notes ?? ""];
    values.forEach((value, columnIndex) => { sheet.getCell(rowNumber, columnIndex + 1).value = value; });
    sheet.getCell(rowNumber, 11).value = { text: guest.invitationUrl, hyperlink: guest.invitationUrl };
    sheet.getCell(rowNumber, 11).font = { color: { argb: "FF1769AA" }, underline: true };
  });
  return workbook;
}
