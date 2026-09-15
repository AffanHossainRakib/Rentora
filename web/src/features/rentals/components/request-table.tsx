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
import { formatDateRange, nightsBetween } from "@/shared/lib/format";
import { RENTAL_TONE } from "@/shared/lib/status";
import type { RentalRequest } from "@/shared/types";
import { RequestDecision } from "./request-decision";

export function RequestTable({
  requests,
  showActions = true,
}: {
  requests: RentalRequest[];
  showActions?: boolean;
}) {
  if (requests.length === 0) {
    return (
      <EmptyState
        title="No requests"
        description="Rental requests for your listings appear here as tenants submit them."
      />
    );
  }

  return (
    <Table caption="Rental requests for your listings">
      <THead>
        <TH className="w-12">#</TH>
        <TH>Tenant</TH>
        <TH>Property</TH>
        <TH>Dates</TH>
        <TH numeric>Nights</TH>
        <TH>Status</TH>
        {showActions && <TH align="right">Decision</TH>}
      </THead>
      <TBody>
        {requests.map((request, index) => (
          <TR key={request.id}>
            <TD className="font-mono text-micro tabular-nums text-ink-faint">
              {String(index + 1).padStart(2, "0")}
            </TD>

            <TD>
              <span className="block truncate text-body text-ink">
                {request.user?.name ?? "Unknown tenant"}
              </span>
              <span className="block truncate text-micro text-ink-faint">
                {request.user?.email ?? "—"}
              </span>
            </TD>

            <TD>
              {request.property ? (
                <>
                  <Link
                    href={`/properties/${request.propertyId}`}
                    className="block truncate text-body text-ink underline-offset-4 hover:text-signal hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  >
                    {request.property.title}
                  </Link>
                  <span className="block truncate text-micro text-ink-faint">
                    {request.property.location}
                  </span>
                </>
              ) : (
                <span className="text-ink-faint">—</span>
              )}
            </TD>

            <TD className="whitespace-nowrap font-mono text-meta tabular-nums text-ink-muted">
              {formatDateRange(request.startDate, request.endDate)}
            </TD>

            <TD numeric className="font-mono text-meta">
              {nightsBetween(request.startDate, request.endDate)}
            </TD>

            <TD>
              <Badge tone={RENTAL_TONE[request.status]}>{request.status}</Badge>
            </TD>

            {showActions && (
              <TD align="right">
                <RequestDecision
                  requestId={request.id}
                  status={request.status}
                />
              </TD>
            )}
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
