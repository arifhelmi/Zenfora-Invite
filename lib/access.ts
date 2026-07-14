export function canAccessEvent(ownerId: string, actorId: string, actorRole: string) { return ownerId === actorId || actorRole === "ADMIN" || actorRole === "SUPER_ADMIN"; }
