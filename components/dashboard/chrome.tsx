import Link from "next/link";
import { ChevronRight, LogOut, Sparkles } from "lucide-react";
import { signOut } from "@/lib/auth";
import { DashboardNavigation } from "@/components/dashboard/navigation";

function getInitials(name?: string | null) {
  if (!name) return "ZI";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function DashboardShell({
  children,
  name,
  email,
  isAdmin,
}: {
  children: React.ReactNode;
  name?: string | null;
  email?: string | null;
  isAdmin: boolean;
}) {
  return (
    <div className="dashboard-app">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-top">
          <Link className="dashboard-brand" href="/dashboard" aria-label="Zenvora Invite dashboard">
            <span className="dashboard-brand-mark"><Sparkles size={18} strokeWidth={1.8} /></span>
            <span>Zenvora <i>Invite</i></span>
          </Link>
          <div className="dashboard-workspace-label">
            <span>Workspace</span>
            <strong>Undangan Saya</strong>
          </div>
        </div>

        <DashboardNavigation isAdmin={isAdmin} />

        <div className="dashboard-sidebar-bottom">
          <Link className="dashboard-profile-card" href="/dashboard/profile">
            <span className="dashboard-avatar">{getInitials(name)}</span>
            <span className="min-w-0">
              <strong>{name ?? "Akun Anda"}</strong>
              <small>{email ?? "Kelola profil"}</small>
            </span>
            <ChevronRight aria-hidden="true" size={16} />
          </Link>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button className="dashboard-logout" type="submit">
              <LogOut aria-hidden="true" size={17} />
              Keluar dari akun
            </button>
          </form>
        </div>
      </aside>

      <main className="dashboard-main">{children}</main>
    </div>
  );
}

export function EventTabs({ eventId }: { eventId: string }) {
  const tabs = [["", "Ringkasan"], ["/content", "Konten"], ["/design", "Desain"], ["/guests", "Tamu"], ["/rsvp", "RSVP"], ["/wishes", "Ucapan"], ["/gifts", "Kado"], ["/checkin", "Check-in"], ["/analytics", "Analitik"]];
  return <nav className="dashboard-event-tabs">{tabs.map(([suffix, label]) => <Link href={`/dashboard/events/${eventId}${suffix}`} key={suffix}>{label}</Link>)}</nav>;
}
