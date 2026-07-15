import { expect, test } from "@playwright/test";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";

test("customer imports an Excel guest and opens the personal invitation", async ({ page }, testInfo) => {
  const event = await prisma.event.findUniqueOrThrow({ where: { slug: "arif-dan-siti" }, select: { id: true } });
  const guestName = `Andi QA ${testInfo.project.name} dan Keluarga`;
  await prisma.guest.deleteMany({ where: { eventId: event.id, name: guestName } });

  try {
    await page.goto("/login");
    await page.getByLabel("Email").fill("customer@zenvora.test");
    await page.getByLabel("Kata sandi").fill("Demo12345!");
    await page.getByRole("button", { name: "Masuk" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto(`/dashboard/events/${event.id}/guests`);
    await expect(page.getByRole("heading", { name: "Satu tamu, satu link personal" })).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("link", { name: "Unduh template 200 baris" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("template-daftar-tamu-200.xlsx");
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();
    const templateWorkbook = new ExcelJS.Workbook();
    await templateWorkbook.xlsx.readFile(downloadPath!);
    expect(templateWorkbook.getWorksheet("Daftar Tamu")?.getCell("B6").text).toBe("Andi dan Keluarga");
    expect(templateWorkbook.getWorksheet("Daftar Tamu")?.getCell("A205").value).toBe(200);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Daftar Tamu");
    worksheet.addRow(["Nama Undangan", "Grup", "Telepon / WhatsApp", "Jumlah Kursi", "VIP"]);
    worksheet.addRow([guestName, "Keluarga", "+62 812-0000-0000", 4, "Ya"]);
    const fileBuffer = Buffer.from(await workbook.xlsx.writeBuffer());
    await page.getByLabel("Pilih file Excel atau CSV").setInputFiles({ name: "daftar-tamu-qa.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer: fileBuffer });
    await page.getByRole("button", { name: "Impor dan buat link" }).click();
    await expect(page.getByText("1 undangan berhasil dibuat.")).toBeVisible();

    const guestRow = page.getByRole("row").filter({ hasText: guestName });
    await expect(guestRow).toBeVisible();
    await expect(guestRow.getByRole("link", { name: "WhatsApp" })).toHaveAttribute("href", /wa\.me\/6281200000000/);

    const exportPromise = page.waitForEvent("download");
    await page.getByRole("link", { name: "Ekspor link Excel" }).click();
    const exportDownload = await exportPromise;
    const exportPath = await exportDownload.path();
    expect(exportPath).toBeTruthy();
    const exportWorkbook = new ExcelJS.Workbook();
    await exportWorkbook.xlsx.readFile(exportPath!);
    let exportedLink = "";
    exportWorkbook.getWorksheet("Daftar Tamu")?.eachRow((row) => {
      if (row.getCell(2).text === guestName) exportedLink = row.getCell(11).text;
    });
    expect(exportedLink).toContain("/i/arif-dan-siti/");

    const invitationPromise = page.waitForEvent("popup");
    await guestRow.getByRole("link", { name: "Buka" }).click();
    const invitation = await invitationPromise;
    await invitation.waitForLoadState("domcontentloaded");
    await expect(invitation.getByText("Kepada Yth.")).toBeVisible();
    await expect(invitation.getByText(guestName)).toBeVisible();
  } finally {
    await prisma.guest.deleteMany({ where: { eventId: event.id, name: guestName } });
  }
});
