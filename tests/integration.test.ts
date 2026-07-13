import { describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createGuestToken } from "@/lib/tokens";

const enabled = Boolean(process.env.DATABASE_URL);
describe.skipIf(!enabled)("database event flow", () => {
  const prisma = new PrismaClient();
  it("creates an event, guest, RSVP, and check-in", async () => {
    const role = await prisma.role.findUniqueOrThrow({ where: { key: "CUSTOMER" } });
    const eventType = await prisma.eventType.findFirstOrThrow();
    const theme = await prisma.theme.findFirstOrThrow();
    const user = await prisma.user.create({ data: { email: `integration-${Date.now()}@test.local`, roleId: role.id } });
    const event = await prisma.event.create({ data: { ownerId: user.id, eventTypeId: eventType.id, themeId: theme.id, title: "Integration Event", slug: `integration-${Date.now()}` } });
    const guest = await prisma.guest.create({ data: { eventId: event.id, name: "Integration Guest", token: createGuestToken() } });
    const rsvp = await prisma.rSVP.create({ data: { eventId: event.id, guestId: guest.id, status: "ATTENDING", attendees: 1 } });
    const checkin = await prisma.checkIn.create({ data: { eventId: event.id, guestId: guest.id, method: "MANUAL" } });
    expect(rsvp.status).toBe("ATTENDING"); expect(checkin.guestId).toBe(guest.id);
    await prisma.event.delete({ where: { id: event.id } }); await prisma.user.delete({ where: { id: user.id } });
  });
});
