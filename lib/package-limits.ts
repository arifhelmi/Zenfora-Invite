export function canAddGuest(currentGuests: number, guestLimit: number) { return currentGuests < guestLimit; }
export function isPackageActive(expiresAt?: Date | null) { return Boolean(expiresAt && expiresAt > new Date()); }
