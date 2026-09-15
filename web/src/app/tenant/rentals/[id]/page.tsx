import Link from "next/link";
import { notFound } from "next/navigation";
import { getRental } from "@/features/rentals/server";
import { CheckoutButton, PaymentTable } from "@/features/payments";
import { ReviewForm } from "@/features/reviews";
import { ApiError } from "@/shared/api/client";
import {
  Badge,
  ButtonLink,
  Panel,
  PanelHeader,
  SectionHeading,
} from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import {
  formatDate,
  formatDateRange,
  formatRent,
  nightsBetween,
} from "@/shared/lib/format";
import { RENTAL_HINT, RENTAL_TONE } from "@/shared/lib/status";
import type { Rating, RentalRequest, Review } from "@/shared/types";

const OFFLINE =
  "Rentora could not reach the API. Your request is safe — try again shortly.";

type Loaded =
  | { state: "ok"; rental: RentalRequest }
  | { state: "missing" }
  | { state: "forbidden" }
  | { state: "error"; message: string };

export default async function RentalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await load(id);

  if (result.state === "missing") notFound();

  if (result.state === "forbidden") {
    return (
      <Shell title="Rental request">
        <Panel as="div" className="p-6">
          <p className="text-micro uppercase tracking-label text-critical">
            Not yours to view
          </p>
          <h2 className="mt-2 text-h4 text-ink">This request belongs to someone else</h2>
          <p className="mt-2 max-w-prose text-body text-ink-muted">
            A rental request is visible only to the tenant who made it, the
            landlord who owns the property, and an administrator.
          </p>
          <ButtonLink href="/tenant/rentals" variant="outline" size="sm" className="mt-5">
            Back to my rentals
          </ButtonLink>
        </Panel>
      </Shell>
    );
  }

  if (result.state === "error") {
    return (
      <Shell title="Rental request">
        <Panel as="div" className="p-6">
          <p className="text-micro uppercase tracking-label text-critical">
            Data unavailable
          </p>
          <p className="mt-2 max-w-prose text-body text-ink-muted">
            {result.message}
          </p>
        </Panel>
      </Shell>
    );
  }

  const { rental } = result;
  const property = rental.property;
  const nights = nightsBetween(rental.startDate, rental.endDate);
  const payments = rental.payments ?? [];

  return (
    <Shell
      title={property?.title ?? "Rental request"}
      description={property?.location}
    >
      <Panel as="div" className="p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={RENTAL_TONE[rental.status]}>{rental.status}</Badge>
          <span className="font-mono text-micro uppercase tracking-label text-ink-faint">
            {rental.id}
          </span>
        </div>
        <p className="mt-4 max-w-prose text-lead text-ink">
          {RENTAL_HINT[rental.status]}
        </p>
        {rental.status === "APPROVED" && (
          <div className="mt-5 border-t border-rule pt-5">
            <CheckoutButton
              rentalRequestId={rental.id}
              label={
                property ? `Pay ${formatRent(property.price)}` : "Pay now"
              }
            />
          </div>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel>
          <PanelHeader index="01" title="Tenancy" />
          <dl className="divide-y divide-rule px-5">
            <Row label="Dates">
              <span className="tabular-nums">
                {formatDateRange(rental.startDate, rental.endDate)}
              </span>
            </Row>
            <Row label="Nights">
              <span className="font-mono tabular-nums">{nights}</span>
            </Row>
            <Row label="Requested">
              <span className="tabular-nums">{formatDate(rental.createdAt)}</span>
            </Row>
          </dl>
        </Panel>

        <Panel>
          <PanelHeader index="02" title="Property" />
          {property ? (
            <div className="flex flex-col gap-3 p-5">
              <p className="text-lead text-ink">{property.title}</p>
              <p className="text-micro uppercase tracking-label text-ink-faint">
                {property.location}
                <span className="mx-2 text-rule-strong">/</span>
                {property.category}
              </p>
              <p className="font-mono text-h3 tabular-nums leading-none text-ink">
                {formatRent(property.price)}
                <span className="ml-1 text-micro text-ink-faint">/mo</span>
              </p>
              <ButtonLink
                href={`/properties/${rental.propertyId}`}
                variant="outline"
                size="sm"
                className="mt-1 self-start"
              >
                View listing
              </ButtonLink>
            </div>
          ) : (
            <p className="p-5 text-meta text-ink-muted">
              This listing is no longer published.
            </p>
          )}
        </Panel>
      </div>

      <Panel>
        <PanelHeader
          index="03"
          title="Payments"
          description="Charges raised against this request."
        />
        <div className="px-5 py-5">
          <PaymentTable payments={payments} propertyTitle={property?.title} />
        </div>
      </Panel>

      {rental.status === "COMPLETED" && (
        <Panel>
          <PanelHeader
            index="04"
            title="Review"
            description={
              rental.review
                ? "Your published review of this stay."
                : "A finished stay can be reviewed once."
            }
          />
          <div className="px-5 py-5">
            {rental.review ? (
              <PublishedReview review={rental.review} />
            ) : (
              <ReviewForm rentalRequestId={rental.id} />
            )}
          </div>
        </Panel>
      )}
    </Shell>
  );
}

function Shell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/tenant/rentals"
        className="w-fit text-micro uppercase tracking-label text-ink-muted transition-colors hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        ← All rentals
      </Link>
      <SectionHeading index="02" title={title} description={description} />
      {children}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-micro uppercase tracking-label text-ink-muted">
        {label}
      </dt>
      <dd className="text-body text-ink">{children}</dd>
    </div>
  );
}

function PublishedReview({ review }: { review: Review }) {
  return (
    <article className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <RatingMeter value={review.rating} />
        <span className="font-mono text-meta tabular-nums text-ink-muted">
          {review.rating}/5
        </span>
        <span className="ml-auto text-micro uppercase tracking-label text-ink-faint">
          {formatDate(review.createdAt)}
        </span>
      </div>
      <p className="max-w-prose text-body text-ink">{review.review}</p>
    </article>
  );
}

function RatingMeter({ value }: { value: Rating }) {
  return (
    <>
      <span className="flex gap-1" aria-hidden>
        {[1, 2, 3, 4, 5].map((step) => (
          <span
            key={step}
            className={cn(
              "size-4 border",
              step <= value ? "border-signal bg-signal" : "border-rule-strong",
            )}
          />
        ))}
      </span>
      <span className="sr-only">{value} out of 5</span>
    </>
  );
}

async function load(id: string): Promise<Loaded> {
  try {
    return { state: "ok", rental: await getRental(id) };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.statusCode === 404) return { state: "missing" };
      if (error.statusCode === 403) return { state: "forbidden" };
      return { state: "error", message: error.message };
    }
    return { state: "error", message: OFFLINE };
  }
}
