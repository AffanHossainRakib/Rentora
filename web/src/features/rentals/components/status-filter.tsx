"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import { RENTAL_STATUSES } from "@/shared/lib/status";
import type { RentalStatus } from "@/shared/types";

export function StatusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const active = params.get("status");

  function apply(status?: RentalStatus) {
    const next = new URLSearchParams(params.toString());
    if (status) next.set("status", status);
    else next.delete("status");
    // A new filter invalidates the current offset.
    next.delete("page");

    startTransition(() => {
      router.push(`${pathname}${next.size ? `?${next}` : ""}`, {
        scroll: false,
      });
    });
  }

  return (
    <div
      role="group"
      aria-label="Filter by status"
      aria-busy={pending || undefined}
      className="flex flex-wrap items-center gap-1"
    >
      <Chip selected={!active} onSelect={() => apply()}>
        All
      </Chip>
      {RENTAL_STATUSES.map((status) => (
        <Chip
          key={status}
          selected={active === status}
          onSelect={() => apply(status)}
        >
          {status}
        </Chip>
      ))}
    </div>
  );
}

function Chip({
  selected,
  onSelect,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "inline-flex h-8 items-center border px-3 text-micro font-medium uppercase tracking-label",
        "transition-colors duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        selected
          ? "border-ink bg-ink text-paper"
          : "border-rule-strong text-ink-muted hover:border-ink hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
