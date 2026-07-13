import { describe, expect, it } from "vitest";
import { canAccessEvent } from "@/lib/access";
import { canAddGuest } from "@/lib/package-limits";
import { canActivateEntitlement, isTerminalPaymentStatus } from "@/lib/payment-status";
import { createGuestToken } from "@/lib/tokens";
import { slugify } from "@/lib/utils";
import { rsvpSchema, themeManifestSchema } from "@/lib/validation";

describe("permission", () => { it("allows owner and admin only", () => { expect(canAccessEvent("owner", "owner", "CUSTOMER")).toBe(true); expect(canAccessEvent("owner", "other", "CUSTOMER")).toBe(false); expect(canAccessEvent("owner", "other", "ADMIN")).toBe(true); }); });
describe("slug generator", () => { it("creates safe Indonesian slugs", () => expect(slugify("  Acara Siti & Arif 2026! ")).toBe("acara-siti-arif-2026")); });
describe("guest token", () => { it("is URL-safe, unique, and hard to guess", () => { const one = createGuestToken(); const two = createGuestToken(); expect(one).toMatch(/^[23456789A-HJ-NP-Za-km-z]{16}$/); expect(one).not.toBe(two); }); });
describe("package limits", () => { it("prevents guests beyond the plan limit", () => { expect(canAddGuest(19, 20)).toBe(true); expect(canAddGuest(20, 20)).toBe(false); }); });
describe("payment status", () => { it("activates only validated paid status", () => { expect(canActivateEntitlement("PAID")).toBe(true); expect(canActivateEntitlement("PENDING")).toBe(false); expect(isTerminalPaymentStatus("EXPIRED")).toBe(true); }); });
describe("RSVP validation", () => { it("only accepts known status and sensible counts", () => { expect(rsvpSchema.safeParse({ status: "ATTENDING", attendees: 2 }).success).toBe(true); expect(rsvpSchema.safeParse({ status: "YES", attendees: -1 }).success).toBe(false); }); });
describe("theme manifest", () => { it("requires tokens and sections", () => { expect(themeManifestSchema.safeParse({ version: 1, renderer: "minimal", tokens: { colors: {}, typography: {}, radius: {}, spacing: {} }, sections: ["cover"] }).success).toBe(true); expect(themeManifestSchema.safeParse({ version: 1 }).success).toBe(false); }); });
