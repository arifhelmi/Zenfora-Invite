import { Fragment } from "react";
import type { Theme, ThemeVersion } from "@prisma/client";
import { Countdown } from "@/components/invitation/countdown";
import { RsvpForm, WishForm } from "@/components/invitation/guest-forms";
import { InvitationMusicPlayer } from "@/components/invitation/music-player";
import { InvitationScrollEffects } from "@/components/invitation/scroll-effects";
import { getCulturalTheme } from "@/lib/cultural-themes";
import { formatDate } from "@/lib/utils";
import { resolveManifest, themeStyles } from "@/lib/theme-engine";

type RenderEvent = {
  title: string; slug: string; description?: string | null; startsAt?: Date | null; locationName?: string | null; locationAddress?: string | null;
  people: { name: string; role: string; bio?: string | null; photoUrl?: string | null }[];
  schedules: { title: string; startsAt: Date; location?: string | null }[];
  sections: { key: string; enabled: boolean; position?: number }[];
  wishes?: { id: string; author: string; message: string }[];
  details?: unknown;
};

function getMusic(details: unknown) {
  if (!details || typeof details !== "object" || Array.isArray(details)) return null;
  const music = (details as Record<string, unknown>).music;
  if (!music || typeof music !== "object" || Array.isArray(music)) return null;
  const { url, title } = music as Record<string, unknown>;
  return typeof url === "string" && url ? { url, title: typeof title === "string" ? title : undefined } : null;
}

const contentKeys = ["greeting", "people", "countdown", "schedule", "location", "gallery", "rsvp", "wishes", "closing"] as const;
const defaultSections = ["cover", ...contentKeys];

export function InvitationRenderer({ theme, event, guest, isPreview = false }: { theme: Theme & { versions: ThemeVersion[] }; event: RenderEvent; guest?: { token: string; name: string; seats: number }; isPreview?: boolean }) {
  const manifest = resolveManifest(theme);
  const tokens = manifest.tokens.colors;
  const culturalTheme = getCulturalTheme(theme.slug);
  const isSunda = culturalTheme?.family === "sunda";
  const isJawa = culturalTheme?.family === "jawa";
  const isNusantara = culturalTheme?.family === "nusantara";
  const isCultural = Boolean(culturalTheme);
  const music = getMusic(event.details);
  const panelClass = (name: string, className = "section") => `${className}${isSunda ? ` sunda-panel sunda-${name}` : ""}${isJawa ? ` jawa-panel jawa-${name}` : ""}${isNusantara ? ` nusantara-panel nusantara-${name}` : ""}`;
  const revealProps = isCultural ? { "data-invitation-reveal": "true", "data-sunda-reveal": isSunda ? "true" : undefined } : {};
  const ornament = culturalTheme?.ornament;
  const orderedSections = (event.sections.length ? event.sections : defaultSections.map((key, position) => ({ key, enabled: true, position })))
    .filter((section) => section.enabled && section.key !== "cover" && contentKeys.includes(section.key as typeof contentKeys[number]))
    .sort((left, right) => (left.position ?? 0) - (right.position ?? 0));
  const scheduleItems = event.schedules.length ? event.schedules : event.startsAt ? [{ title: "Acara utama", startsAt: event.startsAt, location: event.locationName }] : [];

  const renderSection = (key: string) => {
    if (key === "greeting") return <section {...revealProps} className={panelClass("greeting", "section text-center")}><div className="content"><p className="eyebrow">Salam hangat</p>{culturalTheme?.greeting && <p className={isJawa ? "jawa-kawih" : "cultural-greeting"}>{culturalTheme.greeting}</p>}<p className="mt-4 text-xl leading-8">{event.description || "Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir dan berbagi doa baik."}</p></div></section>;
    if (key === "people") return <section {...revealProps} className={panelClass("people")}><div className="content text-center"><p className="eyebrow">Penyelenggara</p><div className="mt-8 grid gap-10 sm:grid-cols-2">{event.people.length ? event.people.map((person) => <article className="invite-person" key={`${person.name}-${person.role}`}><div className={`portrait-frame${isSunda ? " sunda-portrait-frame" : isJawa ? " jawa-portrait-frame" : isNusantara ? " nusantara-portrait-frame" : ""}`}>{person.photoUrl ? <img src={person.photoUrl} alt={`Foto ${person.name}`} /> : <span aria-hidden="true">{person.name.trim().slice(0, 1).toUpperCase()}</span>}</div><p className="mt-5 font-serif text-2xl">{person.name}</p><p className="mt-2 text-sm opacity-75">{person.role}</p>{person.bio && <p className="mt-3 text-sm">{person.bio}</p>}</article>) : isPreview ? <div className="invite-card sm:col-span-2"><p className="font-semibold">Nama penyelenggara akan tampil di sini</p><p className="mt-2 text-sm opacity-75">Tambahkan pasangan, keluarga, atau panitia pada detail acara.</p></div> : null}</div></div></section>;
    if (key === "countdown") return <section {...revealProps} className={panelClass("countdown", "section text-center")}><div className="content"><p className="eyebrow">Menuju hari istimewa</p>{event.startsAt ? <Countdown date={event.startsAt} /> : isPreview ? <div className="invite-card mt-6"><p>Tentukan tanggal dan waktu acara agar hitung mundur aktif.</p></div> : null}</div></section>;
    if (key === "schedule") return <section {...revealProps} className={panelClass("schedule")}><div className="content"><p className="eyebrow text-center">Rangkaian acara</p><div className="mt-6 grid gap-3">{scheduleItems.length ? scheduleItems.map((schedule) => <div className="invite-card" key={`${schedule.title}-${schedule.startsAt.toISOString()}`}><strong>{schedule.title}</strong><p className="mt-1 text-sm opacity-75">{formatDate(schedule.startsAt)}{schedule.location ? ` · ${schedule.location}` : ""}</p></div>) : isPreview ? <div className="invite-card"><strong>Jadwal acara</strong><p className="mt-1 text-sm opacity-75">Tambahkan tanggal atau rangkaian acara untuk mengisi bagian ini.</p></div> : null}</div></div></section>;
    if (key === "location") return <section {...revealProps} className={panelClass("location", "section text-center")}><div className="content"><p className="eyebrow">Lokasi</p>{event.locationName ? <><h2 className="mt-3 font-serif text-3xl">{event.locationName}</h2><p className="mt-3 opacity-75">{event.locationAddress}</p>{event.locationAddress && <a target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-lg border border-current px-4 py-2 text-sm font-bold" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.locationName} ${event.locationAddress}`)}`}>Buka peta</a>}</> : isPreview ? <div className="invite-card mx-auto mt-6 max-w-lg"><p>Nama tempat dan alamat acara akan tampil di sini.</p></div> : null}</div></section>;
    if (key === "gallery") return <section {...revealProps} className={panelClass("gallery")}><div className="content"><p className="eyebrow text-center">Galeri</p><div className={`mt-6 grid grid-cols-2 gap-3${isSunda ? " sunda-gallery" : isJawa ? " jawa-gallery" : isNusantara ? " nusantara-gallery" : ""}`}><div className="aspect-square rounded-xl bg-[color:color-mix(in_srgb,var(--invite-accent),transparent_70%)]" /><div className="aspect-square rounded-xl bg-[color:color-mix(in_srgb,var(--invite-primary),transparent_76%)]" /><div className="col-span-2 aspect-[2/1] rounded-xl bg-[color:color-mix(in_srgb,var(--invite-surface),var(--invite-accent)_20%)]" /></div></div></section>;
    if (key === "rsvp") return <section {...revealProps} className={panelClass("rsvp")}><div className="content invite-card text-center"><p className="eyebrow">Konfirmasi kehadiran</p><h2 className="mt-2 font-serif text-3xl">Kami menantikan Anda</h2>{guest ? <RsvpForm eventSlug={event.slug} guestToken={guest.token} seats={guest.seats} /> : <p className="mt-4 text-sm opacity-75">Form RSVP akan tampil pada tautan undangan personal setiap tamu.</p>}</div></section>;
    if (key === "wishes") return <section {...revealProps} className={panelClass("wishes")}><div className="content"><div className="invite-card text-center"><p className="eyebrow">Ucapan & doa</p><h2 className="mt-2 font-serif text-3xl">Titipkan pesan baik</h2><WishForm eventSlug={event.slug} guestToken={guest?.token} /></div>{event.wishes && event.wishes.length > 0 && <div className="mt-5 grid gap-3">{event.wishes.map((wish) => <blockquote className="invite-card" key={wish.id}><p>“{wish.message}”</p><footer className="mt-2 text-sm opacity-65">— {wish.author}</footer></blockquote>)}</div>}</div></section>;
    if (key === "closing") return <section {...revealProps} className={panelClass("closing", "section text-center")}><div className="content">{ornament && <div className="ornament">{ornament}</div>}<p className="text-xl">Terima kasih atas doa dan kehadiran Anda.</p><p className="mt-6 text-sm opacity-65">Dibuat dengan Zenvora Invite</p></div></section>;
    return null;
  };

  return <div
    className={`invite ${themeStyles[theme.slug] ?? "minimal"}`}
    data-cultural-family={culturalTheme?.family}
    data-cultural-motion={culturalTheme?.motion}
    data-cultural-theme={culturalTheme?.slug}
    data-jawa-template={isJawa ? "true" : undefined}
    data-nusantara-template={isNusantara ? theme.slug : undefined}
    data-sunda-template={isSunda ? "true" : undefined}
    style={{ "--invite-background": tokens.background, "--invite-surface": tokens.surface, "--invite-primary": tokens.primary, "--invite-accent": tokens.accent, "--invite-text": tokens.text, "--invite-radius": manifest.tokens.radius.card } as React.CSSProperties}
  >
    {music && <InvitationMusicPlayer src={music.url} title={music.title} />}
    {isCultural && <InvitationScrollEffects />}
    <section {...revealProps} className={panelClass("cover", "cover section")}>{isSunda && <><span aria-hidden="true" className="sunda-cover-wayang-motion sunda-cover-wayang-motion-left"><span className="sunda-cover-wayang sunda-cover-wayang-left" /></span><span aria-hidden="true" className="sunda-cover-wayang-motion sunda-cover-wayang-motion-right"><span className="sunda-cover-wayang sunda-cover-wayang-right" /></span></>}{isJawa && <><span aria-hidden="true" className="jawa-cover-wayang-motion jawa-cover-wayang-left"><span className="jawa-cover-wayang jawa-cover-wayang-inward-left" /></span><span aria-hidden="true" className="jawa-cover-wayang-motion jawa-cover-wayang-right"><span className="jawa-cover-wayang jawa-cover-wayang-inward-right" /></span></>}{isNusantara && <><span aria-hidden="true" className="nusantara-cover-motif" /><span aria-hidden="true" className="nusantara-cover-architecture" /></>}<div className="content">{ornament && <div className="ornament" aria-hidden="true">{ornament}</div>}<p className="text-sm uppercase tracking-[.22em]">{culturalTheme?.coverLabel ?? `Undangan ${theme.style}`}</p><h1 className="mt-6 font-serif text-5xl leading-tight sm:text-6xl">{event.title}</h1>{guest && <p className="mt-6 text-lg">Kepada Yth. <strong>{guest.name}</strong></p>}<p className="mt-8 text-lg">{event.startsAt ? formatDate(event.startsAt) : "Tanggal akan diumumkan"}</p><a className="mt-8 inline-flex rounded-lg border border-current px-4 py-2 text-sm font-bold" href="#detail">Lihat detail acara</a></div></section>
    <div id="detail">{orderedSections.map((section) => <Fragment key={section.key}>{renderSection(section.key)}</Fragment>)}</div>
  </div>;
}
