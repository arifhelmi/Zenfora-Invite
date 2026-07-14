import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { InvitationRenderer } from "@/components/invitation/renderer";
import { createSeoMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const theme = await prisma.theme.findUnique({ where: { slug }, select: { name: true, description: true, previewUrl: true, isPremium: true } });
  if (!theme) return createSeoMetadata({ title: "Template Undangan", path: `/templates/${slug}`, noIndex: true });

  return createSeoMetadata({
    title: `${theme.name} - Template Undangan Digital${theme.isPremium ? " Premium" : ""}`,
    description: theme.description,
    path: `/templates/${slug}`,
    image: theme.previewUrl ?? "/og.png",
  });
}
export default async function TemplateDemo({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const theme = await prisma.theme.findUnique({ where: { slug }, include: { versions: true } }); if (!theme) notFound(); return <main><div className="shell flex flex-wrap items-center justify-between gap-4 py-5"><div><p className="eyebrow">Demo template</p><h1 className="text-2xl font-bold">{theme.name}</h1></div><Link className="button" href={`/register?theme=${theme.slug}`}>Gunakan template ini</Link></div><InvitationRenderer theme={theme} event={{ title: "Arif & Siti", slug: "demo", description: "Dengan penuh kebahagiaan, kami mengundang Anda untuk berbagi momen istimewa.", startsAt: new Date("2026-12-20T10:00:00+07:00"), locationName: "Pendopo Arunika", locationAddress: "Jakarta Selatan", people: [{ name: "Arif Pratama", role: "Mempelai" }, { name: "Siti Ananda", role: "Mempelai" }], schedules: [{ title: "Akad & Resepsi", startsAt: new Date("2026-12-20T10:00:00+07:00"), location: "Pendopo Arunika" }], sections: [] }} /></main>; }
