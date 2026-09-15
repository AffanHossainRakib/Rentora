import Link from "next/link";
import { SiteFooter } from "./_components/site-footer";
import { SiteHeader } from "./_components/site-header";
import { ButtonLink } from "@/shared/ui";

const SUGGESTIONS = [
  { href: "/properties", label: "Browse every listing" },
  { href: "/#how", label: "How a tenancy works" },
  { href: "/login", label: "Sign in to your workspace" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main
        id="main"
        tabIndex={-1}
        className="flex flex-1 items-center py-24"
      >
        <div className="mx-auto w-full max-w-shell px-gutter">
          <p className="font-mono text-micro uppercase tracking-label text-signal">
            Error 404
          </p>

          <h1 className="mt-6 max-w-[16ch] text-h1 sm:text-display">
            Nothing at this address.
          </h1>

          <p className="mt-7 max-w-prose text-lead text-ink-muted">
            The page you asked for does not exist, or the listing behind it has
            been withdrawn by its landlord.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/properties" size="lg">
              Browse listings
            </ButtonLink>
            <ButtonLink href="/" size="lg" variant="outline">
              Back to home
            </ButtonLink>
          </div>

          <ul className="mt-16 flex flex-wrap gap-x-10 gap-y-3 border-t border-rule pt-8">
            {SUGGESTIONS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-meta text-ink-muted underline decoration-rule-strong underline-offset-4 transition-colors hover:text-ink hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
