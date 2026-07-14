import type { AllowedBlockConfig, AllowedPageConfig, PagePatch } from "@/features/builder/types";
import { allowedPageConfigSchema, pagePatchSchema } from "@/features/builder/validation";

function includesAny(prompt: string, words: string[]) {
  const normalized = prompt.toLocaleLowerCase("id");
  return words.some((word) => normalized.includes(word));
}

export function moderateBuilderPrompt(prompt: string) {
  const blocked = ["pornografi", "seks eksplisit", "kekerasan sadis", "nazi", "bunuh diri", "javascript:", "<script", "iframe"];
  if (includesAny(prompt, blocked)) throw new Error("Prompt mengandung materi yang tidak dapat diproses.");
}

export function generateStructuredPage(prompt: string): AllowedPageConfig {
  moderateBuilderPrompt(prompt);
  const isCover = includesAny(prompt, ["cover", "sampul", "buka undangan", "nama pengantin"]);
  const isMinimal = includesAny(prompt, ["minimal", "minimalis", "bersih", "modern"]);
  const isDark = includesAny(prompt, ["gelap", "malam", "dark", "hitam"]);
  const isJavanese = includesAny(prompt, ["jawa", "pendopo", "gunungan", "wayang"]);
  const blocks: AllowedBlockConfig[] = isCover ? [
    { type: "text", content: { text: "THE WEDDING OF" }, layoutPreset: "top-center", styleConfig: { fontSize: 13, fontWeight: 600, textAlign: "center" } },
    { type: "heading", content: { text: "Nama Mempelai" }, dataBinding: "event.coupleNames", layoutPreset: "center", stylePreset: isJavanese ? "gold-decorative-heading" : "editorial-heading", styleConfig: { fontSize: isMinimal ? 48 : 58, fontFamily: "serif", textAlign: "center" } },
    { type: "text", content: { text: "Tanggal acara" }, dataBinding: "event.primaryDate", layoutPreset: "below-heading", styleConfig: { fontSize: 16, textAlign: "center" } },
    { type: "open-invitation-button", content: { label: "Buka Undangan", url: "#detail" }, layoutPreset: "bottom-center", styleConfig: { borderRadius: isMinimal ? 4 : 999, padding: 14 } },
  ] : [
    { type: "heading", content: { text: "Halaman Istimewa" }, layoutPreset: "center", styleConfig: { fontSize: 42, fontFamily: "serif", textAlign: "center" } },
    { type: "text", content: { text: "Tuliskan kisah dan pesan terbaik Anda di sini." }, layoutPreset: "below-heading", styleConfig: { fontSize: 17, textAlign: "center" } },
  ];
  const config: AllowedPageConfig = {
    name: isCover ? "Cover AI" : "Halaman AI",
    pageType: isCover ? "cover" : "custom",
    heightMode: "viewport",
    layoutConfig: { preset: isMinimal ? "airy" : "center", gap: isMinimal ? 20 : 14 },
    backgroundConfig: { size: "cover", positionX: 50, positionY: 50, color: isDark ? "#171814" : "#f1e8d8", overlayColor: isDark ? "#11120f" : "#2b241d", overlayOpacity: isDark ? 0.4 : 0.16 },
    backgroundGenerationRequest: {
      purpose: "background",
      aspectRatio: "9:16",
      prompt: `${isMinimal ? "Minimal editorial" : "Elegant layered"} wedding invitation background. ${isJavanese ? "Original Javanese-inspired pendopo silhouette and restrained golden gunungan geometry." : "Soft botanical architecture and refined negative space."} No text, no logos, generous safe area in the center.`,
      stylePreset: isJavanese ? "javanese-editorial" : isMinimal ? "modern-minimal" : "romantic-editorial",
      dominantColors: isDark ? ["#161914", "#6d6049", "#c5a969"] : ["#efe5d2", "#c9a86c", "#526052"],
      safeArea: { horizontal: "center", vertical: "center" },
      numberOfResults: 3,
    },
    blocks,
  };
  return allowedPageConfigSchema.parse(config);
}

export function generateStructuredPatch(prompt: string, blockIds: string[]): PagePatch {
  moderateBuilderPrompt(prompt);
  const updates = blockIds.slice(0, 20).map((blockId) => ({
    blockId,
    patch: {
      styleConfig: {
        ...(includesAny(prompt, ["besar", "perbesar"]) ? { fontSize: 48 } : {}),
        ...(includesAny(prompt, ["minimal", "minimalis"]) ? { fontFamily: "body" as const, borderRadius: 4 } : {}),
        ...(includesAny(prompt, ["gelap", "dark"]) ? { color: "#f8f2e7" } : {}),
      },
      animationConfig: includesAny(prompt, ["kurangi animasi", "tanpa animasi"]) ? { preset: "none" as const } : undefined,
      positionConfig: includesAny(prompt, ["ke atas", "pindahkan nama ke atas"]) ? { y: 24 } : undefined,
    },
  }));
  const patch: PagePatch = {
    page: {
      ...(includesAny(prompt, ["gelap", "dark"]) ? { backgroundConfig: { overlayColor: "#090a08", overlayOpacity: 0.52 } } : {}),
      ...(includesAny(prompt, ["minimal", "minimalis"]) ? { layoutConfig: { preset: "airy", gap: 22 }, animationConfig: { preset: "fade", duration: 500 } } : {}),
    },
    blocksToUpdate: updates,
  };
  return pagePatchSchema.parse(patch);
}
