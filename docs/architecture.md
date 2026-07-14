# Arsitektur Zenvora Invite

Zenvora Invite menggunakan Next.js App Router dengan Server Components sebagai default. Mutasi berjalan sebagai Server Actions dan API routes hanya digunakan untuk endpoint HTTP seperti payment webhook, invoice, impor/ekspor CSV, upload, dan health check.

- PostgreSQL + Prisma menjadi sumber data tunggal.
- Auth.js Credentials Provider menyimpan kata sandi ter-hash; akses event selalu divalidasi di server melalui `assertEventOwner`.
- Tema berupa `ThemeVersion.manifest` dengan design tokens dan section registry. Data event tidak bergantung pada markup sebuah tema.
- Storage development memakai adapter lokal; interface disiapkan agar adapter S3 dapat ditambahkan tanpa menyentuh domain media.
- Pembayaran memakai `PaymentProvider`; `MockPaymentProvider` dipakai di development. Webhook mengunci `(provider, externalId)` agar idempoten.
- Tamu memakai token acak 16 karakter URL-safe, bukan nama pada query string.

## Batas MVP yang disengaja

Pemindai kamera dan adapter Midtrans/Xendit adalah titik integrasi yang perlu credential provider. Check-in manual/QR token, webhook mock, dan seluruh kontrak adapter telah berjalan di aplikasi.
