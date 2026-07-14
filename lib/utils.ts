import { customAlphabet } from "./tokens";

export function slugify(input: string) {
  return input
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    .slice(0, 72) || "acara";
}

export function formatCurrency(amount: number, currency = "IDR") {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date?: Date | null) {
  return date ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(date) : "Belum ditentukan";
}

export function uniqueSlug(title: string, suffix = customAlphabet(5)) {
  return `${slugify(title)}-${suffix}`;
}
