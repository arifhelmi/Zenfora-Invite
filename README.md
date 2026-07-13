# Zenvora Invite

SaaS undangan digital berbasis Next.js untuk pernikahan, ulang tahun, khitan, acara perusahaan, dan acara lainnya.

## Prasyarat

Node.js 22+, pnpm 11+, dan Docker Desktop.

## Menjalankan lokal

```bash
pnpm install
docker compose up -d # PostgreSQL tersedia di localhost:5434
cp .env.example .env
pnpm prisma:generate
pnpm db:migrate -- --name init
pnpm db:seed
pnpm dev
```

Buka `http://localhost:3000`. Health check tersedia di `/api/health`.

Demo development:

- Super admin: `admin@zenvora.test` / `Demo12345!`
- Customer: `customer@zenvora.test` / `Demo12345!`
- Demo undangan: `/i/arif-dan-siti/8Fs92KmPZwVfBudi`

Kredensial ini hanya dibuat oleh seed development; jangan gunakan pada produksi.

## Pemeriksaan

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

## Deployment

1. Isi environment variables dari `.env.example` di platform deployment.
2. Gunakan PostgreSQL production dan jalankan `pnpm prisma migrate deploy` pada rilis.
3. Set `STORAGE_DRIVER=s3`, endpoint/bucket/key S3 untuk media production dan implementasikan adapter S3 sesuai vendor.
4. Ganti `PAYMENT_PROVIDER` serta hubungkan adapter Midtrans/Xendit; verifikasi signature webhook sebelum mengaktifkan endpoint.
5. Set domain custom, HTTPS, `NEXT_PUBLIC_APP_URL`, dan `AUTH_SECRET` yang panjang serta unik.
6. Jalankan backup PostgreSQL terjadwal dan uji proses restore secara berkala.

`Dockerfile` menjalankan build dan migration deploy saat container dimulai. Untuk production, gunakan image immutable, secret manager, database backup terenkripsi, serta monitoring `/api/health`.
