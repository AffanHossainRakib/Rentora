import Link from "next/link";
import { PUBLIC_NAV, SITE } from "@/shared/config/navigation";
import { ButtonLink } from "@/shared/ui";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-shell items-center justify-between gap-6 px-gutter">
        <Link
          href="/"
          className="shrink-0 text-lead font-semibold tracking-tight-lg text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
        >
          {SITE.name}
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {PUBLIC_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-meta text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle className="size-8" />
          <ButtonLink href="/login" variant="ghost" size="sm">
            Sign in
          </ButtonLink>
          <ButtonLink href="/register" size="sm" className="hidden sm:inline-flex">
            Register
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
