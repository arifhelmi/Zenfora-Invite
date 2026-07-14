import type { Metadata } from "next";

export const siteName = "Zenvora Invite";
export const defaultSeoDescription =
  "Buat undangan digital elegan untuk pernikahan, ulang tahun, syukuran, dan acara kantor dengan RSVP, galeri, musik, QR check-in, dan template Nusantara.";

export function getBaseUrl() {
  return new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
}

export function absoluteUrl(path = "/") {
  return new URL(path, getBaseUrl()).toString();
}

export function cleanText(value?: string | null, fallback = "") {
  return (value ?? fallback).replace(/\s+/g, " ").trim();
}

export function truncateSeo(value: string, maxLength = 155) {
  const text = cleanText(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export function createSeoMetadata({
  title,
  description = defaultSeoDescription,
  path = "/",
  image = "/og.png",
  noIndex = false,
  type = "website",
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string | null;
  noIndex?: boolean;
  type?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = image?.startsWith("http") ? image : absoluteUrl(image ?? "/og.png");
  const safeDescription = truncateSeo(description);

  return {
    title,
    description: safeDescription,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    openGraph: {
      title,
      description: safeDescription,
      url,
      siteName,
      locale: "id_ID",
      type,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: safeDescription,
      images: [imageUrl],
    },
  };
}
