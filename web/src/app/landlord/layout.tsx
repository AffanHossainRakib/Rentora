import { redirect } from "next/navigation";
import { readSession } from "@/features/auth/server";
import { ROLE_HOME } from "@/shared/config/navigation";
import { DashboardShell } from "../_components/dashboard-shell";

export default async function LandlordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await readSession();
  if (!user) redirect("/login");
  if (user.role !== "LANDLORD") redirect(ROLE_HOME[user.role]);

  return (
    <DashboardShell role="LANDLORD" user={user}>
      {children}
    </DashboardShell>
  );
}
