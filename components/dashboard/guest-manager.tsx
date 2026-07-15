"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Download, ExternalLink, FileSpreadsheet, MessageCircle, Upload } from "lucide-react";

export function GuestBulkTools({ eventId, currentCount, limit }: { eventId: string; currentCount: number; limit: number }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function importGuests(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/guests/import`, { method: "POST", body: formData });
        const result = await response.json() as { imported?: number; remaining?: number; error?: string };
        if (!response.ok) throw new Error(result.error ?? "File belum dapat diimpor.");
        setMessage(`${result.imported ?? 0} undangan berhasil dibuat. Sisa kapasitas: ${result.remaining ?? 0}.`);
        form.reset();
        router.refresh();
      } catch (importError) {
        setError(importError instanceof Error ? importError.message : "File belum dapat diimpor.");
      }
    });
  }

  return <section className="card overflow-hidden">
    <div className="border-b border-emerald-950/10 bg-emerald-950 p-5 text-white">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-amber-300">Impor massal</p>
      <h2 className="mt-2 text-xl font-bold">Buat hingga {Math.max(0, limit - currentCount)} link lagi</h2>
      <p className="mt-2 text-sm text-emerald-50/75">Satu baris Excel menghasilkan satu undangan personal, misalnya “Andi dan Keluarga”.</p>
    </div>
    <div className="grid gap-4 p-5">
      <div className="grid gap-2 sm:grid-cols-2">
        <a className="button secondary justify-center text-sm" href={`/api/events/${eventId}/guests/template`}><FileSpreadsheet size={16} /> Unduh template 200 baris</a>
        <a className="button secondary justify-center text-sm" href={`/api/events/${eventId}/guests/export`}><Download size={16} /> Ekspor link Excel</a>
      </div>
      <form className="grid gap-3" onSubmit={importGuests}>
        <label className="label">Pilih file Excel atau CSV
          <input className="input file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-950 file:px-3 file:py-2 file:text-sm file:font-bold file:text-white" type="file" name="file" accept=".xlsx,.csv" required />
        </label>
        <button className="button w-fit" disabled={pending || currentCount >= limit}><Upload size={16} />{pending ? "Membuat link…" : "Impor dan buat link"}</button>
      </form>
      {message && <p className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800" role="status">{message}</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}
    </div>
  </section>;
}

export function GuestLinkActions({ url, guestName, phone }: { url: string; guestName: string; phone?: string | null }) {
  const [copied, setCopied] = useState(false);
  const phoneDigits = phone?.replace(/\D/g, "");
  const whatsappNumber = phoneDigits?.startsWith("0") ? `62${phoneDigits.slice(1)}` : phoneDigits;
  const whatsappText = encodeURIComponent(`Kepada Yth. ${guestName}\n\nKami mengundang Anda untuk menghadiri acara kami. Silakan buka undangan personal berikut:\n${url}`);

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return <div className="flex min-w-52 flex-wrap items-center gap-2">
    <button className="guest-link-button" type="button" onClick={copyLink}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Tersalin" : "Salin"}</button>
    <a className="guest-link-button" href={url} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Buka</a>
    {whatsappNumber && <a className="guest-link-button whatsapp" href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`} target="_blank" rel="noreferrer"><MessageCircle size={14} /> WhatsApp</a>}
  </div>;
}
