import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleDashed,
  Eye,
  MailOpen,
  MapPin,
  MessageCircleHeart,
  Plus,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  DRAFT: "Draf",
  PUBLISHED: "Tayang",
  ARCHIVED: "Diarsipkan",
  DISABLED: "Nonaktif",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const eventScope = { ownerId: user.id, deletedAt: null };
  const today = new Date();

  const [events, totalEvents, totalGuests, totalRsvps, totalVisits, publishedEvents, themedEvents, upcomingEvent] = await Promise.all([
    prisma.event.findMany({
      where: eventScope,
      include: {
        eventType: true,
        theme: true,
        _count: { select: { guests: true, rsvps: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.event.count({ where: eventScope }),
    prisma.guest.count({ where: { event: eventScope, deletedAt: null } }),
    prisma.rSVP.count({ where: { event: eventScope } }),
    prisma.invitationVisit.count({ where: { event: eventScope } }),
    prisma.event.count({ where: { ...eventScope, status: "PUBLISHED" } }),
    prisma.event.count({ where: { ...eventScope, themeId: { not: null } } }),
    prisma.event.findFirst({
      where: { ...eventScope, startsAt: { gte: today }, status: { notIn: ["ARCHIVED", "DISABLED"] } },
      orderBy: { startsAt: "asc" },
      select: { id: true, title: true, startsAt: true, locationName: true },
    }),
  ]);

  const responseRate = totalGuests > 0 ? Math.round((totalRsvps / totalGuests) * 100) : 0;
  const firstName = user.name?.split(" ")[0] ?? "teman";
  const dateLabel = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(today);

  const stats = [
    { label: "Total undangan", value: totalEvents, note: `${publishedEvents} sedang tayang`, icon: MailOpen, tone: "coral" },
    { label: "Daftar tamu", value: totalGuests, note: "di seluruh acara", icon: UsersRound, tone: "blue" },
    { label: "Konfirmasi RSVP", value: totalRsvps, note: `${responseRate}% tingkat respons`, icon: MessageCircleHeart, tone: "green" },
    { label: "Kunjungan", value: totalVisits, note: "ke halaman undangan", icon: Eye, tone: "sand" },
  ];

  const checklist = [
    { label: "Buat undangan pertama", complete: totalEvents > 0 },
    { label: "Pilih desain undangan", complete: themedEvents > 0 },
    { label: "Tambahkan daftar tamu", complete: totalGuests > 0 },
    { label: "Publikasikan undangan", complete: publishedEvents > 0 },
  ];
  const completedSteps = checklist.filter((item) => item.complete).length;

  return (
    <div className="dashboard-overview">
      <header className="dashboard-page-header">
        <div>
          <p className="dashboard-date">{dateLabel}</p>
          <h1>Selamat datang kembali, <em>{firstName}.</em></h1>
          <p>Semua yang Anda perlukan untuk menyiapkan hari istimewa, dalam satu tempat.</p>
        </div>
        <Link className="dashboard-primary-action" href="/dashboard/events/new">
          <Plus aria-hidden="true" size={18} />
          Buat undangan
        </Link>
      </header>

      <section className="dashboard-hero-card">
        <div className="dashboard-hero-copy">
          <span className="dashboard-hero-kicker"><Sparkles size={14} /> Ruang persiapan Anda</span>
          {upcomingEvent ? (
            <>
              <h2>{upcomingEvent.title}</h2>
              <div className="dashboard-upcoming-meta">
                <span><CalendarDays size={16} /> {formatDate(upcomingEvent.startsAt)}</span>
                {upcomingEvent.locationName && <span><MapPin size={16} /> {upcomingEvent.locationName}</span>}
              </div>
              <Link href={`/dashboard/events/${upcomingEvent.id}`}>Lanjutkan persiapan <ArrowRight size={16} /></Link>
            </>
          ) : (
            <>
              <h2>Mulai dari satu cerita yang ingin Anda bagikan.</h2>
              <p>Buat draf, pilih desain, lalu undang orang-orang tersayang saat semuanya siap.</p>
              <Link href="/dashboard/events/new">Mulai membuat <ArrowRight size={16} /></Link>
            </>
          )}
        </div>
        <div className="dashboard-hero-art" aria-hidden="true">
          <span className="dashboard-orbit dashboard-orbit-one" />
          <span className="dashboard-orbit dashboard-orbit-two" />
          <span className="dashboard-envelope"><MailOpen size={46} strokeWidth={1.2} /></span>
        </div>
      </section>

      <section className="dashboard-stats" aria-label="Statistik akun">
        {stats.map(({ label, value, note, icon: Icon, tone }) => (
          <article className="dashboard-stat-card" key={label}>
            <span className={`dashboard-stat-icon is-${tone}`}><Icon size={20} strokeWidth={1.8} /></span>
            <div>
              <p>{label}</p>
              <strong>{value.toLocaleString("id-ID")}</strong>
              <small>{note}</small>
            </div>
          </article>
        ))}
      </section>

      <div className="dashboard-content-grid">
        <section className="dashboard-panel dashboard-recent-panel">
          <div className="dashboard-panel-heading">
            <div>
              <span>TERBARU</span>
              <h2>Undangan Anda</h2>
            </div>
            <Link href="/dashboard/events">Lihat semua <ArrowRight size={15} /></Link>
          </div>

          <div className="dashboard-event-list">
            {events.map((event, index) => {
              const progress = event._count.guests > 0
                ? Math.round((event._count.rsvps / event._count.guests) * 100)
                : 0;
              return (
                <Link className="dashboard-event-row" href={`/dashboard/events/${event.id}`} key={event.id}>
                  <span className={`dashboard-event-thumb tone-${index % 4}`}>
                    {event.title.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="dashboard-event-info">
                    <span className="dashboard-event-title-line">
                      <strong>{event.title}</strong>
                      <small className={`dashboard-status is-${event.status.toLowerCase()}`}>
                        {statusLabels[event.status] ?? event.status}
                      </small>
                    </span>
                    <small>{event.theme?.name ?? event.eventType.name} · {formatDate(event.startsAt)}</small>
                    <span className="dashboard-event-progress">
                      <i><b style={{ width: `${progress}%` }} /></i>
                      <small>{event._count.rsvps}/{event._count.guests} RSVP</small>
                    </span>
                  </span>
                  <ArrowRight className="dashboard-row-arrow" size={18} />
                </Link>
              );
            })}
            {events.length === 0 && (
              <div className="dashboard-empty-state">
                <span><MailOpen size={28} strokeWidth={1.5} /></span>
                <h3>Belum ada undangan</h3>
                <p>Undangan pertama Anda hanya perlu beberapa menit untuk dibuat.</p>
                <Link href="/dashboard/events/new">Buat undangan pertama <ArrowRight size={15} /></Link>
              </div>
            )}
          </div>
        </section>

        <aside className="dashboard-panel dashboard-checklist-panel">
          <div className="dashboard-panel-heading">
            <div>
              <span>PANDUAN</span>
              <h2>Siapkan undangan</h2>
            </div>
            <strong>{completedSteps}/{checklist.length}</strong>
          </div>
          <div className="dashboard-checklist-progress">
            <span style={{ width: `${(completedSteps / checklist.length) * 100}%` }} />
          </div>
          <div className="dashboard-checklist">
            {checklist.map((item) => (
              <div className={item.complete ? "is-complete" : ""} key={item.label}>
                <span>{item.complete ? <Check size={15} /> : <CircleDashed size={17} />}</span>
                <p>{item.label}</p>
              </div>
            ))}
          </div>
          <Link className="dashboard-guide-link" href={totalEvents > 0 ? "/dashboard/events" : "/dashboard/events/new"}>
            {totalEvents > 0 ? "Lanjutkan pengaturan" : "Mulai sekarang"}
            <ArrowRight size={15} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
