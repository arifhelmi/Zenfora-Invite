import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { createSeoMetadata, defaultSeoDescription, getBaseUrl, siteName } from "@/lib/seo";

export const metadata: Metadata = {
  ...createSeoMetadata({
    title: "Zenvora Invite - Undangan Digital Elegan dan Interaktif",
    description: defaultSeoDescription,
    path: "/",
  }),
  metadataBase: getBaseUrl(),
  applicationName: siteName,
  category: "Wedding Invitation Platform",
  keywords: [
    "undangan digital",
    "undangan online",
    "undangan pernikahan digital",
    "template undangan",
    "undangan jawa",
    "undangan sunda",
    "RSVP online",
    "QR check-in",
    "Zenvora Invite",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  title: { default: "Zenvora Invite - Undangan Digital Elegan dan Interaktif", template: "%s | Zenvora Invite" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body><SiteHeader />{children}<SiteFooter /></body></html>;
}
