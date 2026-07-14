import { z } from "zod";

export const registerSchema = z.object({ name: z.string().min(2).max(80), email: z.string().email(), password: z.string().min(8).max(72) });
export const eventSchema = z.object({
  eventTypeId: z.string().cuid(), themeId: z.string().cuid(), title: z.string().min(3).max(140),
  startsAt: z.string().optional(), locationName: z.string().max(120).optional(), locationAddress: z.string().max(500).optional()
});
export const guestSchema = z.object({ name: z.string().min(2).max(100), email: z.string().email().optional().or(z.literal("")), phone: z.string().max(32).optional(), seats: z.coerce.number().int().min(1).max(20), isVip: z.boolean().default(false) });
export const rsvpSchema = z.object({ status: z.enum(["ATTENDING", "DECLINED", "MAYBE"]), attendees: z.coerce.number().int().min(0).max(20), note: z.string().max(500).optional() });
export const wishSchema = z.object({ author: z.string().min(2).max(100), message: z.string().min(3).max(500) });
export const themeManifestSchema = z.object({ version: z.number().int().positive(), renderer: z.string(), tokens: z.object({ colors: z.record(z.string()), typography: z.record(z.string()), radius: z.record(z.string()), spacing: z.record(z.string()) }), sections: z.array(z.string()) });
