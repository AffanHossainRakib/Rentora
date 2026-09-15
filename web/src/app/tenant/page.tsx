import type { Metadata } from "next";
import { listMyRentals } from "@/features/rentals/server";
import { CheckoutButton } from "@/features/payments";
import { listMyPayments } from "@/features/payments/server";
import { ApiError } from "@/shared/api/client";
import {
  Badge,
  ButtonLink,
  EmptyState,
  Panel,
  PanelHeader,
  SectionHeading,
  Stat,
  StatGrid,
} from "@/shared/ui";
import {
  formatDate,
  formatDateRange,
  formatMoney,
  formatRent,
} from "@/shared/lib/format";
import { PAYMENT_TONE, RENTAL_TONE, type Tone } from "@/shared/lib/status";
import type { Payment, RentalRequest } from "@/shared/types";

export const metadata: Metadata = { title: "Overview" };

const OFFLINE =
  "Rentora could not reach the API. Your data is safe — try again shortly.";
const ACTIVITY_ROWS = 6;

export default async function TenantOverviewPage() {
  const snapshot = await loadSnapshot();

  if (snapshot.error) {
    return (
      <div className="flex flex-col gap-8">
        <SectionHeading index="01" title="Overview" />
        <Panel as="div" className="p-6">
          <p className="text-micro uppercase tracking-label text-critical">
            Data unavailable
          </p>
          <p className="mt-2 max-w-prose text-body text-ink-muted">
            {snapshot.error}
          </p>
        </Panel>
      </div>
    );
  }

  const { rentals, payments } = snapshot;

  const active = rentals.filter((r) => r.status === "ACTIVE");
  const pending = rentals.filter((r) => r.status === "PENDING");
  const completed = rentals.filter((r) => r.status === "COMPLETED");
  const awaitingPayment = rentals.filter((r) => r.status === "APPROVED");
  const awaitingReview = completed.filter((r) => !r.review);
  const paid = settledTotal(payments);

  if (rentals.length === 0 && payments.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <SectionHeading
          index="01"
          title="Overview"
          description="Your tenancies, requests and payments in one place."
        />
        <EmptyState
          title="Nothing here yet"
          description="Find a place you like and send the landlord a rental request — it will show up here the moment you do."
          action={<ButtonLink href="/properties">Browse listings</ButtonLink>}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <SectionHeading
        index="01"
        title="Overview"
        description="Your tenancies, requests and payments in one place."
        action={
          <ButtonLink href="/properties" variant="outline" size="sm">
            Browse listings
          </ButtonLink>
        }
      />

      <div className="animate-rise">
        <StatGrid>
          <Stat
            label="Active tenancies"
            value={active.length}
            note={active.length === 1 ? "1 running" : "currently running"}
          />
          <Stat
            label="Pending requests"
            value={pending.length}
            note="awaiting a landlord"
          />
          <Stat label="Completed stays" value={completed.length} />
          <Stat label="Total paid" value={paid.value} note={paid.note} />
        </StatGrid>
      </div>

      <Panel className="animate-rise [animation-delay:80ms]">
        <PanelHeader
          index="02"
          title="Needs your attention"
          description="Steps only you can take."
        />

        {awaitingPayment.length === 0 && awaitingReview.length === 0 ? (
          <p className="px-5 py-6 text-meta text-ink-muted">
            Nothing outstanding. Every request is either running, closed or with
            the landlord.
          </p>
        ) : (
          <ul className="divide-y divide-rule">
            {awaitingPayment.map((rental) => (
              <li
                key={rental.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
              >
                <TaskSummary
                  eyebrow="Approved — payment due"
                  rental={rental}
                  tone="accent"
                />
                <CheckoutButton rentalRequestId={rental.id} />
              </li>
            ))}

            {awaitingReview.map((rental) => (
              <li
                key={rental.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
              >
                <TaskSummary
                  eyebrow="Stay finished — review it"
                  rental={rental}
                  tone="neutral"
                />
                <ButtonLink
                  href={`/tenant/rentals/${rental.id}`}
                  variant="outline"
                  size="sm"
                >
                  Leave a review
                </ButtonLink>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel className="animate-rise [animation-delay:160ms]">
        <PanelHeader
          index="03"
          title="Recent activity"
          action={
            <ButtonLink href="/tenant/rentals" variant="ghost" size="sm">
              All rentals
            </ButtonLink>
          }
        />
        <RecentActivity rentals={rentals} payments={payments} />
      </Panel>
    </div>
  );
}

function TaskSummary({
  eyebrow,
  rental,
  tone,
}: {
  eyebrow: string;
  rental: RentalRequest;
  tone: Tone;
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-2 text-micro uppercase tracking-label text-ink-faint">
        <Badge tone={tone}>{rental.status}</Badge>
        {eyebrow}
      </p>
      <p className="mt-2 truncate text-body text-ink">
        {rental.property?.title ?? "Property unavailable"}
      </p>
      <p className="text-meta text-ink-muted">
        <span className="tabular-nums">
          {formatDateRange(rental.startDate, rental.endDate)}
        </span>
        {rental.property && (
          <>
            <span className="mx-2 text-rule-strong">/</span>
            <span className="font-mono tabular-nums">
              {formatRent(rental.property.price)}
            </span>
          </>
        )}
      </p>
    </div>
  );
}

function RecentActivity({
  rentals,
  payments,
}: {
  rentals: RentalRequest[];
  payments: Payment[];
}) {
  const entries = [
    ...rentals.map((rental) => ({
      key: `rental-${rental.id}`,
      at: rental.createdAt ?? rental.startDate,
      label: rental.property?.title ?? "Property unavailable",
      kind: "Request",
      status: rental.status,
      tone: RENTAL_TONE[rental.status],
    })),
    ...payments.map((payment) => ({
      key: `payment-${payment.id}`,
      at: payment.paidAt ?? payment.createdAt ?? null,
      label:
        payment.rentalRequest?.property?.title ??
        formatMoney(payment.amount, payment.currency),
      kind: "Payment",
      status: payment.status,
      tone: PAYMENT_TONE[payment.status],
    })),
  ]
    .sort((a, b) => timestamp(b.at) - timestamp(a.at))
    .slice(0, ACTIVITY_ROWS);

  if (entries.length === 0) {
    return (
      <p className="px-5 py-6 text-meta text-ink-muted">No activity yet.</p>
    );
  }

  return (
    <ul className="divide-y divide-rule px-5">
      {entries.map((entry) => (
        <li key={entry.key} className="flex items-center gap-4 py-3">
          <span className="w-24 shrink-0 font-mono text-micro tabular-nums text-ink-faint">
            {formatDate(entry.at)}
          </span>
          <span className="w-16 shrink-0 text-micro uppercase tracking-label text-ink-faint">
            {entry.kind}
          </span>
          <span className="min-w-0 flex-1 truncate text-meta text-ink">
            {entry.label}
          </span>
          <Badge tone={entry.tone}>{entry.status}</Badge>
        </li>
      ))}
    </ul>
  );
}

function timestamp(iso: string | null | undefined): number {
  const parsed = iso ? Date.parse(iso) : Number.NaN;
  return Number.isNaN(parsed) ? 0 : parsed;
}

/** Mixed currencies cannot be summed honestly, so they are counted instead. */
function settledTotal(payments: Payment[]): { value: string; note?: string } {
  const settled = payments.filter((p) => p.status === "COMPLETED");
  if (settled.length === 0) return { value: "0", note: "nothing settled yet" };

  const currencies = new Set(settled.map((p) => p.currency.toUpperCase()));
  if (currencies.size > 1) {
    return {
      value: String(settled.length),
      note: `payments across ${currencies.size} currencies`,
    };
  }

  const total = settled.reduce((sum, p) => sum + p.amount, 0);
  return {
    value: formatMoney(total, settled[0].currency),
    note: `${settled.length} settled ${settled.length === 1 ? "payment" : "payments"}`,
  };
}

async function loadSnapshot(): Promise<{
  rentals: RentalRequest[];
  payments: Payment[];
  error: string | null;
}> {
  try {
    const [rentals, payments] = await Promise.all([
      listMyRentals({ limit: 100 }),
      listMyPayments({ limit: 100 }),
    ]);
    return {
      rentals: rentals.rentalRequests,
      payments: payments.payments,
      error: null,
    };
  } catch (error) {
    return {
      rentals: [],
      payments: [],
      error: error instanceof ApiError ? error.message : OFFLINE,
    };
  }
}
