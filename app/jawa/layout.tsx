import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sekar & Bagas | Undangan Jawa",
  description: "Undangan pernikahan dengan nuansa Jawa klasik yang hangat.",
};

export default function JawaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
