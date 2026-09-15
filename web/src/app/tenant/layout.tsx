import { redirect } from "next/navigation";
import { readSession } from "@/features/auth/server";
import { ROLE_HOME } from "@/shared/config/navigation";
import { Panel } from "@/shared/ui";
import type { SessionUser } from "@/features/auth/server";
import { DashboardShell } from "@/app/_components/dashboard-shell";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: SessionUser | null;

  try {
    user = await readSession();
  } catch {
    // The session could not be resolved at all — the API is down, not the
    // visitor signed out. Redirecting here would loop against /login.
    return <SessionUnavailable />;
  }

  if (!user) redirect("/login");
  if (user.role !== "TENANT") redirect(ROLE_HOME[user.role]);

  return (
    <DashboardShell role="TENANT" user={user}>
      {children}
    </DashboardShell>
  );
}

function SessionUnavailable() {
  return (
    <main id="main" tabIndex={-1} className="px-gutter py-16">
      <Panel as="div" className="mx-auto max-w-prose-tight p-6">
        <p className="text-micro uppercase tracking-label text-critical">
          Session unavailable
        </p>
        <h1 className="mt-2 text-h4 text-ink">Your dashboard is offline</h1>
        <p className="mt-2 text-meta text-ink-muted">
          Rentora could not reach the API to confirm who you are. Reload in a
          moment — nothing has been lost.
        </p>
      </Panel>
    </main>
  );
}
