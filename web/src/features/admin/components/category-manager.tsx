"use client";

import { useActionState } from "react";
import { Button, Field, TextInput } from "@/shared/ui";
import { createCategoryAction } from "@/features/properties";

export function CategoryManager({ categories }: { categories: string[] }) {
  const [state, formAction, pending] = useActionState(
    createCategoryAction,
    null,
  );

  const created = state && state.ok ? state.data : null;
  const error =
    state && !state.ok ? (state.fieldErrors.name ?? state.message) : undefined;

  return (
    <div className="grid border border-rule bg-surface lg:grid-cols-[1fr_22rem]">
      <section className="border-b border-rule p-5 lg:border-b-0 lg:border-r">
        <h2 className="text-micro font-medium uppercase tracking-label text-ink-muted">
          In use
        </h2>

        {categories.length === 0 ? (
          <p className="mt-4 max-w-prose text-meta text-ink-muted">
            No categories exist yet. A property cannot be listed until at least
            one is created.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 border-l border-t border-rule sm:grid-cols-3">
            {categories.map((category, i) => (
              <li
                key={category}
                className="flex items-baseline gap-2.5 border-b border-r border-rule px-3 py-2.5"
              >
                <span className="font-mono text-micro tabular-nums text-ink-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="truncate text-meta text-ink">{category}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 max-w-prose text-micro text-ink-faint">
          The API exposes no rename or delete route for categories. A name added
          here stays for good, so spell it the way it should read on a listing.
        </p>
      </section>

      <form action={formAction} className="flex flex-col gap-4 p-5">
        <h2 className="text-micro font-medium uppercase tracking-label text-ink-muted">
          Add one
        </h2>

        <Field
          label="Category name"
          hint="Stored in Title Case — “semi detached” is saved as “Semi Detached”."
          error={error}
          required
        >
          {(props) => (
            <TextInput
              {...props}
              name="name"
              required
              maxLength={60}
              autoComplete="off"
              placeholder="Apartment"
            />
          )}
        </Field>

        <Button type="submit" size="sm" disabled={pending} className="self-start">
          {pending ? "Adding…" : "Add category"}
        </Button>

        <p role="status" className="text-micro text-positive">
          {created ? `“${created.name}” is now available to landlords.` : null}
        </p>
      </form>
    </div>
  );
}
