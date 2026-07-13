import { DashboardShell } from "@/components/dashboard/chrome";
import { requireUser } from "@/lib/permissions";
export default async function DashboardLayout({ children }: { children: React.ReactNode }) { const user = await requireUser(); return <DashboardShell name={user.name} isAdmin={["ADMIN", "SUPER_ADMIN"].includes(user.role)}>{children}</DashboardShell>; }
