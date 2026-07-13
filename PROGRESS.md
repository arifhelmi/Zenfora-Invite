# Progress implementasi

- [x] Sprint 1 — fondasi Next.js, Prisma, Auth.js, RBAC, layout publik/dashboard/admin.
- [x] Sprint 2 — model event, wizard draf, section registry, autosave-style server mutation, adapter media lokal.
- [x] Sprint 3–4 — theme manifest, delapan tema, katalog, renderer undangan responsif, perubahan tema tanpa memindahkan data.
- [x] Sprint 5 — tamu, CSV endpoint, tautan personal, RSVP, ucapan dengan sanitasi/rate limit.
- [x] Sprint 6 — paket, order, mock payment, webhook idempoten.
- [x] Sprint 7 — QR token, check-in, analytics, hadiah, admin panel.
- [x] Sprint 8 — unit/integration/E2E specs, security headers, Dockerfile, deployment docs, and production build validation.

## Verification (2026-07-11)

- PostgreSQL Docker service is healthy on `localhost:5434` (port 5432 was already occupied by an unrelated local service).
- Initial migration `20260711172832_init` applied successfully.
- Seed completed successfully.
- `pnpm typecheck`, `pnpm lint`, `pnpm test` (8 tests including database integration), `pnpm test:e2e` (4 browser checks), and `pnpm build` passed.
