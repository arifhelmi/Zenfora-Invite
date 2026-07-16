import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { culturalThemes, culturalThemeStyles, getCulturalTheme } from "@/lib/cultural-themes";

const expectedSlugs = [
  "sunda-parahyangan",
  "jawa-wayang-heritage",
  "serambi-meukuta",
  "ulos-toba",
  "rangkiang-minang",
  "melayu-lancang",
  "selat-melayu",
  "bali-candi-bentar",
  "sasirangan-banjar",
  "pinisi-tongkonan",
];

describe("koleksi 10 provinsi", () => {
  it("memiliki tepat sepuluh slug dan provinsi unik", () => {
    expect(culturalThemes.map((theme) => theme.slug)).toEqual(expectedSlugs);
    expect(new Set(culturalThemes.map((theme) => theme.slug)).size).toBe(10);
    expect(new Set(culturalThemes.map((theme) => theme.province)).size).toBe(10);
    expect(new Set(culturalThemes.map((theme) => theme.motion)).size).toBe(10);
  });

  it("menyediakan mapping renderer dan aset lokal yang valid", () => {
    for (const theme of culturalThemes) {
      expect(culturalThemeStyles[theme.slug]).toBe(theme.className);
      expect(theme.isPremium).toBe(true);
      expect(theme.preview.src.startsWith(`/themes/${theme.slug}/`)).toBe(true);

      for (const assetPath of Object.values(theme.assets)) {
        expect(assetPath.startsWith(`/themes/${theme.slug}/`)).toBe(true);
        const absolutePath = join(process.cwd(), "public", assetPath);
        expect(existsSync(absolutePath), `${assetPath} tidak ditemukan`).toBe(true);
      }

      const heroPath = join(process.cwd(), "public", theme.preview.src);
      expect(statSync(heroPath).size, `${theme.slug} terlalu berat untuk preview`).toBeLessThan(600_000);
    }
  });

  it("menghubungkan setiap motion signature ke CSS dan aman untuk tema nonbudaya", () => {
    const css = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");
    for (const theme of culturalThemes) {
      expect(css).toContain(`data-cultural-motion="${theme.motion}"`);
    }
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain("animation: none !important");
    expect(css).toContain("opacity: 1 !important");
    expect(getCulturalTheme("modern-minimal")).toBeUndefined();
  });
});
