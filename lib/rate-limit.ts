const bucket = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, max = 8, windowMs = 60_000) { const now = Date.now(); const current = bucket.get(key); if (!current || current.reset < now) { bucket.set(key, { count: 1, reset: now + windowMs }); return true; } if (current.count >= max) return false; current.count += 1; return true; }
