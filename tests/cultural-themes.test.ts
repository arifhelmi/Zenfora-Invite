import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { culturalThemes, culturalThemeStyles, getCulturalTheme } from "@/lib/cultural-themes";

const expectedProvinces = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", "Sumatera Selatan",
  "Kepulauan Bangka Belitung", "Bengkulu", "Lampung", "DKI Jakarta", "Jawa Barat", "Jawa Tengah", "DI Yogyakarta",
  "Jawa Timur", "Banten", "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Kalimantan Barat",
  "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara", "Sulawesi Utara", "Gorontalo",
  "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara", "Maluku", "Maluku Utara",
  "Papua Barat", "Papua", "Papua Selatan", "Papua Tengah", "Papua Pegunungan", "Papua Barat Daya",
];

describe("koleksi lengkap 38 provinsi", () => {
  it("memiliki tepat 38 slug, provinsi, dan motion signature unik", () => {
    expect(culturalThemes).toHaveLength(38);
    expect(new Set(culturalThemes.map((theme) => theme.slug)).size).toBe(38);
    expect(new Set(culturalThemes.map((theme) => theme.province))).toEqual(new Set(expectedProvinces));
    expect(new Set(culturalThemes.map((theme) => theme.motion)).size).toBe(38);
  });

  it("menyediakan mapping renderer dan aset lokal yang valid", () => {
    for (const theme of culturalThemes) {
      expect(culturalThemeStyles[theme.slug]).toBe(theme.className);
      expect(theme.isPremium).toBe(true);

      for (const assetPath of Object.values(theme.assets)) {
        expect(assetPath.startsWith(`/themes/${theme.slug}/`)).toBe(true);
        const absolutePath = join(process.cwd(), "public", assetPath);
        expect(existsSync(absolutePath), `${assetPath} tidak ditemukan`).toBe(true);
      }

      if (theme.preview.src) {
        expect(theme.preview.src.startsWith(`/themes/${theme.slug}/`)).toBe(true);
        const heroPath = join(process.cwd(), "public", theme.preview.src);
        expect(statSync(heroPath).size, `${theme.slug} terlalu berat untuk preview`).toBeLessThan(600_000);
      } else {
        expect(theme.visual, `${theme.slug} perlu visual CSS saat tidak memiliki hero raster`).toBeDefined();
      }
    }
  });

  it("menghubungkan setiap motion signature ke CSS dan aman untuk tema nonbudaya", () => {
    const css = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");
    for (const theme of culturalThemes) {
      if (theme.visual) expect(css).toContain(`data-cultural-cadence="${theme.visual.cadence}"`);
      else expect(css).toContain(`data-cultural-motion="${theme.motion}"`);
    }
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain("animation: none !important");
    expect(css).toContain("opacity: 1 !important");
    expect(getCulturalTheme("modern-minimal")).toBeUndefined();
  });
});
