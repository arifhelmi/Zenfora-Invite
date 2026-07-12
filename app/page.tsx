"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

const weddingDate = new Date("2026-12-14T14:14:00+07:00").getTime();

type TimeLeft = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

const pad = (value: number) => String(Math.max(0, value)).padStart(2, "0");

function getTimeLeft(): TimeLeft {
  const distance = Math.max(0, weddingDate - Date.now());
  return {
    days: pad(Math.floor(distance / (1000 * 60 * 60 * 24))),
    hours: pad(Math.floor((distance / (1000 * 60 * 60)) % 24)),
    minutes: pad(Math.floor((distance / (1000 * 60)) % 60)),
    seconds: pad(Math.floor((distance / 1000) % 60)),
  };
}

function UploadPortrait({
  name,
  role,
  initial,
  frame,
}: {
  name: string;
  role: string;
  initial: string;
  frame: "left" | "right";
}) {
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
    <div className={`portrait-column portrait-column--${frame}`}>
      <button
        className={`portrait-frame portrait-frame--${frame}`}
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={`Unggah foto ${role} ${name}`}
      >
        <span className="frame-spark frame-spark--one" aria-hidden="true">✦</span>
        <span className="frame-spark frame-spark--two" aria-hidden="true">✿</span>
        <span className="frame-spark frame-spark--three" aria-hidden="true">✦</span>
        {image ? (
          <img src={image} alt={`Foto ${role} ${name}`} className="portrait-image" />
        ) : (
          <span className="portrait-placeholder" aria-hidden="true">
            <span>{initial}</span>
          </span>
        )}
        <span className="portrait-upload">{image ? "Ganti foto" : "Unggah foto"}</span>
      </button>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleUpload}
      />
      <p className="portrait-role">{role}</p>
      <h2>{name}</h2>
    </div>
  );
}

export default function Home() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft());
  const [rsvpSent, setRsvpSent] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main>
      <section className="hero" id="beranda">
        <div className="topline" aria-hidden="true" />
        <p className="eyebrow">Dengan penuh rasa syukur</p>
        <p className="kawung-mark" aria-label="Ornamen Sunda">✦ &nbsp; ᮅ ᮇ ᮞ &nbsp; ✦</p>
        <h1>Radem <span>&amp;</span> Laras</h1>
        <p className="hero-copy">Kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberi doa restu pada hari bahagia kami.</p>
        <a href="#acara" className="primary-link">Lihat detail acara <span>↓</span></a>
        <p className="hero-date">Ahad, 14 Desember 2026 &nbsp;·&nbsp; Bandung</p>
        <div className="hero-leaves hero-leaves--left" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="hero-leaves hero-leaves--right" aria-hidden="true"><i /><i /><i /><i /></div>
      </section>

      <section className="couple-section" id="mempelai">
        <p className="section-kicker">Dua insan, satu tujuan</p>
        <p className="section-intro">Ketuk salah satu bingkai untuk mengunggah foto mempelai. Foto tampil sebagai pratinjau langsung di undangan.</p>
        <div className="portrait-layout">
          <UploadPortrait name="Radem" role="Putra" initial="R" frame="left" />
          <div className="ampersand" aria-hidden="true">&amp;</div>
          <UploadPortrait name="Laras" role="Putri" initial="L" frame="right" />
        </div>
        <p className="parent-note">Putra dari Bapak H. Ahmad &amp; Ibu Hj. Ratna &nbsp; · &nbsp; Putri dari Bapak H. Budi &amp; Ibu Hj. Sari</p>
      </section>

      <section className="countdown-section" aria-label="Hitung mundur acara">
        <p className="section-kicker">Menuju hari bahagia</p>
        <div className="countdown">
          {Object.entries(timeLeft).map(([label, value]) => (
            <div key={label} className="countdown-unit">
              <strong>{value}</strong>
              <span>{label === "days" ? "hari" : label === "hours" ? "jam" : label === "minutes" ? "menit" : "detik"}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="event-section" id="acara">
        <p className="section-kicker">Rangkaian acara</p>
        <div className="event-headline">
          <span>14</span>
          <div><p>Desember</p><small>2026</small></div>
        </div>
        <div className="event-list">
          <article className="event-item">
            <p className="event-number">01</p>
            <div><h2>Akad Nikah</h2><p>08.00 WIB · Masjid Raya Bandung</p></div>
          </article>
          <article className="event-item">
            <p className="event-number">02</p>
            <div><h2>Resepsi</h2><p>11.00–14.00 WIB · Pendopo Saung Angklung Udjo</p></div>
          </article>
        </div>
        <a className="text-link" href="https://maps.google.com/?q=Saung+Angklung+Udjo" target="_blank" rel="noreferrer">Buka petunjuk lokasi <span>↗</span></a>
      </section>

      <section className="quote-section">
        <span className="quote-star" aria-hidden="true">✦</span>
        <blockquote>“Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri.”</blockquote>
        <cite>QS. Ar-Rum: 21</cite>
      </section>

      <section className="rsvp-section" id="rsvp">
        <p className="section-kicker">Konfirmasi kehadiran</p>
        <h2>Doa dan kehadiran Anda sangat berarti bagi kami.</h2>
        {rsvpSent ? (
          <p className="rsvp-success">Terima kasih, konfirmasi Anda telah kami terima. Sampai jumpa di hari bahagia kami.</p>
        ) : (
          <form onSubmit={(event) => { event.preventDefault(); setRsvpSent(true); }}>
            <label>Nama lengkap<input required name="nama" placeholder="Tulis nama Anda" /></label>
            <label>Kehadiran<select required name="kehadiran" defaultValue=""><option value="" disabled>Pilih konfirmasi</option><option>InsyaAllah hadir</option><option>Maaf, belum bisa hadir</option></select></label>
            <label>Ucapan <textarea name="ucapan" rows={3} placeholder="Tulis doa dan ucapan terbaik" /></label>
            <button type="submit" className="primary-link">Kirim konfirmasi <span>→</span></button>
          </form>
        )}
      </section>

      <footer>
        <p>Terima kasih atas doa dan perhatian Anda.</p>
        <h2>Radem &amp; Laras</h2>
        <p className="footer-mark">ᮃ ᮚ ᮥ ᮔ ᮪ ᮓ ᮥ ᮀ ᮔ ᮪</p>
      </footer>
    </main>
  );
}
