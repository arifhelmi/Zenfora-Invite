export type CulturalThemeFamily = "sunda" | "jawa" | "nusantara";

export type CulturalThemeDefinition = {
  slug: string;
  name: string;
  province: string;
  family: CulturalThemeFamily;
  style: string;
  className: string;
  motion: string;
  coverLabel: string;
  greeting: string;
  ornament: string;
  colors: readonly string[];
  isPremium: boolean;
  isFeatured: boolean;
  description: string;
  tokens: Record<string, string>;
  preview: {
    src: string;
    gradient: string;
    textClass: string;
    objectPosition?: string;
  };
  assets: Readonly<Record<string, string>>;
};

export const culturalThemes = [
  {
    slug: "sunda-parahyangan",
    name: "Sunda Parahyangan",
    province: "Jawa Barat",
    family: "sunda",
    style: "sunda",
    className: "sunda",
    motion: "golek-sway",
    coverLabel: "Pawiwahan Sunda",
    greeting: "Wilujeng sumping. Terima kasih telah menjadi bagian dari hari istimewa kami.",
    ornament: "Jawa Barat · Parahyangan",
    colors: ["indigo", "gold", "sage"],
    isPremium: true,
    isFeatured: true,
    description: "Rumah Julang Ngapak, wayang golek, dan kujang dalam lanskap Parahyangan yang hangat.",
    tokens: { background: "#f6edda", primary: "#182742", accent: "#bd8a37", text: "#2d2115" },
    preview: {
      src: "/themes/sunda-parahyangan/hero.webp",
      gradient: "linear-gradient(120deg, rgba(10,24,46,.5), rgba(10,24,46,.05))",
      textClass: "text-[#fff7e6]",
      objectPosition: "center",
    },
    assets: {
      hero: "/themes/sunda-parahyangan/hero.webp",
      "hero-portrait": "/themes/sunda-parahyangan/hero-portrait.webp",
      "cover-landscape": "/themes/sunda-parahyangan/cover-landscape.webp",
      "cover-portrait": "/themes/sunda-parahyangan/cover-portrait.webp",
      wayang: "/themes/sunda-parahyangan/wayang-golek.webp",
    },
  },
  {
    slug: "jawa-wayang-heritage",
    name: "Jawa Wayang Heritage",
    province: "Jawa Tengah",
    family: "jawa",
    style: "heritage",
    className: "heritage",
    motion: "kulit-sway",
    coverLabel: "Pawiwahan Jawa",
    greeting: "Sugeng rawuh. Mugi pitedah lan panuwun becik ndherek madhangi dina istimewa punika.",
    ornament: "Jawa Tengah · Pusaka",
    colors: ["brown", "cream", "gold"],
    isPremium: true,
    isFeatured: true,
    description: "Batik parang, gunungan, dan wayang Jawa dalam panggung soga yang tenang dan berkelas.",
    tokens: { background: "#f4ead8", primary: "#3b2119", accent: "#e8c275", text: "#251a12" },
    preview: {
      src: "/themes/jawa-wayang-heritage/wayang-jawa-transparent.webp",
      gradient: "linear-gradient(120deg, rgba(45,18,14,.48), rgba(232,194,117,.12))",
      textClass: "text-[#f6d894]",
      objectPosition: "center 22%",
    },
    assets: {
      hero: "/themes/jawa-wayang-heritage/wayang-jawa-transparent.webp",
      motif: "/themes/jawa-wayang-heritage/batik-parang.webp",
      wayang: "/themes/jawa-wayang-heritage/wayang-jawa-transparent.webp",
    },
  },
  {
    slug: "serambi-meukuta",
    name: "Serambi Meukuta",
    province: "Aceh",
    family: "nusantara",
    style: "nusantara",
    className: "nusantara aceh",
    motion: "aceh-carving",
    coverLabel: "Pernikahan Aceh",
    greeting: "Dengan takzim dan sukacita, keluarga kami menyambut kehadiran serta doa baik Anda.",
    ornament: "Aceh · Serambi Meukuta",
    colors: ["emerald", "cream", "gold"],
    isPremium: true,
    isFeatured: true,
    description: "Rumoh Aceh, ritme ukiran kayu, dan hijau zamrud yang teduh dalam komposisi lapang.",
    tokens: { background: "#f4efe3", surface: "#fffaf0", primary: "#153d32", secondary: "#d8c392", accent: "#c7a55b", text: "#20332c" },
    preview: {
      src: "/themes/serambi-meukuta/rumoh-aceh-hero.webp",
      gradient: "linear-gradient(180deg, rgba(8,30,24,.06), rgba(7,27,22,.76))",
      textClass: "text-[#fff6dd]",
      objectPosition: "58% center",
    },
    assets: {
      hero: "/themes/serambi-meukuta/rumoh-aceh-hero.webp",
      motif: "/themes/serambi-meukuta/aceh-floral-border.svg",
    },
  },
  {
    slug: "ulos-toba",
    name: "Ulos Toba",
    province: "Sumatera Utara",
    family: "nusantara",
    style: "nusantara",
    className: "nusantara toba",
    motion: "ulos-weave",
    coverLabel: "Pernikahan Batak Toba",
    greeting: "Horas. Dengan sukacita, keluarga kami menyambut kehadiran dan doa hangat Anda.",
    ornament: "Sumatera Utara · Toba",
    colors: ["red", "charcoal", "cream"],
    isPremium: true,
    isFeatured: true,
    description: "Rumah Bolon dan Danau Toba, dibingkai merah ulos, arang, krem, dan kuningan hangat.",
    tokens: { background: "#efe7da", surface: "#fffaf1", primary: "#321f1d", secondary: "#9f352f", accent: "#d8b06a", text: "#2e2421" },
    preview: {
      src: "/themes/ulos-toba/rumah-bolon-hero.webp",
      gradient: "linear-gradient(180deg, rgba(40,22,20,.05), rgba(35,21,19,.8))",
      textClass: "text-[#fff4e1]",
      objectPosition: "48% center",
    },
    assets: {
      hero: "/themes/ulos-toba/rumah-bolon-hero.webp",
      motif: "/themes/ulos-toba/ulos-woven-border.svg",
    },
  },
  {
    slug: "rangkiang-minang",
    name: "Rangkiang Minang",
    province: "Sumatera Barat",
    family: "nusantara",
    style: "nusantara",
    className: "nusantara minang",
    motion: "songket-glint",
    coverLabel: "Baralek Minangkabau",
    greeting: "Dengan penuh hormat, kami menyambut Bapak/Ibu/Saudara untuk berbagi kebahagiaan bersama.",
    ornament: "Sumatera Barat · Minangkabau",
    colors: ["red", "gold", "charcoal"],
    isPremium: true,
    isFeatured: true,
    description: "Rumah Gadang dan rangkiang dalam lanskap Minangkabau, dengan marun dan kilau songket.",
    tokens: { background: "#eee9df", surface: "#fffaf0", primary: "#272626", secondary: "#a84036", accent: "#d1a944", text: "#292723" },
    preview: {
      src: "/themes/rangkiang-minang/rumah-gadang-hero.webp",
      gradient: "linear-gradient(180deg, rgba(25,22,20,.05), rgba(21,18,17,.78))",
      textClass: "text-[#fff2cf]",
      objectPosition: "43% center",
    },
    assets: {
      hero: "/themes/rangkiang-minang/rumah-gadang-hero.webp",
      motif: "/themes/rangkiang-minang/songket-rhythm.svg",
    },
  },
  {
    slug: "melayu-lancang",
    name: "Melayu Lancang",
    province: "Riau",
    family: "nusantara",
    style: "nusantara",
    className: "nusantara riau",
    motion: "melayu-sulur",
    coverLabel: "Pernikahan Melayu Riau",
    greeting: "Dengan segala hormat dan sukacita, kami menjemput Anda hadir dalam hari bahagia keluarga kami.",
    ornament: "Riau · Lancang Kuning",
    colors: ["emerald", "gold", "ivory"],
    isPremium: true,
    isFeatured: true,
    description: "Rumah panggung Melayu dan Lancang Kuning di tepian sungai, berpadu zamrud dan sulur emas.",
    tokens: { background: "#f4f0e3", surface: "#fffcf3", primary: "#16483d", secondary: "#e4d08b", accent: "#c9a343", text: "#20352e" },
    preview: {
      src: "/themes/melayu-lancang/rumah-melayu-hero.webp",
      gradient: "linear-gradient(180deg, rgba(10,49,40,.04), rgba(8,42,34,.8))",
      textClass: "text-[#fff7d6]",
      objectPosition: "64% center",
    },
    assets: {
      hero: "/themes/melayu-lancang/rumah-melayu-hero.webp",
      motif: "/themes/melayu-lancang/melayu-sulur-border.svg",
    },
  },
  {
    slug: "selat-melayu",
    name: "Selat Melayu",
    province: "Kepulauan Riau",
    family: "nusantara",
    style: "nusantara",
    className: "nusantara kepri",
    motion: "tidal-drift",
    coverLabel: "Pernikahan Kepulauan Riau",
    greeting: "Dengan segenap hormat, kami mengundang Anda berlabuh sejenak dalam perayaan bahagia kami.",
    ornament: "Kepulauan Riau · Selat Melayu",
    colors: ["navy", "sand", "gold"],
    isPremium: true,
    isFeatured: true,
    description: "Lancang, pulau granit, dan balai pesisir dalam biru selat, pasir, serta garis peta laut.",
    tokens: { background: "#eef0ea", surface: "#fffaf0", primary: "#18384a", secondary: "#d8c7a5", accent: "#b69555", text: "#22333a" },
    preview: {
      src: "/themes/selat-melayu/selat-lancang-hero.webp",
      gradient: "linear-gradient(180deg, rgba(12,35,49,.04), rgba(8,29,43,.78))",
      textClass: "text-[#fff4d9]",
      objectPosition: "46% center",
    },
    assets: {
      hero: "/themes/selat-melayu/selat-lancang-hero.webp",
      motif: "/themes/selat-melayu/tidal-chart.svg",
    },
  },
  {
    slug: "bali-candi-bentar",
    name: "Bali Candi Bentar",
    province: "Bali",
    family: "nusantara",
    style: "nusantara",
    className: "nusantara bali",
    motion: "candi-open",
    coverLabel: "Pawiwahan Bali",
    greeting: "Dengan rasa syukur dan sukacita, kami menyambut kehadiran Anda dalam perayaan keluarga kami.",
    ornament: "Bali · Candi Bentar",
    colors: ["terracotta", "charcoal", "moss", "gold"],
    isPremium: true,
    isFeatured: true,
    description: "Candi Bentar, atap meru, terakota, batu vulkanik, dan hijau palem dalam suasana pagi yang hening.",
    tokens: { background: "#eee5d3", surface: "#fff9ed", primary: "#302923", secondary: "#a95536", accent: "#c59a52", text: "#312721" },
    preview: {
      src: "/themes/bali-candi-bentar/candi-bentar-hero.webp",
      gradient: "linear-gradient(180deg, rgba(31,26,22,.02), rgba(35,25,19,.78))",
      textClass: "text-[#fff3dc]",
      objectPosition: "center",
    },
    assets: { hero: "/themes/bali-candi-bentar/candi-bentar-hero.webp" },
  },
  {
    slug: "sasirangan-banjar",
    name: "Sasirangan Banjar",
    province: "Kalimantan Selatan",
    family: "nusantara",
    style: "nusantara",
    className: "nusantara banjar",
    motion: "sasirangan-ripple",
    coverLabel: "Pernikahan Banjar",
    greeting: "Dengan hangat dan penuh syukur, keluarga kami menyambut kehadiran serta doa baik Anda.",
    ornament: "Kalimantan Selatan · Banjar",
    colors: ["indigo", "violet", "teal", "gold"],
    isPremium: true,
    isFeatured: true,
    description: "Rumah Banjar Bubungan Tinggi di tepian sungai, dengan nila, ungu sasirangan, dan kuningan.",
    tokens: { background: "#eee7df", surface: "#fffaf1", primary: "#302742", secondary: "#665080", accent: "#c49a55", text: "#2b2733" },
    preview: {
      src: "/themes/sasirangan-banjar/bubungan-tinggi-hero.webp",
      gradient: "linear-gradient(180deg, rgba(37,27,52,.02), rgba(29,24,43,.8))",
      textClass: "text-[#fff1d8]",
      objectPosition: "53% center",
    },
    assets: { hero: "/themes/sasirangan-banjar/bubungan-tinggi-hero.webp" },
  },
  {
    slug: "pinisi-tongkonan",
    name: "Pinisi Tongkonan",
    province: "Sulawesi Selatan",
    family: "nusantara",
    style: "nusantara",
    className: "nusantara sulsel",
    motion: "pinisi-sail",
    coverLabel: "Pernikahan Sulawesi Selatan",
    greeting: "Dengan hormat dan sukacita, kami mengundang Anda mengiringi awal pelayaran hidup kami.",
    ornament: "Sulawesi Selatan · Pinisi",
    colors: ["navy", "teak", "ivory", "copper"],
    isPremium: true,
    isFeatured: true,
    description: "Pinisi Bulukumba dalam cahaya tembaga, dipadukan lengkung Tongkonan, kayu jati, dan biru laut.",
    tokens: { background: "#eee8dc", surface: "#fffaf0", primary: "#183144", secondary: "#8f573b", accent: "#c8874f", text: "#26313a" },
    preview: {
      src: "/themes/pinisi-tongkonan/pinisi-hero.webp",
      gradient: "linear-gradient(180deg, rgba(17,38,53,.02), rgba(15,35,49,.8))",
      textClass: "text-[#fff2d8]",
      objectPosition: "center",
    },
    assets: { hero: "/themes/pinisi-tongkonan/pinisi-hero.webp" },
  },
] as const satisfies readonly CulturalThemeDefinition[];

const culturalThemeBySlug = new Map<string, CulturalThemeDefinition>(
  culturalThemes.map((theme) => [theme.slug, theme]),
);

export function getCulturalTheme(slug: string) {
  return culturalThemeBySlug.get(slug);
}

export const culturalThemeStyles = Object.fromEntries(
  culturalThemes.map((theme) => [theme.slug, theme.className]),
);
