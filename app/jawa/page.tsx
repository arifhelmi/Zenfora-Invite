"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

const weddingDate = new Date("2026-12-14T10:00:00+07:00").getTime();
const pad = (value: number) => String(Math.max(0, value)).padStart(2, "0");

function getTimeLeft() {
  const distance = Math.max(0, weddingDate - Date.now());
  return {
    days: pad(Math.floor(distance / 86_400_000)),
    hours: pad(Math.floor((distance / 3_600_000) % 24)),
    minutes: pad(Math.floor((distance / 60_000) % 60)),
    seconds: pad(Math.floor((distance / 1000) % 60)),
  };
}

function JawaPortrait({ name, role, initial, side }: { name: string; role: string; initial: string; side: "left" | "right" }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className={`jawa-portrait jawa-portrait--${side}`}>
      <button type="button" className="jawa-photo-frame" onClick={() => inputRef.current?.click()} aria-label={`Unggah foto ${role} ${name}`}>
        <span className="jawa-frame-crown" aria-hidden="true">ꦒꦸꦤꦸꦔꦤ꧀</span>
        {image ? <img src={image} alt={`Foto ${role} ${name}`} /> : <span className="jawa-photo-placeholder" aria-hidden="true">{initial}</span>}
        <span className="jawa-photo-action">{image ? "Ganti foto" : "Unggah foto"}</span>
      </button>
      <input ref={inputRef} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUpload} />
      <p>{role}</p>
      <h2>{name}</h2>
    </div>
  );
}

export default function JawaInvitation() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);
  const [rsvpSent, setRsvpSent] = useState(false);
  const [revealReady, setRevealReady] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setRevealReady(true);
    const items = [...document.querySelectorAll<HTMLElement>("[data-jawa-reveal]")];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <main className={`jawa ${revealReady ? "jawa-ready" : ""}`}>
      <section className="jawa-hero" id="beranda" data-jawa-reveal>
        <a className="jawa-variant-link" href="/">← Template Sunda</a>
        <div className="jawa-hero-batik" aria-hidden="true" />
        <div className="wayang wayang--left" aria-hidden="true" />
        <div className="wayang wayang--right" aria-hidden="true" />
        <div className="jawa-hero-content">
          <p className="jawa-script">ꦩꦁꦒꦪꦸꦧꦒꦾ</p>
          <p className="jawa-eyebrow">The wedding of</p>
          <h1>Sekar <span>&amp;</span> Bagas</h1>
          <p className="jawa-hero-copy">Dengan memohon rahmat Tuhan Yang Maha Esa, kami mengundang Anda untuk menjadi bagian dari kisah kami.</p>
          <a href="#acara" className="jawa-button">Saksikan hari bahagia <span>↓</span></a>
          <p className="jawa-date">Minggu · 14 Desember 2026 · Yogyakarta</p>
        </div>
      </section>

      <section className="jawa-photos" id="mempelai" data-jawa-reveal>
        <div className="jawa-section-title">
          <p>Ronce asmara</p>
          <h2>Dua nama, satu arah pulang.</h2>
          <span>✦</span>
        </div>
        <p className="jawa-caption">Ketuk bingkai untuk memilih foto mempelai. Bingkai gunungan akan langsung menampilkan pratinjaunya.</p>
        <div className="jawa-portrait-layout">
          <JawaPortrait name="Bagas" role="Putra" initial="B" side="left" />
          <div className="jawa-ampersand" aria-hidden="true">&amp;</div>
          <JawaPortrait name="Sekar" role="Putri" initial="S" side="right" />
        </div>
        <p className="jawa-parentage">Putra dari Bapak H. Satrio &amp; Ibu Hj. Wulan · Putri dari Bapak H. Wibowo &amp; Ibu Hj. Raras</p>
      </section>

      <section className="jawa-story" data-jawa-reveal>
        <div className="jawa-story-ornament" aria-hidden="true">❦</div>
        <p className="jawa-eyebrow">Kawiwitan</p>
        <h2>Semesta mempertemukan kami pada waktu yang paling indah.</h2>
        <p>Berawal dari percakapan sederhana, tumbuh menjadi perjalanan yang kami pilih untuk dirayakan bersama orang-orang tercinta.</p>
        <span className="jawa-story-mark">ꦱꦶꦤꦺꦴꦩ</span>
      </section>

      <section className="jawa-countdown" data-jawa-reveal>
        <div className="jawa-moon" aria-hidden="true" />
        <p className="jawa-eyebrow">Menghitung hari</p>
        <div className="jawa-numbers">
          {Object.entries(timeLeft).map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label === "days" ? "hari" : label === "hours" ? "jam" : label === "minutes" ? "menit" : "detik"}</span></div>)}
        </div>
        <p className="jawa-countdown-note">Sampai kami mengucap janji dalam satu pelaminan.</p>
      </section>

      <section className="jawa-event" id="acara" data-jawa-reveal>
        <div className="jawa-gate" aria-hidden="true"><i /><i /><i /></div>
        <p className="jawa-eyebrow">Pawiwahan</p>
        <h2>Rangkaian Acara</h2>
        <div className="jawa-date-lockup"><strong>14</strong><span>Desember<br /><em>2026</em></span></div>
        <div className="jawa-event-list">
          <article><span>01</span><div><h3>Akad Nikah</h3><p>08.00 WIB · Pendopo Agung Tamansari</p></div></article>
          <article><span>02</span><div><h3>Panggih &amp; Resepsi</h3><p>11.00–14.00 WIB · Pendopo Agung Tamansari</p></div></article>
        </div>
        <a className="jawa-map-link" href="https://maps.google.com/?q=Pendopo+Agung+Tamansari+Yogyakarta" target="_blank" rel="noreferrer">Lihat lokasi acara <span>↗</span></a>
      </section>

      <section className="jawa-quote" data-jawa-reveal>
        <p className="jawa-script">ꦩꦸꦒꦶꦫꦲꦪꦸ</p>
        <blockquote>“Sak bebrayan urip, katresnan dadi dalan kanggo gegayuh tentrem lan bagya.”</blockquote>
        <cite>Dalam kebersamaan, cinta menjadi jalan menuju damai dan bahagia.</cite>
      </section>

      <section className="jawa-rsvp" id="rsvp" data-jawa-reveal>
        <p className="jawa-eyebrow">Konfirmasi kehadiran</p>
        <h2>Doa tulus Anda akan melengkapi kebahagiaan kami.</h2>
        {rsvpSent ? <p className="jawa-success">Terima kasih. Konfirmasi Anda telah kami terima dengan penuh rasa bahagia.</p> : (
          <form onSubmit={(event) => { event.preventDefault(); setRsvpSent(true); }}>
            <label>Nama lengkap<input name="nama" required placeholder="Tulis nama Anda" /></label>
            <label>Kehadiran<select name="kehadiran" required defaultValue=""><option value="" disabled>Pilih konfirmasi</option><option>InsyaAllah hadir</option><option>Maaf, belum bisa hadir</option></select></label>
            <label>Ucapan<textarea name="ucapan" rows={3} placeholder="Sampaikan doa terbaik Anda" /></label>
            <button className="jawa-button" type="submit">Kirim konfirmasi <span>→</span></button>
          </form>
        )}
      </section>

      <footer className="jawa-footer"><p>Terima kasih atas doa dan restunya.</p><h2>Sekar &amp; Bagas</h2><span>ꦠꦸꦩꦸꦰ꧀</span></footer>
    </main>
  );
}
