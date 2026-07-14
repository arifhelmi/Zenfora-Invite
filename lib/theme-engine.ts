import type { Theme, ThemeVersion } from "@prisma/client";

export type ThemeManifest = { version: number; renderer: string; tokens: { colors: Record<string, string>; typography: Record<string, string>; radius: Record<string, string>; spacing: Record<string, string> }; sections: string[] };
export const defaultManifest: ThemeManifest = { version: 1, renderer: "editorial", tokens: { colors: { background: "#fbfaf8", surface: "#ffffff", primary: "#4338ca", secondary: "#e0e7ff", accent: "#c59b47", text: "#18212f", mutedText: "#5e6774" }, typography: { headingFont: "Georgia", bodyFont: "Inter" }, radius: { card: "1.25rem", button: "0.75rem" }, spacing: { section: "4.5rem" } }, sections: ["cover", "people", "schedule", "location", "gallery", "rsvp", "wishes", "closing"] };

export function resolveManifest(theme: Theme & { versions: ThemeVersion[] }): ThemeManifest {
  const current = theme.versions.find((version) => version.isCurrent) ?? theme.versions[0];
  return (current?.manifest as unknown as ThemeManifest) ?? defaultManifest;
}

export const themeStyles: Record<string, string> = {
  "jawa-wayang-heritage": "heritage", "sunda-parahyangan": "sunda", "serambi-meukuta": "nusantara aceh", "ulos-toba": "nusantara toba", "rangkiang-minang": "nusantara minang", "melayu-lancang": "nusantara riau", "selat-melayu": "nusantara kepri", "royal-batik": "royal", "floral-romance": "floral", "modern-minimal": "minimal", "islamic-emerald": "emerald", "birthday-playful": "playful", "khitan-celebration": "khitan", "corporate-elegant": "corporate"
};
