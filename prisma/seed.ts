import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();
const manifest = (colors: Record<string, string>, renderer: string) => ({ version: 1, renderer, tokens: { colors: { background: "#fbfaf8", surface: "#ffffff", primary: "#4338ca", secondary: "#e0e7ff", accent: "#c59b47", text: "#18212f", mutedText: "#5e6774", ...colors }, typography: { headingFont: "Georgia", bodyFont: "Arial" }, radius: { card: "1.25rem", button: "0.75rem" }, spacing: { section: "4.5rem" } }, sections: ["cover", "greeting", "people", "countdown", "schedule", "location", "gallery", "rsvp", "wishes", "closing"] });

const eventTypes = [
  ["pernikahan", "Pernikahan"], ["lamaran", "Lamaran"], ["tunangan", "Tunangan"], ["ulang-tahun", "Ulang tahun"], ["khitan", "Sunatan atau khitan"], ["aqiqah", "Aqiqah"], ["wisuda", "Wisuda"], ["reuni", "Reuni"], ["perusahaan", "Acara perusahaan"], ["seminar", "Seminar"], ["syukuran", "Syukuran"], ["umum", "Acara umum lainnya"]];
const themes = [
  ["jawa-wayang-heritage", "Jawa Wayang Heritage", "heritage", ["brown", "cream", "gold"], true, true, "Kental, hangat, dan berakar pada panggung tradisional Jawa.", { background: "#f4ead8", primary: "#3b2119", accent: "#e8c275", text: "#251a12" }],
  ["royal-batik", "Royal Batik", "formal", ["maroon", "cream", "gold"], true, false, "Pilihan premium yang formal untuk perayaan keluarga.", { background: "#fff8ec", primary: "#651d32", accent: "#d5ac5f", text: "#3b1520" }],
  ["floral-romance", "Floral Romance", "romantic", ["pastel", "pink"], true, true, "Pastel lembut dengan galeri yang menjadi pusat perhatian.", { background: "#fff7fa", primary: "#8c4d67", accent: "#e6a9be", text: "#4e3141" }],
  ["modern-minimal", "Modern Minimal", "minimal", ["neutral", "white"], false, true, "Tipografi kuat dan ruang lapang untuk semua jenis acara.", { background: "#f8fafc", primary: "#17212e", accent: "#4f46e5", text: "#17212e" }],
  ["islamic-emerald", "Islamic Emerald", "islamic", ["emerald", "gold"], true, false, "Geometri Islami orisinal bernuansa emerald dan emas.", { background: "#f8f5ea", primary: "#0c5146", accent: "#cfaa52", text: "#143a33" }],
  ["birthday-playful", "Birthday Playful", "playful", ["blue", "yellow"], false, false, "Ceria, ringan, dan siap untuk pesta ulang tahun.", { background: "#fff8c8", primary: "#253563", accent: "#ef6f66", text: "#253563" }],
  ["khitan-celebration", "Khitan Celebration", "islamic", ["green", "blue"], false, false, "Nuansa ramah anak untuk syukuran khitan.", { background: "#f1fbf2", primary: "#1d4e42", accent: "#287c9c", text: "#1d4e42" }],
  ["corporate-elegant", "Corporate Elegant", "corporate", ["navy", "gray"], true, true, "Tegas dan profesional untuk agenda, pembicara, dan tamu korporat.", { background: "#f5f7fa", primary: "#102b50", accent: "#52677f", text: "#14233a" }],
  ["sunda-parahyangan", "Sunda Parahyangan", "sunda", ["indigo", "gold", "sage"], true, true, "Rumah Julang Ngapak, wayang golek, dan kujang dalam lanskap Parahyangan yang hangat.", { background: "#f6edda", primary: "#182742", accent: "#bd8a37", text: "#2d2115" }],
  ["serambi-meukuta", "Serambi Meukuta", "nusantara", ["emerald", "cream", "gold"], true, true, "Komposisi lengkung yang tenang dalam hijau tua, gading, dan emas lembut.", { background: "#f4efe3", surface: "#fffaf0", primary: "#153d32", secondary: "#d8c392", accent: "#c7a55b", text: "#20332c" }],
  ["ulos-toba", "Ulos Toba", "nusantara", ["red", "charcoal", "cream"], true, true, "Ritme tenun geometris dan siluet atap yang tegas dalam palet merah arang.", { background: "#efe7da", surface: "#fffaf1", primary: "#321f1d", secondary: "#9f352f", accent: "#d8b06a", text: "#2e2421" }],
  ["rangkiang-minang", "Rangkiang Minang", "nusantara", ["red", "gold", "charcoal"], true, false, "Garis gonjong minimal dan lapisan songket yang ditenangkan oleh latar batu gelap.", { background: "#eee9df", surface: "#fffaf0", primary: "#272626", secondary: "#a84036", accent: "#d1a944", text: "#292723" }],
  ["melayu-lancang", "Melayu Lancang", "nusantara", ["emerald", "gold", "ivory"], true, false, "Ruang hijau zamrud dengan sulur abstrak dan aksen kuningan yang ringan.", { background: "#f4f0e3", surface: "#fffcf3", primary: "#16483d", secondary: "#e4d08b", accent: "#c9a343", text: "#20352e" }],
  ["selat-melayu", "Selat Melayu", "nusantara", ["navy", "sand", "gold"], true, false, "Ritme pasang-surut dalam biru laut, pasir, dan emas kusam.", { background: "#eef0ea", surface: "#fffaf0", primary: "#18384a", secondary: "#d8c7a5", accent: "#b69555", text: "#22333a" }]
] as const;

async function main() {
  const roles = await Promise.all(["SUPER_ADMIN", "ADMIN", "CUSTOMER"].map(key => prisma.role.upsert({ where: { key }, update: { name: key.replaceAll("_", " ") }, create: { key, name: key.replaceAll("_", " ") } })));
  const role = Object.fromEntries(roles.map(item => [item.key, item]));
  const passwordHash = await hash("Demo12345!", 12);
  const admin = await prisma.user.upsert({ where: { email: "admin@zenvora.test" }, update: { passwordHash, roleId: role.SUPER_ADMIN.id, name: "Zenvora Admin" }, create: { email: "admin@zenvora.test", name: "Zenvora Admin", passwordHash, roleId: role.SUPER_ADMIN.id } });
  const customer = await prisma.user.upsert({ where: { email: "customer@zenvora.test" }, update: { passwordHash, roleId: role.CUSTOMER.id, name: "Nadia Pratama" }, create: { email: "customer@zenvora.test", name: "Nadia Pratama", passwordHash, roleId: role.CUSTOMER.id } });
  await Promise.all(eventTypes.map(([slug, name]) => prisma.eventType.upsert({ where: { slug }, update: { name, isActive: true }, create: { slug, name, description: `Undangan digital untuk ${name.toLowerCase()}.` } })));
  const categories = await Promise.all([["heritage", "Heritage"], ["sunda", "Sunda"], ["nusantara", "Nusantara"], ["minimal", "Minimal"], ["romantic", "Romantic"], ["islamic", "Islamic"], ["playful", "Playful"], ["corporate", "Corporate"], ["formal", "Formal"]].map(([slug, name]) => prisma.themeCategory.upsert({ where: { slug }, update: { name }, create: { slug, name } })));
  const categoryBySlug = Object.fromEntries(categories.map(category => [category.slug, category]));
  for (const [slug, name, style, colors, isPremium, isFeatured, description, colorTokens] of themes) {
    const theme = await prisma.theme.upsert({ where: { slug }, update: { name, style, colors: [...colors], isPremium, isFeatured, isActive: true, description, categoryId: categoryBySlug[style]?.id }, create: { slug, name, style, colors: [...colors], isPremium, isFeatured, description, categoryId: categoryBySlug[style]?.id } });
    await prisma.themeVersion.upsert({ where: { themeId_version: { themeId: theme.id, version: 1 } }, update: { manifest: manifest(colorTokens, style), isCurrent: true }, create: { themeId: theme.id, version: 1, manifest: manifest(colorTokens, style), isCurrent: true } });
    const asset = slug === "sunda-parahyangan"
      ? { key: "hero", path: "/themes/sunda-parahyangan/hero.png", source: "Zenvora original AI-assisted illustration", license: "Proprietary original, internal use" }
      : style !== "nusantara" ? { key: "ornament", path: `/themes/${slug}/ornament.svg`, source: "Zenvora original SVG", license: "Proprietary original, internal use" } : null;
    if (asset) await prisma.themeAsset.upsert({ where: { themeId_key: { themeId: theme.id, key: asset.key } }, update: asset, create: { themeId: theme.id, ...asset } });
    if (slug === "sunda-parahyangan") await prisma.themeAsset.upsert({ where: { themeId_key: { themeId: theme.id, key: "hero-portrait" } }, update: { path: "/themes/sunda-parahyangan/hero-portrait.png", source: "Zenvora original AI-assisted illustration", license: "Proprietary original, internal use" }, create: { themeId: theme.id, key: "hero-portrait", path: "/themes/sunda-parahyangan/hero-portrait.png", source: "Zenvora original AI-assisted illustration", license: "Proprietary original, internal use" } });
  }
  const packageSeeds: { slug: string; name: string; description: string; price: number; guestLimit: number; activeDays: number; features: string[]; aiMonthlyCredits: number; pageVersionLimit: number }[] = [
    { slug: "free-demo", name: "Free Demo", description: "Mulai mencoba tanpa risiko.", price: 0, guestLimit: 20, activeDays: 14, features: ["Satu tema gratis", "Maksimum 20 tamu", "Watermark Zenvora Invite"], aiMonthlyCredits: 5, pageVersionLimit: 10 },
    { slug: "basic", name: "Basic", description: "Semua yang diperlukan untuk sebuah acara keluarga.", price: 99000, guestLimit: 300, activeDays: 180, features: ["Tema basic", "RSVP", "Galeri", "Ucapan", "Aktif enam bulan"], aiMonthlyCredits: 50, pageVersionLimit: 30 },
    { slug: "premium", name: "Premium", description: "Kapasitas dan fitur lengkap untuk momen besar.", price: 199000, guestLimit: 1000, activeDays: 365, features: ["Semua tema", "QR check-in", "Analytics", "Kado digital", "Tanpa watermark"], aiMonthlyCredits: 200, pageVersionLimit: 100 }
  ];
  const packages = await Promise.all(packageSeeds.map(item => prisma.package.upsert({ where: { slug: item.slug }, update: { ...item, isActive: true }, create: item })));
  const typeBySlug = Object.fromEntries((await prisma.eventType.findMany()).map(item => [item.slug, item]));
  const themeBySlug = Object.fromEntries((await prisma.theme.findMany()).map(item => [item.slug, item]));
  const sectionData = ["cover", "greeting", "people", "countdown", "schedule", "location", "gallery", "rsvp", "wishes", "closing"].map((key, position) => ({ key, position, enabled: true }));
  const demos = [
    ["arif-dan-siti", "Pernikahan Arif & Siti", "pernikahan", "jawa-wayang-heritage", new Date("2026-12-20T10:00:00+07:00"), "Pendopo Arunika", "Jl. Melati Raya 12, Jakarta Selatan"],
    ["ulang-tahun-aya", "Ulang Tahun Aya ke-7", "ulang-tahun", "birthday-playful", new Date("2026-09-14T15:00:00+07:00"), "Rumah Keluarga Pratama", "Jl. Kemuning 8, Bandung"],
    ["khitan-rafa", "Syukuran Khitan Rafa", "khitan", "khitan-celebration", new Date("2026-10-04T09:00:00+07:00"), "Masjid Al-Ikhlas", "Jl. Pahlawan 21, Bekasi"]
  ] as const;
  for (const [slug, title, typeSlug, themeSlug, startsAt, locationName, locationAddress] of demos) {
    const event = await prisma.event.upsert({ where: { slug }, update: { title, status: "PUBLISHED", themeId: themeBySlug[themeSlug].id, packageId: packages[2].id, startsAt, locationName, locationAddress, description: "Dengan penuh kebahagiaan, kami mengundang Anda untuk berbagi momen istimewa bersama keluarga kami." }, create: { ownerId: customer.id, eventTypeId: typeBySlug[typeSlug].id, themeId: themeBySlug[themeSlug].id, packageId: packages[2].id, title, slug, status: "PUBLISHED", startsAt, locationName, locationAddress, description: "Dengan penuh kebahagiaan, kami mengundang Anda untuk berbagi momen istimewa bersama keluarga kami.", sections: { create: sectionData } } });
    if (event.slug === "arif-dan-siti") { await prisma.eventPerson.deleteMany({ where: { eventId: event.id } }); await prisma.eventSchedule.deleteMany({ where: { eventId: event.id } }); await prisma.eventPerson.createMany({ data: [{ eventId: event.id, name: "Arif Pratama", role: "Mempelai", position: 0 }, { eventId: event.id, name: "Siti Ananda", role: "Mempelai", position: 1 }] }); await prisma.eventSchedule.create({ data: { eventId: event.id, title: "Akad & Resepsi", startsAt, location: locationName } }); const token = "8Fs92KmPZwVfBudi"; const guest = await prisma.guest.upsert({ where: { token }, update: { eventId: event.id, name: "Budi Santoso", phone: "081234567890", seats: 2 }, create: { eventId: event.id, name: "Budi Santoso", phone: "081234567890", seats: 2, token } }); await prisma.rSVP.upsert({ where: { guestId: guest.id }, update: { status: "ATTENDING", attendees: 2 }, create: { eventId: event.id, guestId: guest.id, status: "ATTENDING", attendees: 2 } }); await prisma.wish.upsert({ where: { id: "seed-wish-arif-siti" }, update: { message: "Semoga menjadi keluarga yang hangat dan penuh berkah.", status: "APPROVED" }, create: { id: "seed-wish-arif-siti", eventId: event.id, guestId: guest.id, author: "Budi Santoso", message: "Semoga menjadi keluarga yang hangat dan penuh berkah.", status: "APPROVED" } }); }
  }
  await prisma.systemSetting.upsert({ where: { key: "brand" }, update: { value: { name: "Zenvora Invite", email: "hello@example.com" } }, create: { key: "brand", value: { name: "Zenvora Invite", email: "hello@example.com" } } });
  await prisma.aIProviderConfiguration.upsert({ where: { provider: "mock" }, update: { displayName: "Mock Image Provider", isEnabled: true, creditCost: 0, configuration: { adapter: "mock", secrets: "environment-only" } }, create: { provider: "mock", displayName: "Mock Image Provider", isEnabled: true, creditCost: 0, configuration: { adapter: "mock", secrets: "environment-only" } } });
  await prisma.auditLog.create({ data: { actorId: admin.id, action: "SEED_COMPLETED", entity: "System", metadata: { source: "prisma seed" } } });
}
main().then(() => prisma.$disconnect()).catch(async error => { console.error(error); await prisma.$disconnect(); process.exit(1); });
