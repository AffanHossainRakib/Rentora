"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import type { Role } from "@/shared/types";

const OPTIONS: Array<{ value: Role | null; label: string }> = [
  { value: null, label: "All" },
  { value: "TENANT", label: "Tenant" },
  { value: "LANDLORD", label: "Landlord" },
  { value: "ADMIN", label: "Admin" },
];

export function RoleFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const raw = params.get("role");
  const current = OPTIONS.find((option) => option.value === raw)?.value ?? null;

  function select(value: Role | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("role", value);
    else next.delete("role");
    // A narrower set has fewer pages, so page 3 of "all" may not exist here.
    next.delete("page");

    startTransition(() => {
      router.push(`/admin/users${next.size ? `?${next}` : ""}`, {
        scroll: false,
      });
    });
  }

  return (
    <div role="group" aria-label="Filter by role" className="flex flex-wrap">
      {OPTIONS.map((option, i) => {
        const active = option.value === current;

        return (
          <button
            key={option.label}
            type="button"
            aria-current={active ? "true" : undefined}
            disabled={pending}
            onClick={() => select(option.value)}
            className={cn(
              "h-8 border px-4 text-micro font-medium uppercase tracking-label",
              "transition-colors duration-150 disabled:opacity-40",
              i > 0 && "-ml-px",
              active
                ? "relative border-ink bg-ink text-paper"
                : "border-rule-strong text-ink-muted hover:border-ink hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
