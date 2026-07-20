import Link from "next/link";
import type { Theme } from "@prisma/client";
import { getCulturalTheme } from "@/lib/cultural-themes";

const genericPreviewClasses: Record<string, string> = {
  "royal-batik": "bg-[#6b2337] text-[#f8e5b5]",
  "floral-romance": "bg-[#f5d7e4]",
  "islamic-emerald": "bg-[#125447] text-[#f8e8bd]",
  "corporate-elegant": "bg-[#102b50] text-white",
  "birthday-playful": "bg-[#8fdbff]",
  "khitan-celebration": "bg-[#b7e4cd]",
};

const genericOrnaments: Record<string, string> = {
  "floral-romance": "✿ ❀ ✿",
  "birthday-playful": "✦ ● ✦",
};

export function ThemeCard({ theme }: { theme: Theme }) {
  const culturalTheme = getCulturalTheme(theme.slug);
  const previewClass = culturalTheme?.preview.textClass
    ?? genericPreviewClasses[theme.slug]
    ?? "bg-slate-100";
  const ornament = culturalTheme?.province
    ?? genericOrnaments[theme.slug]
    ?? "◌ ◈ ◌";

  return <article className="card overflow-hidden">
    <div
      className={`cultural-theme-card-preview relative h-44 overflow-hidden p-5 ${previewClass}`}
      data-cultural-frame={culturalTheme?.visual?.frame}
      data-cultural-pattern={culturalTheme?.visual?.pattern}
      style={culturalTheme ? {
        "--preview-primary": culturalTheme.tokens.primary,
        "--preview-secondary": culturalTheme.tokens.secondary ?? culturalTheme.tokens.accent,
        "--preview-accent": culturalTheme.tokens.accent,
        background: culturalTheme.preview.gradient,
      } as React.CSSProperties : undefined}
    >
      {culturalTheme?.preview.src && <>
        <img
          alt={`Pratinjau template ${culturalTheme.name} dari ${culturalTheme.province}`}
          className="absolute inset-0 h-full w-full object-cover"
          decoding="async"
          loading="lazy"
          src={culturalTheme.preview.src}
          style={{ objectPosition: culturalTheme.preview.objectPosition }}
        />
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: culturalTheme.preview.gradient }}
        />
      </>}
      {culturalTheme?.visual && <span aria-hidden="true" className="cultural-preview-landmark" />}
      <div className="relative z-10">
        <p className="text-xs font-bold uppercase tracking-[.18em] opacity-75">{culturalTheme?.province ?? theme.style}</p>
        <div className="mt-8 text-2xl font-semibold tracking-[.08em]">{ornament}</div>
      </div>
    </div>
    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-slate-900">{theme.name}</h3>
        {theme.isPremium ? <span className="status">Premium</span> : <span className="status">Gratis</span>}
      </div>
      <p className="mt-2 min-h-10 text-sm leading-5 text-slate-600">{theme.description}</p>
      <div className="mt-4 flex gap-2">
        <Link className="button secondary text-sm" href={`/templates/${theme.slug}`}>Lihat demo</Link>
        <Link className="button text-sm" href={`/register?theme=${theme.slug}`}>Gunakan</Link>
      </div>
    </div>
  </article>;
}
