"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button, Select, TextInput } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";

const FIELDS = [
  "searchTerm",
  "location",
  "category",
  "isAvailable",
  "priceMin",
  "priceMax",
] as const;

export function PropertyFilters({ categories }: { categories: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const current = (key: string) => params.get(key) ?? "";
  const activeCount = FIELDS.filter((f) => params.get(f)).length;

  function apply(formData: FormData) {
    const next = new URLSearchParams();
    for (const field of FIELDS) {
      const value = String(formData.get(field) ?? "").trim();
      if (value) next.set(field, value);
    }
    startTransition(() => {
      router.push(`/properties${next.size ? `?${next}` : ""}`, {
        scroll: false,
      });
    });
  }

  return (
    <form
      action={apply}
      aria-label="Filter listings"
      className="border border-rule bg-surface"
    >
      <div className="grid grid-cols-1 divide-y divide-rule sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-[1.6fr_1fr_1fr_0.8fr_0.8fr]">
        <FilterCell label="Search" className="sm:border-r sm:border-rule">
          <TextInput
            name="searchTerm"
            defaultValue={current("searchTerm")}
            placeholder="Title or description"
            className="h-10 border-0 bg-transparent px-0 focus:outline-hidden"
          />
        </FilterCell>

        <FilterCell label="Location" className="lg:border-r lg:border-rule">
          <TextInput
            name="location"
            defaultValue={current("location")}
            placeholder="Any area"
            className="h-10 border-0 bg-transparent px-0 focus:outline-hidden"
          />
        </FilterCell>

        <FilterCell
          label="Category"
          className="sm:border-r sm:border-rule sm:border-t lg:border-t-0"
        >
          <Select
            name="category"
            defaultValue={current("category")}
            className="h-10 border-0 bg-transparent px-0 pr-7 focus:outline-hidden"
          >
            <option value="">Any type</option>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </FilterCell>

        <FilterCell
          label="Min ৳"
          className="border-t border-rule sm:border-r lg:border-t-0"
        >
          <TextInput
            name="priceMin"
            type="number"
            min={0}
            inputMode="numeric"
            defaultValue={current("priceMin")}
            placeholder="0"
            className="h-10 border-0 bg-transparent px-0 tabular-nums focus:outline-hidden"
          />
        </FilterCell>

        <FilterCell label="Max ৳" className="border-t border-rule lg:border-t-0">
          <TextInput
            name="priceMax"
            type="number"
            min={0}
            inputMode="numeric"
            defaultValue={current("priceMax")}
            placeholder="Any"
            className="h-10 border-0 bg-transparent px-0 tabular-nums focus:outline-hidden"
          />
        </FilterCell>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule px-4 py-3">
        <label className="flex cursor-pointer items-center gap-2 text-micro uppercase tracking-label text-ink-muted">
          <input
            type="checkbox"
            name="isAvailable"
            value="true"
            defaultChecked={current("isAvailable") === "true"}
            className="size-4 accent-signal"
          />
          Available only
        </label>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => startTransition(() => router.push("/properties"))}
            >
              Clear {activeCount}
            </Button>
          )}
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Filtering…" : "Apply"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function FilterCell({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 px-4 py-3",
        "focus-within:outline-2 focus-within:outline-offset-[-2px] focus-within:outline-focus",
        className,
      )}
    >
      <span className="text-micro uppercase tracking-label text-ink-faint">
        {label}
      </span>
      {children}
    </div>
  );
}
