import type { Metadata } from "next";
import { CategoryManager } from "@/features/admin";
import { listCategories } from "@/features/properties/server";
import { Panel, SectionHeading } from "@/shared/ui";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  let categories: string[] = [];
  let error: string | null = null;

  try {
    categories = await listCategories();
  } catch (cause) {
    error = cause instanceof Error ? cause.message : "The API did not respond.";
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        index="05"
        title="Categories"
        description="A property carries its category as a plain name, not an id — so a listing can only be filed under a name that already appears on this list."
        action={
          error ? null : (
            <p className="text-micro uppercase tracking-label text-ink-faint">
              <span className="font-mono tabular-nums text-ink">
                {String(categories.length).padStart(2, "0")}
              </span>{" "}
              in use
            </p>
          )
        }
      />

      {error ? (
        <Panel className="px-5 py-6">
          <p className="text-micro uppercase tracking-label text-critical">
            Data unavailable
          </p>
          <p className="mt-2 max-w-prose text-meta text-ink-muted">{error}</p>
        </Panel>
      ) : (
        <CategoryManager categories={categories} />
      )}
    </div>
  );
}
