import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [themes, events] = await Promise.all([
    prisma.theme.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true, isFeatured: true } }),
    prisma.event.findMany({
      where: { status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null },
      select: { slug: true, updatedAt: true, startsAt: true },
      orderBy: { updatedAt: "desc" },
      take: 500,
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/templates"), lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/pricing"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/features"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/about"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contact"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const templatePages = themes.map((theme) => ({
    url: absoluteUrl(`/templates/${theme.slug}`),
    lastModified: theme.updatedAt,
    changeFrequency: "weekly" as const,
    priority: theme.isFeatured ? 0.85 : 0.7,
  }));

  const invitationPages = events.map((event) => ({
    url: absoluteUrl(`/i/${event.slug}`),
    lastModified: event.updatedAt,
    changeFrequency: "weekly" as const,
    priority: event.startsAt && event.startsAt > new Date() ? 0.75 : 0.45,
  }));

  return [...staticPages, ...templatePages, ...invitationPages];
}
