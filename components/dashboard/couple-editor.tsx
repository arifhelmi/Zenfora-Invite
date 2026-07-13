"use client";

import { useState } from "react";
import { saveCouplePeopleAction } from "@/features/events/actions";

type Person = { id?: string; name: string; role: string; photoUrl?: string | null };

const blankPerson = (): Person => ({ name: "", role: "Mempelai", photoUrl: null });

export function CoupleEditor({ eventId, people }: { eventId: string; people: Person[] }) {
  const [items, setItems] = useState<Person[]>(() => [...people.slice(0, 2), ...Array.from({ length: Math.max(0, 2 - people.length) }, blankPerson)]);
  const [uploading, setUploading] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const update = (index: number, patch: Partial<Person>) => setItems((current) => current.map((person, itemIndex) => itemIndex === index ? { ...person, ...patch } : person));
  const upload = async (index: number, file?: File) => {
    if (!file) return;
    setUploading(index); setMessage("");
    const formData = new FormData();
    formData.set("eventId", eventId); formData.set("file", file); formData.set("alt", items[index].name || `Foto mempelai ${index + 1}`);
    try {
      const response = await fetch("/api/media", { method: "POST", body: formData });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "Upload foto gagal.");
      update(index, { photoUrl: result.url });
      setMessage("Foto siap dipakai. Simpan profil untuk menampilkannya di undangan.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Upload foto gagal."); }
    finally { setUploading(null); }
  };
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setMessage("");
    try { await saveCouplePeopleAction(eventId, items); setMessage("Profil dan foto mempelai tersimpan."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Profil belum tersimpan."); }
    finally { setSaving(false); }
  };

  return <form className="couple-editor" onSubmit={save}>
    <p className="text-sm leading-6 text-slate-600">Unggah foto Anda berdua. Foto akan tampil di section “Penyelenggara” dengan bingkai khas tema.</p>
    <div className="mt-5 grid gap-6 sm:grid-cols-2">{items.map((person, index) => <section className="couple-editor-person" key={person.id ?? index}>
      <div className="couple-editor-photo">{person.photoUrl ? <img src={person.photoUrl} alt={`Foto ${person.name || `mempelai ${index + 1}`}`} /> : <span aria-hidden="true">{person.name.trim().slice(0, 1).toUpperCase() || index + 1}</span>}</div>
      <div className="mt-4 grid gap-3"><label className="label">Nama mempelai {index + 1}<input className="input" required maxLength={100} value={person.name} onChange={(event) => update(index, { name: event.target.value })} placeholder={index === 0 ? "Contoh: Arif Pratama" : "Contoh: Siti Ananda"} /></label><label className="label">Peran<input className="input" required maxLength={80} value={person.role} onChange={(event) => update(index, { role: event.target.value })} /></label></div>
      <div className="mt-4 flex flex-wrap items-center gap-2"><label className="button secondary cursor-pointer text-sm">{uploading === index ? "Mengunggah…" : "Pilih foto"}<input className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading !== null || saving} onChange={(event) => upload(index, event.target.files?.[0])} /></label>{person.photoUrl && <button className="text-sm font-semibold text-rose-700" type="button" disabled={saving} onClick={() => update(index, { photoUrl: null })}>Hapus foto</button>}</div>
    </section>)}</div>
    <div className="mt-6 flex flex-wrap items-center gap-3"><button className="button" disabled={saving || uploading !== null}>{saving ? "Menyimpan…" : "Simpan profil mempelai"}</button>{message && <p role="status" className={`text-sm ${message.includes("gagal") || message.includes("belum") ? "text-red-700" : "text-emerald-700"}`}>{message}</p>}</div>
  </form>;
}
