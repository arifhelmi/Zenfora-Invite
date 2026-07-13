import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/permissions";
export default async function AdminLayout({ children }: { children: React.ReactNode }) { await requireRole("ADMIN", "SUPER_ADMIN"); return <AdminShell>{children}</AdminShell>; }
