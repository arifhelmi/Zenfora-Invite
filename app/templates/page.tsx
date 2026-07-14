import { ThemeCard } from "@/components/theme-card";
import { prisma } from "@/lib/prisma";
import { createSeoMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export const metadata = createSeoMetadata({
  title: "Katalog Template Undangan Digital",
  description: "Pilih template undangan digital premium dan gratis untuk pernikahan, acara keluarga, syukuran, ulang tahun, dan acara kantor.",
  path: "/templates",
});
export default async function TemplatesPage({ searchParams }: { searchParams: Promise<{ premium?: string; color?: string }> }) { const filters = await searchParams; const themes = await prisma.theme.findMany({ where: { isActive: true, ...(filters.premium === "true" ? { isPremium: true } : {}), ...(filters.color ? { colors: { has: filters.color } } : {}) }, orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }] }); return <main className="shell py-14"><p className="eyebrow">Katalog tema</p><h1 className="mt-2 text-4xl font-bold">Temukan tampilan yang cocok</h1><p className="mt-4 max-w-2xl leading-7 text-slate-600">Gunakan filter untuk menyesuaikan gaya, warna, dan jenis paket. Semua demo memakai aset orisinal Zenvora.</p><form className="mt-8 flex flex-wrap gap-3"><select name="premium" defaultValue={filters.premium} className="select w-auto"><option value="">Semua paket</option><option value="true">Premium</option></select><select name="color" defaultValue={filters.color} className="select w-auto"><option value="">Semua warna</option><option value="navy">Navy</option><option value="emerald">Emerald</option><option value="pastel">Pastel</option><option value="gold">Emas</option></select><button className="button">Terapkan filter</button></form><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{themes.map(theme => <ThemeCard key={theme.id} theme={theme} />)}</div>{themes.length === 0 && <p className="card mt-8 p-6 text-slate-600">Tidak ada template pada filter ini.</p>}</main>; }
