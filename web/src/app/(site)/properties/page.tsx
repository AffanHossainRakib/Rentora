import type { Metadata } from "next";
import { PropertyCard, PropertyFilters } from "@/features/properties";
import { listCategories, listProperties } from "@/features/properties/server";
import {
  ButtonLink,
  EmptyState,
  Pagination,
  SectionHeading,
} from "@/shared/ui";
import type {
  ApiMeta,
  Category,
  Property,
  PropertyQuery,
} from "@/shared/types";

const PAGE_SIZE = 12;

const FILTER_KEYS = [
  "searchTerm",
  "location",
  "category",
  "isAvailable",
  "priceMin",
  "priceMax",
] as const;

const FILTER_LABEL: Record<(typeof FILTER_KEYS)[number], string> = {
  searchTerm: "Search",
  location: "Location",
  category: "Category",
  isAvailable: "Availability",
  priceMin: "Min rent",
  priceMax: "Max rent",
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

function nonNegative(value: string | string[] | undefined): number | undefined {
  const raw = first(value);
  if (raw === undefined) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export const metadata: Metadata = {
  title: "Listings",
  description:
    "Browse rental listings across Bangladesh. Filter by area, category and monthly rent, then request the dates you want.",
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<RawParams>;
}) {
  const params = await searchParams;

  const page = Math.max(1, Math.trunc(nonNegative(params.page) ?? 1));
  const query: PropertyQuery = {
    searchTerm: first(params.searchTerm),
    location: first(params.location),
    category: first(params.category),
    isAvailable: first(params.isAvailable) === "true" ? true : undefined,
    priceMin: nonNegative(params.priceMin),
    priceMax: nonNegative(params.priceMax),
    page,
    limit: PAGE_SIZE,
  };

  // Categories only feed the filter dropdown, so an outage there must not
  // take the listings down with it.
  const [listing, categories] = await Promise.all([
    listProperties(query).then(
      (value) => ({ ok: true as const, value }),
      (error: unknown) => ({ ok: false as const, error }),
    ),
    listCategories().catch((): string[] => []),
  ]);

  const activeFilters = FILTER_KEYS.flatMap((key) => {
    const value = first(params[key]);
    if (!value) return [];
    if (key === "isAvailable") return ["Available only"];
    return [`${FILTER_LABEL[key]}: ${value}`];
  });

  function hrefFor(target: number): string {
    const search = new URLSearchParams();
    for (const key of FILTER_KEYS) {
      const value = first(params[key]);
      if (value) search.set(key, value);
    }
    if (target > 1) search.set("page", String(target));
    const serialised = search.toString();
    return serialised ? `/properties?${serialised}` : "/properties";
  }

  return (
    <div className="mx-auto max-w-shell px-gutter py-12 lg:py-16">
      <SectionHeading
        index="01 — Browse"
        title="Rental listings"
        description="Everything below is a live listing. Filters narrow by title, area, category and monthly rent."
      />

      <div className="mt-8">
        <PropertyFilters categories={categories} />
      </div>

      {!listing.ok ? (
        <div
          role="alert"
          className="mt-10 border border-critical/45 px-5 py-6 md:px-6"
        >
          <p className="text-micro uppercase tracking-label text-critical">
            Listings unavailable
          </p>
          <p className="mt-3 max-w-prose text-body text-ink">
            The listings service did not respond. This is not your filters —
            the API is unreachable from the server right now.
          </p>
          <p className="mt-3 font-mono text-micro text-ink-faint">
            {listing.error instanceof Error
              ? listing.error.message
              : "Unknown transport error."}
          </p>
          <div className="mt-6">
            <ButtonLink href="/properties" variant="outline" size="sm">
              Try again
            </ButtonLink>
          </div>
        </div>
      ) : (
        <ResultsView
          properties={listing.value.properties}
          meta={listing.value.meta}
          activeFilters={activeFilters}
          hrefFor={hrefFor}
        />
      )}
    </div>
  );
}

function ResultsView({
  properties,
  meta,
  activeFilters,
  hrefFor,
}: {
  properties: Property[];
  meta: ApiMeta | null;
  activeFilters: string[];
  hrefFor: (page: number) => string;
}) {
  const offset = meta ? (meta.page - 1) * meta.limit : 0;

  return (
    <>
      <p className="mt-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-rule pb-3 text-micro uppercase tracking-label text-ink-faint">
        <span>
          Showing{" "}
          <span className="font-mono tabular-nums text-ink">
            {properties.length}
          </span>{" "}
          of{" "}
          <span className="font-mono tabular-nums text-ink">
            {meta?.total ?? properties.length}
          </span>{" "}
          listings
        </span>
        {activeFilters.length > 0 && (
          <span className="text-ink-muted normal-case tracking-normal">
            {activeFilters.join(" · ")}
          </span>
        )}
      </p>

      {properties.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No listings match those filters."
            description="Widen the rent range, drop the category, or search a neighbouring area."
            action={
              <ButtonLink href="/properties" variant="outline" size="sm">
                Clear filters
              </ButtonLink>
            }
          />
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((property, i) => (
            <li key={property.id} className="flex">
              <PropertyCard
                property={property}
                index={offset + i + 1}
                priority={i < 4}
                className="w-full"
              />
            </li>
          ))}
        </ul>
      )}

      {meta && (
        <div className="mt-10">
          <Pagination
            page={meta.page}
            totalPage={meta.totalPage}
            total={meta.total}
            hrefFor={hrefFor}
          />
        </div>
      )}
    </>
  );
}
