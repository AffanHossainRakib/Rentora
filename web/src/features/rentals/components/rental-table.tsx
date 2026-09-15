import Link from "next/link";
import {
  Badge,
  EmptyState,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/shared/ui";
import { formatDateRange, formatRent, nightsBetween } from "@/shared/lib/format";
import { RENTAL_TONE } from "@/shared/lib/status";
import type { RentalRequest } from "@/shared/types";

export function RentalTable({
  rentals,
  hrefBase = "/tenant/rentals",
}: {
  rentals: RentalRequest[];
  /** Detail route the property cell links into, so landlord/admin can reuse. */
  hrefBase?: string;
}) {
  if (rentals.length === 0) {
    return (
      <EmptyState
        title="No rental requests"
        description="Nothing matches this view yet. Requests appear here as soon as they are sent."
      />
    );
  }

  return (
    <Table caption="Rental requests">
      <THead>
        <TH className="w-10">No.</TH>
        <TH>Property</TH>
        <TH>Dates</TH>
        <TH numeric>Nights</TH>
        <TH numeric>Rent</TH>
        <TH>Status</TH>
      </THead>
      <TBody>
        {rentals.map((rental, index) => (
          <TR key={rental.id}>
            <TD className="font-mono text-micro tabular-nums text-ink-faint">
              {String(index + 1).padStart(2, "0")}
            </TD>

            <TD>
              <Link
                href={`${hrefBase}/${rental.id}`}
                className="group block py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                <span className="block text-body text-ink transition-colors duration-150 group-hover:text-signal">
                  {rental.property?.title ?? "Property unavailable"}
                </span>
                <span className="block text-micro uppercase tracking-label text-ink-faint">
                  {rental.property?.location ?? "—"}
                </span>
              </Link>
            </TD>

            <TD className="whitespace-nowrap text-meta text-ink-muted">
              {formatDateRange(rental.startDate, rental.endDate)}
            </TD>

            <TD numeric className="font-mono text-meta">
              {nightsBetween(rental.startDate, rental.endDate)}
            </TD>

            <TD numeric className="font-mono text-meta">
              {rental.property ? formatRent(rental.property.price) : "—"}
            </TD>

            <TD>
              <Badge tone={RENTAL_TONE[rental.status]}>{rental.status}</Badge>
            </TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
