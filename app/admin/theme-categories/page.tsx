import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function AdminCategories() { const categories = await prisma.themeCategory.findMany({ include: { _count: { select: { themes: true } } }, orderBy: { name: "asc" } }); return <><h2 className="text-2xl font-bold">Kategori tema</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{categories.map(category => <div className="card p-5" key={category.id}><h3 className="font-bold">{category.name}</h3><p className="mt-1 text-sm text-slate-600">{category._count.themes} tema</p></div>)}</div></>; }
