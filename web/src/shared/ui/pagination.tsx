import Link from "next/link";
import { paginationRange } from "@/shared/lib/pagination";
import { cn } from "@/shared/lib/cn";

export function Pagination({
  page,
  totalPage,
  total,
  hrefFor,
}: {
  page: number;
  totalPage: number;
  total: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPage <= 1) return null;
  const tokens = paginationRange(page, totalPage);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4 border-t border-rule pt-4"
    >
      <p className="text-micro uppercase tracking-label text-ink-faint">
        Page <span className="tabular-nums text-ink">{page}</span> of{" "}
        <span className="tabular-nums text-ink">{totalPage}</span>
        <span className="mx-2 text-rule-strong">/</span>
        <span className="tabular-nums text-ink">{total}</span> results
      </p>

      <ul className="flex items-center gap-1">
        {tokens.map((token, i) =>
          token === "gap" ? (
            <li
              key={`gap-${i}`}
              aria-hidden
              className="px-1 font-mono text-micro text-ink-faint"
            >
              …
            </li>
          ) : (
            <li key={token}>
              <Link
                href={hrefFor(token)}
                aria-current={token === page ? "page" : undefined}
                className={cn(
                  "flex h-8 min-w-8 items-center justify-center border px-2 font-mono text-micro tabular-nums transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                  token === page
                    ? "border-ink bg-ink text-paper"
                    : "border-rule-strong text-ink-muted hover:border-ink hover:text-ink",
                )}
              >
                {String(token).padStart(2, "0")}
              </Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
