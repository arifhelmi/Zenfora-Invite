import Link from "next/link";
import type { Theme } from "@prisma/client";

export function ThemeCard({ theme }: { theme: Theme }) {
  const isSunda = theme.slug === "sunda-parahyangan";
  const isJawa = theme.slug === "jawa-wayang-heritage";
  const nusantaraPreviews: Record<string, { background: string; label: string; textClass: string }> = {
    "serambi-meukuta": { background: "linear-gradient(180deg, rgba(8,30,24,.08), rgba(7,27,22,.72)), url('/themes/serambi-meukuta/rumoh-aceh-hero.webp')", label: "ACEH", textClass: "text-[#fff6dd]" },
    "ulos-toba": { background: "linear-gradient(180deg, rgba(40,22,20,.05), rgba(35,21,19,.78)), url('/themes/ulos-toba/rumah-bolon-hero.webp')", label: "SUMATERA UTARA", textClass: "text-[#fff4e1]" },
    "rangkiang-minang": { background: "linear-gradient(180deg, rgba(25,22,20,.06), rgba(21,18,17,.76)), url('/themes/rangkiang-minang/rumah-gadang-hero.webp')", label: "SUMATERA BARAT", textClass: "text-[#fff2cf]" },
    "melayu-lancang": { background: "linear-gradient(180deg, rgba(10,49,40,.04), rgba(8,42,34,.78)), url('/themes/melayu-lancang/rumah-melayu-hero.webp')", label: "RIAU", textClass: "text-[#fff7d6]" },
    "selat-melayu": { background: "linear-gradient(180deg, rgba(12,35,49,.04), rgba(8,29,43,.76)), url('/themes/selat-melayu/selat-lancang-hero.webp')", label: "KEPULAUAN RIAU", textClass: "text-[#fff4d9]" },
  };
  const nusantaraPreview = nusantaraPreviews[theme.slug];
  const backgroundImage = isSunda
    ? "linear-gradient(120deg, rgba(10, 24, 46, .4), rgba(10, 24, 46, .04)), url('/themes/sunda-parahyangan/hero.png')"
    : isJawa ? "linear-gradient(120deg, rgba(45, 18, 14, .22), rgba(232, 194, 117, .16)), url('/themes/jawa-wayang-heritage/wayang-jawa-transparent.png')" : nusantaraPreview?.background;
  const previewClass = isSunda ? "text-[#fff7e6]" : isJawa ? "bg-[#4a291e] text-[#f6d894]" : nusantaraPreview?.textClass ?? (theme.slug === "royal-batik" ? "bg-[#6b2337] text-[#f8e5b5]" : theme.slug === "floral-romance" ? "bg-[#f5d7e4]" : theme.slug === "islamic-emerald" ? "bg-[#125447] text-[#f8e8bd]" : theme.slug === "corporate-elegant" ? "bg-[#102b50] text-white" : theme.slug === "birthday-playful" ? "bg-[#8fdbff]" : theme.slug === "khitan-celebration" ? "bg-[#b7e4cd]" : "bg-slate-100");
  const ornament = nusantaraPreview?.label ?? (isSunda ? "Sunda" : isJawa ? "✦ Jawa ✦" : theme.slug === "floral-romance" ? "✿ ❀ ✿" : theme.slug === "birthday-playful" ? "✦ ● ✦" : "◌ ◈ ◌");
  return <article className="card overflow-hidden"><div style={backgroundImage ? { backgroundImage } : undefined} className={`h-44 bg-cover bg-center p-5 ${previewClass}`}><p className="text-xs font-bold uppercase tracking-[.18em] opacity-75">{theme.style}</p><div className="mt-8 text-3xl">{ornament}</div></div><div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="font-bold text-slate-900">{theme.name}</h3>{theme.isPremium ? <span className="status">Premium</span> : <span className="status">Gratis</span>}</div><p className="mt-2 min-h-10 text-sm leading-5 text-slate-600">{theme.description}</p><div className="mt-4 flex gap-2"><Link className="button secondary text-sm" href={`/templates/${theme.slug}`}>Lihat demo</Link><Link className="button text-sm" href={`/register?theme=${theme.slug}`}>Gunakan</Link></div></div></article>;
}
