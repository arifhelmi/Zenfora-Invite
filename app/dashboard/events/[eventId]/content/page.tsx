import { SectionsEditor } from "@/components/dashboard/event-forms";
import { prisma } from "@/lib/prisma";
import { sectionLabelByKey, sectionRegistry } from "@/lib/section-registry";
export const dynamic = "force-dynamic";
export default async function ContentPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const savedSections = await prisma.eventSection.findMany({ where: { eventId }, orderBy: { position: "asc" } });
  const savedByKey = new Map(savedSections.map((section) => [section.key, section]));
  const sections = sectionRegistry.map(([key], position) => {
    const section = savedByKey.get(key);
    return { key, label: sectionLabelByKey[key], enabled: section?.enabled ?? true, position: section?.position ?? position };
  }).sort((a, b) => a.position - b.position);
  return <><p className="eyebrow">Konten undangan</p><h1 className="mt-1 text-3xl font-bold">Atur alur undangan</h1><p className="mt-2 max-w-2xl text-slate-600">Setiap bagian menjadi layar baru saat tamu menggulir. Aktifkan, nonaktifkan, atau ubah urutannya untuk mengatur alur cerita undangan.</p><div className="mt-7 max-w-2xl"><SectionsEditor eventId={eventId} sections={sections} /></div></>;
}
