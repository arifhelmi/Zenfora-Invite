"use client";

import { useActionState } from "react";
import { updateAIProviderAction, updatePackageAIQuotaAction } from "@/features/admin/actions";

const initial = {} as { error?: string; ok?: string };

export function AIProviderSettings({ provider }: { provider: { provider: string; displayName: string; creditCost: number; isEnabled: boolean } }) {
  const [state, action, pending] = useActionState(updateAIProviderAction, initial);
  return <form action={action} className="card grid gap-4 p-5"><div><p className="eyebrow">AI provider</p><h3 className="mt-1 text-lg font-bold">{provider.displayName}</h3><p className="mt-1 text-sm text-slate-600">API key tetap berada di environment dan tidak pernah ditampilkan atau disimpan dari form ini.</p></div><input type="hidden" name="provider" value={provider.provider} /><label className="label">Nama tampilan<input className="input" name="displayName" defaultValue={provider.displayName} /></label><label className="label">Biaya kredit per generate<input className="input" type="number" min="0" max="1000" name="creditCost" defaultValue={provider.creditCost} /></label><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="isEnabled" defaultChecked={provider.isEnabled} /> Provider aktif</label>{state.error && <p className="text-sm text-red-700">{state.error}</p>}{state.ok && <p className="text-sm text-emerald-700">{state.ok}</p>}<button className="button w-fit" disabled={pending}>{pending ? "Menyimpan…" : "Simpan konfigurasi AI"}</button></form>;
}

export function PackageAIQuotaForm({ packageId, aiMonthlyCredits, pageVersionLimit }: { packageId: string; aiMonthlyCredits: number; pageVersionLimit: number }) {
  const bound = updatePackageAIQuotaAction.bind(null, packageId);
  const [state, action, pending] = useActionState(bound, initial);
  return <form action={action} className="mt-4 grid gap-3 border-t pt-4"><label className="label text-sm">Kredit AI / bulan<input className="input" type="number" min="0" name="aiMonthlyCredits" defaultValue={aiMonthlyCredits} /></label><label className="label text-sm">Maksimum version history<input className="input" type="number" min="1" name="pageVersionLimit" defaultValue={pageVersionLimit} /></label>{state.error && <p className="text-xs text-red-700">{state.error}</p>}{state.ok && <p className="text-xs text-emerald-700">{state.ok}</p>}<button className="button secondary text-sm" disabled={pending}>{pending ? "Menyimpan…" : "Simpan kuota builder"}</button></form>;
}
