import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyAmenities, PropertyGallery } from "@/features/properties";
import { getProperty } from "@/features/properties/server";
import { RentalRequestForm } from "@/features/rentals";
import { ReviewList } from "@/features/reviews";
import { ApiError } from "@/shared/api/client";
import { Badge, Panel } from "@/shared/ui";
import { formatDate, formatRent } from "@/shared/lib/format";
import type { Property } from "@/shared/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const property = await getProperty(id);
    return {
      title: property.title,
      description:
        property.description?.slice(0, 155) ??
        `${property.category} in ${property.location} at ${formatRent(property.price)} per month.`,
    };
  } catch {
    return { title: "Listing" };
  }
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let property: Property;
  try {
    property = await getProperty(id);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) notFound();
    throw error;
  }

  const reviews = property.reviews ?? [];

  return (
    <div className="mx-auto max-w-shell px-gutter py-10 lg:py-14">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-baseline gap-2 text-micro uppercase tracking-label text-ink-faint">
          <li>
            <Link
              href="/properties"
              className="transition-colors hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Listings
            </Link>
          </li>
          <li aria-hidden className="font-mono">
            /
          </li>
          <li aria-current="page" className="text-ink-muted">
            {property.title}
          </li>
        </ol>
      </nav>

      <header className="mt-5 border-b border-ink pb-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Badge tone={property.isAvailable ? "positive" : "neutral"}>
            {property.isAvailable ? "Available" : "Let"}
          </Badge>
          <span className="text-micro uppercase tracking-label text-ink-faint">
            {property.category}
          </span>
          <span className="text-micro uppercase tracking-label text-ink-muted">
            {property.location}
          </span>
        </div>
        <h1 className="mt-4 text-h1 tracking-tight-lg text-ink">
          {property.title}
        </h1>
      </header>

      <div className="grid gap-x-8 gap-y-12 pt-10 lg:grid-cols-12">
        <div className="flex flex-col gap-12 lg:col-span-7 xl:col-span-8">
          <PropertyGallery
            pictures={property.pictures}
            title={property.title}
          />

          {property.description && (
            <section aria-labelledby="about-heading">
              <SubHeading id="about-heading" index="01" title="The listing" />
              <p className="mt-5 max-w-prose whitespace-pre-line text-body text-ink-muted">
                {property.description}
              </p>
            </section>
          )}

          {property.amenities.length > 0 && (
            <section aria-labelledby="amenities-heading">
              <SubHeading
                id="amenities-heading"
                index="02"
                title="Amenities"
                count={property.amenities.length}
              />
              <div className="mt-5">
                <PropertyAmenities amenities={property.amenities} />
              </div>
            </section>
          )}
        </div>

        <aside
          aria-labelledby="request-heading"
          className="lg:col-span-5 xl:col-span-4"
        >
          <div className="lg:sticky lg:top-20">
            <Panel as="div">
              <div className="border-b border-rule px-5 py-5">
                <h2
                  id="request-heading"
                  className="text-micro uppercase tracking-label text-ink-muted"
                >
                  Request this tenancy
                </h2>
                <p className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-mono text-h2 tabular-nums leading-none text-ink">
                    {formatRent(property.price)}
                  </span>
                  <span className="text-micro uppercase tracking-label text-ink-faint">
                    / month
                  </span>
                </p>
              </div>

              <dl className="border-b border-rule px-5 py-4">
                <Row label="Landlord" value={property.user?.name ?? "—"} />
                <Row
                  label="Availability"
                  value={property.isAvailable ? "Taking requests" : "Let"}
                />
                <Row label="Listed" value={formatDate(property.createdAt)} mono />
              </dl>

              <RentalRequestForm
                propertyId={property.id}
                isAvailable={property.isAvailable}
                price={property.price}
              />
            </Panel>
          </div>
        </aside>
      </div>

      {reviews.length > 0 && (
        <section aria-labelledby="reviews-heading" className="mt-16 lg:mt-20">
          <SubHeading
            id="reviews-heading"
            index="03"
            title="Reviews"
            count={reviews.length}
          />
          <div className="mt-6">
            <ReviewList reviews={reviews} />
          </div>
        </section>
      )}
    </div>
  );
}

function SubHeading({
  id,
  index,
  title,
  count,
}: {
  id: string;
  index: string;
  title: string;
  count?: number;
}) {
  return (
    <h2
      id={id}
      className="flex items-baseline justify-between gap-4 border-b border-rule pb-3 text-h4 text-ink"
    >
      <span className="flex items-baseline gap-2.5">
        <span className="font-mono text-micro tabular-nums text-ink-faint">
          {index}
        </span>
        {title}
      </span>
      {count !== undefined && (
        <span className="font-mono text-micro tabular-nums text-ink-faint">
          {String(count).padStart(2, "0")}
        </span>
      )}
    </h2>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-rule py-2.5 last:border-b-0">
      <dt className="text-micro uppercase tracking-label text-ink-faint">
        {label}
      </dt>
      <dd className={mono ? "font-mono text-meta tabular-nums text-ink" : "text-meta text-ink"}>
        {value}
      </dd>
    </div>
  );
}
