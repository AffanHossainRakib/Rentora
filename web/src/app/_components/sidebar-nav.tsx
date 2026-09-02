"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import type { NavItem } from "@/shared/config/navigation";

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Section" className="p-2">
      <ul className="flex flex-wrap gap-1 lg:flex-col lg:flex-nowrap">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/properties" && pathname.startsWith(`${item.href}/`));

          return (
            <li key={item.href} className="flex-1 lg:flex-none">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-baseline gap-2.5 px-3 py-2 text-meta transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus",
                  active
                    ? "bg-ink text-paper"
                    : "text-ink-muted hover:bg-ink/[0.05] hover:text-ink",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-micro tabular-nums",
                    active ? "text-paper/60" : "text-ink-faint",
                  )}
                >
                  {item.index}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
