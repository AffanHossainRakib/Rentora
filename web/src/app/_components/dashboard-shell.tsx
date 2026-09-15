import Link from "next/link";
import { ROLE_LABEL, ROLE_NAV, SITE } from "@/shared/config/navigation";
import { initials } from "@/shared/lib/format";
import type { SessionUser } from "@/features/auth/server";
import type { Role } from "@/shared/types";
import { SignOut } from "./sign-out";
import { ThemeToggle } from "./theme-toggle";
import { SidebarNav } from "./sidebar-nav";

export function DashboardShell({
  role,
  user,
  children,
}: {
  role: Role;
  user: SessionUser;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-ink bg-surface lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center border-b border-rule px-5">
          <Link
            href="/"
            className="text-lead font-semibold tracking-tight-lg text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            {SITE.name}
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden font-mono text-micro uppercase tracking-label text-ink-faint sm:inline">
              {ROLE_LABEL[role]}
            </span>
            <ThemeToggle className="size-8" />
          </div>
        </div>

        <SidebarNav items={ROLE_NAV[role]} />

        <div className="border-t border-rule p-4 lg:absolute lg:inset-x-0 lg:bottom-0 lg:border-t">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center border border-rule-strong font-mono text-micro text-ink-muted"
            >
              {initials(user.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-meta text-ink">{user.name}</p>
              <p className="truncate text-micro text-ink-faint">{user.email}</p>
            </div>
          </div>
          <SignOut />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <main id="main" tabIndex={-1} className="flex-1 px-gutter py-8 lg:py-10">
          <div className="mx-auto max-w-content">{children}</div>
        </main>
      </div>
    </div>
  );
}
