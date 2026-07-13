import Link from "next/link";
import type { Theme } from "@prisma/client";

export function ThemeCard({ theme }: { theme: Theme }) {
  const isSunda = theme.slug === "sunda-parahyangan";
  const isJawa = theme.slug === "jawa-wayang-heritage";
  const nusantaraPreviews: Record<string, { background: string; label: string; textClass: string }> = {
    "serambi-meukuta": { background: "radial-gradient(circle at 50% 120%, #c7a55b 0 18%, transparent 18.5%), linear-gradient(145deg, #0e2d26, #245c4b)", label: "ACEH", textClass: "text-[#fff6dd]" },
    "ulos-toba": { background: "repeating-linear-gradient(90deg, transparent 0 12px, rgba(216,176,106,.22) 12px 14px), linear-gradient(135deg, #2d1c1b, #8e2f2c)", label: "SUMATERA UTARA", textClass: "text-[#fff4e1]" },
    "rangkiang-minang": { background: "linear-gradient(160deg, transparent 55%, rgba(209,169,68,.35) 55.5% 58%, transparent 58.5%), linear-gradient(135deg, #1e2020, #71302b)", label: "SUMATERA BARAT", textClass: "text-[#fff2cf]" },
    "melayu-lancang": { background: "radial-gradient(circle at 100% 0, rgba(228,208,139,.35), transparent 38%), linear-gradient(135deg, #123b33, #20745c)", label: "RIAU", textClass: "text-[#fff7d6]" },
    "selat-melayu": { background: "radial-gradient(ellipse at 50% 120%, transparent 0 37%, rgba(216,199,165,.35) 38% 40%, transparent 41%), linear-gradient(150deg, #102d40, #2f6676)", label: "KEPULAUAN RIAU", textClass: "text-[#fff4d9]" },
  };
  const nusantaraPreview = nusantaraPreviews[theme.slug];
  const backgroundImage = isSunda
    ? "linear-gradient(120deg, rgba(10, 24, 46, .4), rgba(10, 24, 46, .04)), url('/themes/sunda-parahyangan/hero.png')"
    : isJawa ? "linear-gradient(120deg, rgba(45, 18, 14, .22), rgba(232, 194, 117, .16)), url('/themes/jawa-wayang-heritage/wayang-jawa-transparent.png')" : nusantaraPreview?.background;
  const previewClass = isSunda ? "text-[#fff7e6]" : isJawa ? "bg-[#4a291e] text-[#f6d894]" : nusantaraPreview?.textClass ?? (theme.slug === "royal-batik" ? "bg-[#6b2337] text-[#f8e5b5]" : theme.slug === "floral-romance" ? "bg-[#f5d7e4]" : theme.slug === "islamic-emerald" ? "bg-[#125447] text-[#f8e8bd]" : theme.slug === "corporate-elegant" ? "bg-[#102b50] text-white" : theme.slug === "birthday-playful" ? "bg-[#8fdbff]" : theme.slug === "khitan-celebration" ? "bg-[#b7e4cd]" : "bg-slate-100");
  const ornament = nusantaraPreview?.label ?? (isSunda ? "Sunda" : isJawa ? "✦ Jawa ✦" : theme.slug === "floral-romance" ? "✿ ❀ ✿" : theme.slug === "birthday-playful" ? "✦ ● ✦" : "◌ ◈ ◌");
  return <article className="card overflow-hidden"><div style={backgroundImage ? { backgroundImage } : undefined} className={`h-44 bg-cover bg-center p-5 ${previewClass}`}><p className="text-xs font-bold uppercase tracking-[.18em] opacity-75">{theme.style}</p><div className="mt-8 text-3xl">{ornament}</div></div><div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="font-bold text-slate-900">{theme.name}</h3>{theme.isPremium ? <span className="status">Premium</span> : <span className="status">Gratis</span>}</div><p className="mt-2 min-h-10 text-sm leading-5 text-slate-600">{theme.description}</p><div className="mt-4 flex gap-2"><Link className="button secondary text-sm" href={`/templates/${theme.slug}`}>Lihat demo</Link><Link className="button text-sm" href={`/register?theme=${theme.slug}`}>Gunakan</Link></div></div></article>;
}
