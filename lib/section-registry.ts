export const sectionRegistry = [
  ["cover", "Sampul"],
  ["greeting", "Salam hangat"],
  ["people", "Penyelenggara"],
  ["countdown", "Hitung mundur"],
  ["schedule", "Rangkaian acara"],
  ["location", "Lokasi"],
  ["gallery", "Galeri"],
  ["rsvp", "Konfirmasi kehadiran"],
  ["wishes", "Ucapan & doa"],
  ["closing", "Penutup"]
] as const;

export type SectionKey = typeof sectionRegistry[number][0];
export const sectionLabelByKey = Object.fromEntries(sectionRegistry) as Record<SectionKey, string>;
