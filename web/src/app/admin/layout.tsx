import { redirect } from "next/navigation";
import { readSession } from "@/features/auth/server";
import { ROLE_HOME } from "@/shared/config/navigation";
import { DashboardShell } from "../_components/dashboard-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await readSession();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect(ROLE_HOME[user.role]);

  return (
    <DashboardShell role="ADMIN" user={user}>
      {children}
    </DashboardShell>
  );
}
