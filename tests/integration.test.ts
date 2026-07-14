import { describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createGuestToken } from "@/lib/tokens";
import { addBuilderPage, deleteBuilderPage, ensureBuilderDocument, reorderBuilderPages } from "@/features/builder/service";

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
  it("creates five builder pages, preserves order, and protects the last page", async () => {
    const role = await prisma.role.findUniqueOrThrow({ where: { key: "CUSTOMER" } });
    const eventType = await prisma.eventType.findFirstOrThrow();
    const stamp = Date.now();
    const user = await prisma.user.create({ data: { email: `builder-${stamp}@test.local`, roleId: role.id } });
    const event = await prisma.event.create({ data: { ownerId: user.id, eventTypeId: eventType.id, title: "Builder Integration", slug: `builder-integration-${stamp}` } });
    const initial = await ensureBuilderDocument(event.id);
    expect(initial.pages).toHaveLength(1);
    await addBuilderPage(event.id, user.id, "cover");
    await addBuilderPage(event.id, user.id, "couple");
    await addBuilderPage(event.id, user.id, "event-schedule");
    await addBuilderPage(event.id, user.id, "closing");
    const document = await ensureBuilderDocument(event.id);
    expect(document.pages).toHaveLength(5);
    const reversed = [...document.pages].reverse().map((page) => page.id);
    await reorderBuilderPages(event.id, reversed);
    const reordered = await ensureBuilderDocument(event.id);
    expect(reordered.pages.map((page) => page.id)).toEqual(reversed);
    for (const page of reordered.pages.slice(0, -1)) await deleteBuilderPage(event.id, page.id);
    await expect(deleteBuilderPage(event.id, reordered.pages.at(-1)!.id)).rejects.toThrow(/setidaknya satu halaman/);
    await prisma.event.delete({ where: { id: event.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });
});
