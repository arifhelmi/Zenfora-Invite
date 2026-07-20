import { ThemeCard } from "@/components/theme-card";
import { culturalThemes } from "@/lib/cultural-themes";
import { prisma } from "@/lib/prisma";
import { createSeoMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createSeoMetadata({
  title: "38 Template Undangan Nusantara",
  description: "Jelajahi template undangan digital dari seluruh 38 provinsi Indonesia, lengkap dengan identitas visual dan animasi khas setiap daerah.",
  path: "/templates",
});

const culturalSlugs = new Set(culturalThemes.map((theme) => theme.slug));

export default async function TemplatesPage({ searchParams }: { searchParams: Promise<{ premium?: string; color?: string }> }) {
  const filters = await searchParams;
  const themes = await prisma.theme.findMany({
    where: {
      isActive: true,
      ...(filters.premium === "true" ? { isPremium: true } : {}),
      ...(filters.color ? { colors: { has: filters.color } } : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
  });
  const provincialThemes = themes.filter((theme) => culturalSlugs.has(theme.slug));
  const versatileThemes = themes.filter((theme) => !culturalSlugs.has(theme.slug));

  return <main className="shell py-14">
    <p className="eyebrow">Koleksi Nusantara lengkap</p>
    <h1 className="mt-2 text-4xl font-bold">38 provinsi, 38 suasana perayaan</h1>
    <p className="mt-4 max-w-3xl leading-7 text-slate-600">Setiap daerah memiliki palet, frame foto, motif, dan gerak yang berbeda. Semuanya memakai struktur konten yang sama, sehingga pengguna dapat mengganti tema tanpa mengisi ulang data acara.</p>
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <span className="status">{provincialThemes.length} dari 38 template provinsi</span>
      <span className="text-sm text-slate-500">Animasi ramah aksesibilitas dan otomatis tenang saat tidak terlihat.</span>
    </div>

    <form className="mt-8 flex flex-wrap gap-3">
      <select name="premium" defaultValue={filters.premium} className="select w-auto" aria-label="Filter paket">
        <option value="">Semua paket</option>
        <option value="true">Premium</option>
      </select>
      <select name="color" defaultValue={filters.color} className="select w-auto" aria-label="Filter warna">
        <option value="">Semua warna</option>
        <option value="navy">Navy</option>
        <option value="emerald">Emerald</option>
        <option value="indigo">Indigo</option>
        <option value="gold">Emas</option>
        <option value="cream">Krem</option>
      </select>
      <button className="button">Terapkan filter</button>
    </form>

    {provincialThemes.length > 0 && <section className="mt-12" aria-labelledby="provincial-themes-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Dari Aceh hingga Papua Barat Daya</p>
          <h2 id="provincial-themes-title" className="mt-2 text-3xl font-bold">Template provinsi</h2>
        </div>
        <p className="text-sm text-slate-500">{provincialThemes.length} tema ditemukan</p>
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{provincialThemes.map((theme) => <ThemeCard key={theme.id} theme={theme} />)}</div>
    </section>}

    {versatileThemes.length > 0 && <section className="mt-16 border-t border-slate-200 pt-12" aria-labelledby="versatile-themes-title">
      <p className="eyebrow">Pilihan lintas acara</p>
      <h2 id="versatile-themes-title" className="mt-2 text-3xl font-bold">Tema serbaguna</h2>
      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{versatileThemes.map((theme) => <ThemeCard key={theme.id} theme={theme} />)}</div>
    </section>}

    {themes.length === 0 && <p className="card mt-8 p-6 text-slate-600">Tidak ada template pada filter ini.</p>}
  </main>;
}
