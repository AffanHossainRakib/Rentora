import Link from "next/link";
import { SITE } from "@/shared/config/navigation";

const COLUMNS = [
  {
    heading: "Browse",
    links: [
      { href: "/properties", label: "All listings" },
      { href: "/#how", label: "How it works" },
      { href: "/#coverage", label: "Coverage" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Register" },
    ],
  },
  {
    heading: "Workspaces",
    links: [
      { href: "/tenant", label: "Tenant" },
      { href: "/landlord", label: "Landlord" },
      { href: "/admin", label: "Admin" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-ink bg-surface">
      <div className="mx-auto max-w-shell px-gutter">
        <div className="flex flex-col justify-between gap-12 py-14 lg:flex-row lg:gap-20">
          <div className="max-w-prose-tight">
            <p className="text-lead font-semibold tracking-tight-lg text-ink">
              {SITE.name}
            </p>
            <p className="mt-2 text-meta text-ink-muted">{SITE.tagline}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-10 sm:grid-cols-3 sm:gap-x-16 lg:gap-x-20">
            {COLUMNS.map((column) => (
              <nav key={column.heading} aria-label={column.heading}>
                <p className="text-micro uppercase tracking-label text-ink-faint">
                  {column.heading}
                </p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-meta text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule py-6">
          <p className="text-micro text-ink-faint">
            © {new Date().getFullYear()} {SITE.name}
          </p>
          <p className="text-micro text-ink-faint">
            Dhaka · Chattogram · Sylhet
          </p>
        </div>
      </div>
    </footer>
  );
}
