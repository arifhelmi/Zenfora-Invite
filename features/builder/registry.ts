import type { BlockContent, BlockType, PageType } from "@/features/builder/types";

export type BlockDefinition = {
  type: BlockType;
  label: string;
  group: "Teks" | "Media" | "Acara" | "Interaktif" | "Layout";
  defaultContent: BlockContent;
};

const definitions: BlockDefinition[] = [
  { type: "heading", label: "Judul", group: "Teks", defaultContent: { text: "Judul halaman" } },
  { type: "text", label: "Teks", group: "Teks", defaultContent: { text: "Tuliskan pesan Anda di sini." } },
  { type: "image", label: "Gambar", group: "Media", defaultContent: { alt: "Foto undangan" } },
  { type: "generated-image", label: "Gambar AI", group: "Media", defaultContent: { alt: "Gambar hasil AI" } },
  { type: "decorative-image", label: "Dekorasi", group: "Media", defaultContent: { alt: "Dekorasi" } },
  { type: "button", label: "Tombol", group: "Interaktif", defaultContent: { label: "Lihat selengkapnya", url: "#" } },
  { type: "open-invitation-button", label: "Buka undangan", group: "Interaktif", defaultContent: { label: "Buka Undangan", url: "#detail" } },
  { type: "countdown", label: "Hitung mundur", group: "Acara", defaultContent: {} },
  { type: "person-profile", label: "Profil", group: "Acara", defaultContent: {} },
  { type: "couple-profile", label: "Profil mempelai", group: "Acara", defaultContent: {} },
  { type: "event-card", label: "Kartu acara", group: "Acara", defaultContent: {} },
  { type: "maps-button", label: "Tombol peta", group: "Interaktif", defaultContent: { label: "Buka Peta" } },
  { type: "calendar-button", label: "Simpan kalender", group: "Interaktif", defaultContent: { label: "Simpan Tanggal" } },
  { type: "gallery", label: "Galeri", group: "Media", defaultContent: {} },
  { type: "video", label: "Video", group: "Media", defaultContent: {} },
  { type: "story-timeline", label: "Linimasa cerita", group: "Acara", defaultContent: {} },
  { type: "rsvp-form", label: "Form RSVP", group: "Interaktif", defaultContent: {} },
  { type: "wishes-list", label: "Daftar ucapan", group: "Interaktif", defaultContent: {} },
  { type: "wishes-form", label: "Form ucapan", group: "Interaktif", defaultContent: {} },
  { type: "gift-method", label: "Metode kado", group: "Interaktif", defaultContent: {} },
  { type: "bank-account", label: "Rekening bank", group: "Interaktif", defaultContent: {} },
  { type: "qr-code", label: "Kode QR", group: "Interaktif", defaultContent: {} },
  { type: "divider", label: "Garis pemisah", group: "Layout", defaultContent: {} },
  { type: "music-controller", label: "Kontrol musik", group: "Interaktif", defaultContent: {} },
  { type: "social-link", label: "Tautan sosial", group: "Interaktif", defaultContent: { label: "Instagram", url: "#" } },
  { type: "spacer", label: "Jarak", group: "Layout", defaultContent: {} },
  { type: "container", label: "Container", group: "Layout", defaultContent: {} },
];

export const BLOCK_REGISTRY = Object.fromEntries(definitions.map((item) => [item.type, item])) as Record<BlockType, BlockDefinition>;
export const BLOCK_DEFINITIONS = definitions;

export const PAGE_TYPE_LABELS: Record<PageType, string> = {
  blank: "Kosong", cover: "Cover", greeting: "Sambutan", quote: "Kutipan", profile: "Profil",
  couple: "Mempelai", "event-schedule": "Jadwal acara", location: "Lokasi", countdown: "Hitung mundur",
  story: "Cerita", gallery: "Galeri", video: "Video", "dress-code": "Dress code", rundown: "Rundown",
  rsvp: "RSVP", wishes: "Ucapan", gift: "Kado", "qr-guest": "QR tamu", closing: "Penutup", custom: "Custom",
};

export function defaultBlocksForPage(pageType: PageType): Array<{ type: BlockType; content: BlockContent; dataBinding?: string; layoutPreset?: string }> {
  if (pageType === "cover") return [
    { type: "text", content: { text: "THE WEDDING OF" }, layoutPreset: "top-center" },
    { type: "heading", content: { text: "Nama Mempelai" }, dataBinding: "event.coupleNames", layoutPreset: "center" },
    { type: "text", content: { text: "Tanggal acara" }, dataBinding: "event.primaryDate", layoutPreset: "below-heading" },
    { type: "open-invitation-button", content: { label: "Buka Undangan", url: "#detail" }, layoutPreset: "bottom-center" },
  ];
  if (pageType === "greeting") return [{ type: "heading", content: { text: "Salam Hangat" } }, { type: "text", content: { text: "Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir." }, dataBinding: "event.description" }];
  if (pageType === "couple") return [{ type: "heading", content: { text: "Mempelai" } }, { type: "couple-profile", content: {} }];
  if (pageType === "event-schedule" || pageType === "rundown") return [{ type: "heading", content: { text: "Rangkaian Acara" } }, { type: "event-card", content: {} }];
  if (pageType === "location") return [{ type: "heading", content: { text: "Lokasi Acara" } }, { type: "maps-button", content: { label: "Buka Peta" } }];
  if (pageType === "countdown") return [{ type: "heading", content: { text: "Menuju Hari Istimewa" } }, { type: "countdown", content: {} }];
  if (pageType === "gallery") return [{ type: "heading", content: { text: "Galeri" } }, { type: "gallery", content: {} }];
  if (pageType === "rsvp") return [{ type: "heading", content: { text: "Konfirmasi Kehadiran" } }, { type: "rsvp-form", content: {} }];
  if (pageType === "wishes") return [{ type: "heading", content: { text: "Ucapan dan Doa" } }, { type: "wishes-form", content: {} }, { type: "wishes-list", content: {} }];
  if (pageType === "gift") return [{ type: "heading", content: { text: "Kado Pernikahan" } }, { type: "gift-method", content: {} }];
  if (pageType === "closing") return [{ type: "heading", content: { text: "Terima Kasih" } }, { type: "text", content: { text: "Kehadiran dan doa Anda sangat berarti bagi kami." } }];
  return [];
}
