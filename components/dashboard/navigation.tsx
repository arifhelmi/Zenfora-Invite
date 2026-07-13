"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MailOpen,
  ReceiptText,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const navigationItems = [
  { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/dashboard/events", label: "Undangan", icon: MailOpen },
  { href: "/dashboard/orders", label: "Pesanan", icon: ReceiptText },
  { href: "/dashboard/profile", label: "Profil", icon: UserRound },
];

export function DashboardNavigation({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const items = isAdmin
    ? [...navigationItems, { href: "/admin", label: "Admin panel", icon: ShieldCheck }]
    : navigationItems;

  return (
    <nav className="dashboard-navigation" aria-label="Navigasi dashboard">
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = href === "/dashboard"
          ? pathname === href
          : pathname.startsWith(href);

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className="dashboard-navigation-link"
            href={href}
            key={href}
          >
            <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
