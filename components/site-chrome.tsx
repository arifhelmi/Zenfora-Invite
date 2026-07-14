import Link from "next/link";

// This header is intentionally static. Calling auth() here made every public
// navigation (including /login and /register) dynamic and added an auth lookup.
// The dashboard layout remains responsible for protecting authenticated pages.
export function SiteHeader() {
  return <header className="border-b border-slate-200 bg-white/90 backdrop-blur"><nav className="shell flex min-h-16 items-center justify-between gap-4"><Link href="/" prefetch={false} className="font-bold tracking-tight text-slate-900">Zenvora <span className="text-indigo-700">Invite</span></Link><div className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex"><Link href="/templates" prefetch={false}>Template</Link><Link href="/pricing" prefetch={false}>Harga</Link><Link href="/features" prefetch={false}>Fitur</Link><Link href="/about" prefetch={false}>Tentang</Link></div><div className="flex items-center gap-2"><Link className="button secondary" href="/login" prefetch={false}>Masuk</Link><Link className="button" href="/register" prefetch={false}>Mulai gratis</Link></div></nav></header>;
}
export function SiteFooter() { return <footer className="border-t border-slate-200 bg-white py-10"><div className="shell grid gap-6 text-sm text-slate-600 sm:grid-cols-2"><div><p className="font-bold text-slate-900">Zenvora Invite</p><p className="mt-2 max-w-sm">Membuat momen penting terasa dekat—untuk Anda dan setiap tamu yang diundang.</p></div><div className="flex flex-wrap gap-x-5 gap-y-2 sm:justify-end"><Link href="/contact">Kontak</Link><Link href="/terms">Ketentuan</Link><Link href="/privacy">Privasi</Link><Link href="/refund">Refund</Link></div></div></footer>; }
