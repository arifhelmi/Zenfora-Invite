import { EventTabs } from "@/components/dashboard/chrome";
import { assertEventOwner } from "@/lib/permissions";
export default async function EventLayout({ children, params }: { children: React.ReactNode; params: Promise<{ eventId: string }> }) { const { eventId } = await params; await assertEventOwner(eventId); return <><EventTabs eventId={eventId} />{children}</>; }
