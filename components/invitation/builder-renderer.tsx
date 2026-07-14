"use client";

import Link from "next/link";
import type { CSSProperties, DragEvent } from "react";
import { CalendarDays, ExternalLink, Gift, Heart, ImageIcon, MapPin, Music2, QrCode, Send, Sparkles } from "lucide-react";
import { Countdown } from "@/components/invitation/countdown";
import { RsvpForm, WishForm } from "@/components/invitation/guest-forms";
import type { BlockContent, BuilderBlock, BuilderPage, BuilderViewport, PositionConfig, ResponsiveConfig, StyleConfig } from "@/features/builder/types";

function formatBuilderDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(date);
}

export type BuilderRenderEvent = {
  title: string;
  slug: string;
  description?: string | null;
  startsAt?: Date | string | null;
  locationName?: string | null;
  locationAddress?: string | null;
  locationUrl?: string | null;
  people: { name: string; role: string; bio?: string | null; photoUrl?: string | null }[];
  schedules: { title: string; startsAt: Date | string; location?: string | null }[];
  wishes?: { id: string; author: string; message: string }[];
};

function objectValue<T extends object>(value: unknown, fallback: T): T {
  return value && typeof value === "object" && !Array.isArray(value) ? value as T : fallback;
}

function resolveBinding(binding: string | null | undefined, event: BuilderRenderEvent) {
  if (binding === "event.title") return event.title;
  if (binding === "event.description") return event.description || "Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir.";
  if (binding === "event.coupleNames") return event.people.slice(0, 2).map((person) => person.name).join(" & ") || event.title;
  if (binding === "event.primaryDate") return event.startsAt ? formatBuilderDate(new Date(event.startsAt)) : "Tanggal akan diumumkan";
  if (binding === "event.location") return event.locationName || "Lokasi acara";
  if (binding === "event.locationAddress") return event.locationAddress || "Alamat acara";
  return null;
}

function responsiveStyle(block: BuilderBlock, viewport?: BuilderViewport) {
  const responsive = objectValue<ResponsiveConfig>(block.responsiveConfig, {});
  return viewport ? objectValue<Record<string, unknown>>(responsive[viewport], {}) : {};
}

function blockStyle(block: BuilderBlock, viewport?: BuilderViewport): CSSProperties {
  const position = { ...objectValue<PositionConfig>(block.positionConfig, {}), ...responsiveStyle(block, viewport) };
  const style = { ...objectValue<StyleConfig>(block.styleConfig, {}), ...responsiveStyle(block, viewport) };
  return {
    color: style.color,
    backgroundColor: style.backgroundColor,
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight: style.fontWeight,
    fontFamily: style.fontFamily === "serif" ? "var(--builder-font-serif)" : style.fontFamily === "display" ? "var(--builder-font-display)" : undefined,
    textAlign: style.textAlign,
    borderRadius: style.borderRadius !== undefined ? `${style.borderRadius}px` : undefined,
    padding: style.padding !== undefined ? `${style.padding}px` : undefined,
    opacity: style.opacity,
    width: position.width ? `${position.width}%` : undefined,
    maxWidth: position.maxWidth ? `${position.maxWidth}px` : undefined,
    ...(position.x !== undefined || position.y !== undefined ? { position: "absolute", left: `${position.x ?? 50}%`, top: `${position.y ?? 50}%`, transform: "translate(-50%, -50%)", zIndex: 2 } : {}),
  };
}

function Placeholder({ icon: Icon, title, description }: { icon: typeof ImageIcon; title: string; description: string }) {
  return <div className="builder-render-placeholder"><Icon aria-hidden="true" size={24} /><strong>{title}</strong><span>{description}</span></div>;
}

function BuilderBlockContent({ block, event, guest, isEditor }: { block: BuilderBlock; event: BuilderRenderEvent; guest?: { token: string; name: string; seats: number }; isEditor?: boolean }) {
  const content = objectValue<BlockContent>(block.content, {});
  const text = resolveBinding(block.dataBinding, event) ?? content.text ?? content.label ?? "";
  if (block.blockType === "heading") return <h2>{text}</h2>;
  if (block.blockType === "text") return <p>{text}</p>;
  if (["image", "generated-image", "decorative-image"].includes(block.blockType)) return content.url ? <img className="builder-render-image" src={content.url} alt={content.alt || "Gambar undangan"} /> : <Placeholder icon={ImageIcon} title="Area gambar" description="Pilih media atau generate dengan AI" />;
  if (["button", "open-invitation-button", "social-link"].includes(block.blockType)) return <a className="builder-render-button" href={content.url || "#"}>{content.label || "Buka"}<ExternalLink aria-hidden="true" size={14} /></a>;
  if (block.blockType === "countdown") return event.startsAt ? <Countdown date={new Date(event.startsAt)} /> : <Placeholder icon={CalendarDays} title="Hitung mundur" description="Atur tanggal acara pada informasi inti" />;
  if (block.blockType === "person-profile") {
    const person = event.people[0];
    return person ? <article className="builder-person"><div className="builder-person-photo">{person.photoUrl ? <img src={person.photoUrl} alt={`Foto ${person.name}`} /> : person.name.slice(0, 1)}</div><h3>{person.name}</h3><p>{person.role}</p>{person.bio && <small>{person.bio}</small>}</article> : <Placeholder icon={Heart} title="Profil penyelenggara" description="Tambahkan profil di informasi inti" />;
  }
  if (block.blockType === "couple-profile") return <div className="builder-couple">{event.people.slice(0, 2).map((person) => <article className="builder-person" key={`${person.name}-${person.role}`}><div className="builder-person-photo">{person.photoUrl ? <img src={person.photoUrl} alt={`Foto ${person.name}`} /> : person.name.slice(0, 1)}</div><h3>{person.name}</h3><p>{person.role}</p></article>)}{event.people.length === 0 && <Placeholder icon={Heart} title="Profil mempelai" description="Tambahkan dua profil mempelai" />}</div>;
  if (block.blockType === "event-card") return <div className="builder-event-list">{(event.schedules.length ? event.schedules : event.startsAt ? [{ title: "Acara utama", startsAt: event.startsAt, location: event.locationName }] : []).map((schedule) => <article key={`${schedule.title}-${schedule.startsAt}`}><CalendarDays aria-hidden="true" size={18} /><div><strong>{schedule.title}</strong><span>{formatBuilderDate(new Date(schedule.startsAt))}{schedule.location ? ` · ${schedule.location}` : ""}</span></div></article>)}</div>;
  if (block.blockType === "maps-button") {
    const query = encodeURIComponent(`${event.locationName ?? ""} ${event.locationAddress ?? ""}`);
    return <a className="builder-render-button" href={event.locationUrl || `https://www.google.com/maps/search/?api=1&query=${query}`} target="_blank" rel="noreferrer"><MapPin aria-hidden="true" size={16} />{content.label || "Buka Peta"}</a>;
  }
  if (block.blockType === "calendar-button") return <button className="builder-render-button" type="button"><CalendarDays aria-hidden="true" size={16} />{content.label || "Simpan Tanggal"}</button>;
  if (block.blockType === "gallery") return <div className="builder-gallery"><span /><span /><span /></div>;
  if (block.blockType === "video") return content.url ? <video className="builder-video" controls src={content.url} /> : <Placeholder icon={ImageIcon} title="Video" description="Tambahkan URL video yang aman" />;
  if (block.blockType === "story-timeline") return <Placeholder icon={Sparkles} title="Linimasa cerita" description="Kisah perjalanan akan tampil di sini" />;
  if (block.blockType === "rsvp-form") return !isEditor && guest ? <RsvpForm eventSlug={event.slug} guestToken={guest.token} seats={guest.seats} /> : <Placeholder icon={Send} title="Form RSVP" description="Form aktif pada tautan tamu personal" />;
  if (block.blockType === "wishes-form") return !isEditor ? <WishForm eventSlug={event.slug} guestToken={guest?.token} /> : <Placeholder icon={Send} title="Form ucapan" description="Tamu dapat mengirim doa dan pesan" />;
  if (block.blockType === "wishes-list") return <div className="builder-wishes">{event.wishes?.length ? event.wishes.slice(0, 4).map((wish) => <blockquote key={wish.id}>“{wish.message}”<footer>{wish.author}</footer></blockquote>) : <Placeholder icon={Heart} title="Daftar ucapan" description="Ucapan yang disetujui akan tampil di sini" />}</div>;
  if (["gift-method", "bank-account"].includes(block.blockType)) return <Placeholder icon={Gift} title="Kado digital" description="Metode hadiah acara akan tampil di sini" />;
  if (block.blockType === "qr-code") return <Placeholder icon={QrCode} title="QR tamu" description="Kode unik tersedia pada tautan personal" />;
  if (block.blockType === "divider") return <hr className="builder-divider" />;
  if (block.blockType === "music-controller") return <Placeholder icon={Music2} title="Musik undangan" description="Kontrol lagu undangan" />;
  if (block.blockType === "spacer") return <div className="builder-spacer" />;
  if (block.blockType === "container") return <div className="builder-container-placeholder">Container</div>;
  return null;
}

export function BuilderPageCanvas({ page, event, guest, viewport, isEditor = false, selectedBlockId, onSelectBlock, onTextChange, onBlockDrop }: {
  page: BuilderPage;
  event: BuilderRenderEvent;
  guest?: { token: string; name: string; seats: number };
  viewport?: BuilderViewport;
  isEditor?: boolean;
  selectedBlockId?: string;
  onSelectBlock?: (id: string) => void;
  onTextChange?: (id: string, text: string) => void;
  onBlockDrop?: (id: string, x: number, y: number) => void;
}) {
  const background = objectValue<Record<string, unknown>>(page.backgroundConfig, {});
  const layout = objectValue<Record<string, unknown>>(page.layoutConfig, {});
  const pageStyle = {
    "--builder-page-color": String(background.color ?? "#f3eee5"),
    "--builder-overlay-color": String(background.overlayColor ?? "#131712"),
    "--builder-overlay-opacity": String(background.overlayOpacity ?? 0),
    "--builder-background-image": background.url ? `url("${String(background.url).replaceAll('"', "%22")}")` : "none",
    "--builder-background-size": String(background.size ?? "cover"),
    "--builder-background-x": `${Number(background.positionX ?? 50)}%`,
    "--builder-background-y": `${Number(background.positionY ?? 50)}%`,
    "--builder-page-gap": `${Number(layout.gap ?? 14)}px`,
    ...(page.heightMode === "custom" ? { minHeight: `${Number(layout.customHeight ?? 720)}px` } : {}),
  } as CSSProperties;
  const handleDragEnd = (event: DragEvent<HTMLDivElement>, blockId: string) => {
    if (!onBlockDrop) return;
    const rect = event.currentTarget.closest(".builder-page-blocks")?.getBoundingClientRect();
    if (!rect) return;
    onBlockDrop(blockId, Math.max(5, Math.min(95, (event.clientX - rect.left) / rect.width * 100)), Math.max(5, Math.min(95, (event.clientY - rect.top) / rect.height * 100)));
  };
  return <section className={`invitation-page builder-page builder-height-${page.heightMode}`} data-snap={page.heightMode === "viewport" || page.heightMode === "minimum-viewport" ? "true" : "false"} data-page-type={page.pageType} style={pageStyle}>
    <div className="builder-page-background" aria-hidden="true" />
    <div className="builder-page-overlay" aria-hidden="true" />
    {isEditor && <div className="builder-safe-area" aria-hidden="true"><span>safe area</span></div>}
    <div className="builder-page-blocks" data-layout={String(layout.preset ?? "center")}>
      {page.blocks.filter((block) => block.isVisible).sort((left, right) => left.order - right.order).map((block) => {
        const responsive = objectValue<ResponsiveConfig>(block.responsiveConfig, {});
        const hidden = viewport ? responsive.hiddenOn?.includes(viewport) : false;
        if (hidden) return null;
        const editable = block.blockType === "heading" || block.blockType === "text";
        return <div
          className={`builder-block builder-block-${block.blockType}${selectedBlockId === block.id ? " is-selected" : ""}`}
          data-animation={objectValue<Record<string, unknown>>(block.animationConfig, {}).preset ?? "none"}
          draggable={isEditor}
          key={block.id}
          onClick={(click) => { if (isEditor) { click.preventDefault(); click.stopPropagation(); onSelectBlock?.(block.id); } }}
          onDragEnd={(drag) => handleDragEnd(drag, block.id)}
          style={blockStyle(block, viewport)}
        >
          {isEditor && editable ? <div
            className="builder-inline-edit"
            contentEditable
            suppressContentEditableWarning
            onBlur={(blur) => onTextChange?.(block.id, blur.currentTarget.textContent ?? "")}
          >{resolveBinding(block.dataBinding, event) ?? objectValue<BlockContent>(block.content, {}).text ?? ""}</div> : <BuilderBlockContent block={block} event={event} guest={guest} isEditor={isEditor} />}
        </div>;
      })}
    </div>
  </section>;
}

export function BuilderInvitationRenderer({ pages, event, guest, isPreview = false }: { pages: BuilderPage[]; event: BuilderRenderEvent; guest?: { token: string; name: string; seats: number }; isPreview?: boolean }) {
  const visiblePages = pages.filter((page) => page.isVisible).sort((left, right) => left.order - right.order);
  return <div className="invitation-scroll-container builder-public-invitation" data-preview={isPreview ? "true" : undefined}>
    {visiblePages.map((page) => <BuilderPageCanvas event={event} guest={guest} key={page.id} page={page} />)}
    <footer className="builder-public-footer">Dibuat dengan <Link href="/">Zenvora Invite</Link></footer>
  </div>;
}
