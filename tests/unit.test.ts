import { describe, expect, it } from "vitest";
import { canAccessEvent } from "@/lib/access";
import { canAddGuest } from "@/lib/package-limits";
import { canActivateEntitlement, isTerminalPaymentStatus } from "@/lib/payment-status";
import { createGuestToken } from "@/lib/tokens";
import { normalizeGuestRecords } from "@/lib/guest-spreadsheet";
import { slugify } from "@/lib/utils";
import { rsvpSchema, themeManifestSchema } from "@/lib/validation";
import { allowedPageConfigSchema, imageGenerationInputSchema, pagePatchSchema } from "@/features/builder/validation";
import { generateStructuredPage, generateStructuredPatch } from "@/features/builder/ai-page-generator";
import { MockImageGenerationProvider } from "@/features/builder/mock-image-provider";

describe("permission", () => { it("allows owner and admin only", () => { expect(canAccessEvent("owner", "owner", "CUSTOMER")).toBe(true); expect(canAccessEvent("owner", "other", "CUSTOMER")).toBe(false); expect(canAccessEvent("owner", "other", "ADMIN")).toBe(true); }); });
describe("slug generator", () => { it("creates safe Indonesian slugs", () => expect(slugify("  Acara Siti & Arif 2026! ")).toBe("acara-siti-arif-2026")); });
describe("guest token", () => { it("is URL-safe, unique, and hard to guess", () => { const one = createGuestToken(); const two = createGuestToken(); expect(one).toMatch(/^[23456789A-HJ-NP-Za-km-z]{16}$/); expect(one).not.toBe(two); }); });
describe("package limits", () => { it("prevents guests beyond the plan limit", () => { expect(canAddGuest(19, 20)).toBe(true); expect(canAddGuest(20, 20)).toBe(false); }); });
describe("guest spreadsheet", () => {
  it("accepts Indonesian headers and family invitation labels", () => {
    expect(normalizeGuestRecords([{ "Nama Undangan": "Andi dan Keluarga", Grup: "Keluarga", "Telepon / WhatsApp": "+62 812-3456-789", "Jumlah Kursi": "4", VIP: "Ya" }])).toEqual([expect.objectContaining({ name: "Andi dan Keluarga", groupName: "Keluarga", phone: "+62 812-3456-789", seats: 4, isVip: true })]);
  });
  it("ignores blank rows and caps seats at twenty", () => {
    expect(normalizeGuestRecords([{ name: "", seats: 2 }, { name: "Tamu Besar", seats: 40 }])).toEqual([expect.objectContaining({ name: "Tamu Besar", seats: 20 })]);
  });
});
describe("payment status", () => { it("activates only validated paid status", () => { expect(canActivateEntitlement("PAID")).toBe(true); expect(canActivateEntitlement("PENDING")).toBe(false); expect(isTerminalPaymentStatus("EXPIRED")).toBe(true); }); });
describe("RSVP validation", () => { it("only accepts known status and sensible counts", () => { expect(rsvpSchema.safeParse({ status: "ATTENDING", attendees: 2 }).success).toBe(true); expect(rsvpSchema.safeParse({ status: "YES", attendees: -1 }).success).toBe(false); }); });
describe("theme manifest", () => { it("requires tokens and sections", () => { expect(themeManifestSchema.safeParse({ version: 1, renderer: "minimal", tokens: { colors: {}, typography: {}, radius: {}, spacing: {} }, sections: ["cover"] }).success).toBe(true); expect(themeManifestSchema.safeParse({ version: 1 }).success).toBe(false); }); });
describe("AI builder validation", () => {
  it("accepts only registered page and block configurations", () => {
    const page = generateStructuredPage("Buat halaman cover pernikahan Jawa yang elegan dengan pendopo malam");
    expect(allowedPageConfigSchema.safeParse(page).success).toBe(true);
    expect(page.pageType).toBe("cover");
    expect(page.blocks.some((block) => block.type === "open-invitation-button")).toBe(true);
    expect(allowedPageConfigSchema.safeParse({ ...page, blocks: [{ type: "javascript", content: { text: "alert(1)" } }] }).success).toBe(false);
  });
  it("validates AI edit patches and strips unsupported properties", () => {
    const patch = generateStructuredPatch("Buat lebih gelap, minimalis, dan kurangi animasi", ["cm1234567890123456789012"]);
    expect(pagePatchSchema.safeParse(patch).success).toBe(true);
    expect(patch.page?.backgroundConfig?.overlayOpacity).toBeGreaterThan(0);
  });
  it("rejects unsafe image prompts", () => {
    expect(imageGenerationInputSchema.safeParse({ prompt: "<script>alert(1)</script>", purpose: "background", aspectRatio: "9:16", numberOfResults: 1 }).success).toBe(false);
  });
});
describe("mock image provider", () => {
  it("returns locally storable image files without paid credits", async () => {
    const result = await new MockImageGenerationProvider().generate({ prompt: "Elegant floral wedding background with a clear safe area", purpose: "background", aspectRatio: "9:16", numberOfResults: 2 });
    expect(result.provider).toBe("mock");
    expect(result.images).toHaveLength(2);
    expect(result.images[0].mimeType).toBe("image/svg+xml");
    expect(result.images[0].bytes.byteLength).toBeGreaterThan(100);
  });
});
