import type { Metadata } from "next";
import Link from "next/link";
import { AdminRentalActions } from "@/features/admin";
import { listAllRentals } from "@/features/admin/server";
import {
  Badge,
  EmptyState,
  Pagination,
  Panel,
  SectionHeading,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
} from "@/shared/ui";
import { formatDateRange } from "@/shared/lib/format";
import { RENTAL_TONE } from "@/shared/lib/status";
import type { ApiMeta, RentalRequest } from "@/shared/types";

export const metadata: Metadata = { title: "Rentals" };

export default async function AdminRentalsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: rawPage } = await searchParams;
  const page = Math.max(1, Number(rawPage) || 1);

  let rentals: RentalRequest[] = [];
  let meta: ApiMeta | null = null;
  let error: string | null = null;

  try {
    const result = await listAllRentals({ page });
    rentals = result.rentalRequests;
    meta = result.meta;
  } catch (cause) {
    error = cause instanceof Error ? cause.message : "The API did not respond.";
  }

  const offset = meta ? (meta.page - 1) * meta.limit : 0;

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        index="04"
        title="Rentals"
        description="Every rental request on the platform. An admin can settle a pending request on a landlord's behalf, and close an active tenancy by hand."
        action={
          meta ? (
            <p className="text-micro uppercase tracking-label text-ink-faint">
              <span className="font-mono tabular-nums text-ink">
                {String(meta.total).padStart(2, "0")}
              </span>{" "}
              requests
            </p>
          ) : null
        }
      />

      {error ? (
        <Panel className="px-5 py-6">
          <p className="text-micro uppercase tracking-label text-critical">
            Data unavailable
          </p>
          <p className="mt-2 max-w-prose text-meta text-ink-muted">{error}</p>
        </Panel>
      ) : rentals.length === 0 ? (
        <EmptyState
          title="No rental requests"
          description="Nobody has requested a tenancy yet. Requests appear here as soon as a tenant submits one."
        />
      ) : (
        <>
          <Table caption="Every rental request on Rentora, with the transitions an admin may apply">
            <THead>
              <TH className="w-12">No.</TH>
              <TH className="w-48">Tenant</TH>
              <TH>Property</TH>
              <TH className="w-48">Dates</TH>
              <TH className="w-32">Status</TH>
              <TH align="right" className="w-56">
                Action
              </TH>
            </THead>

            <TBody>
              {rentals.map((rental, i) => (
                <TR key={rental.id}>
                  <TD className="font-mono text-meta tabular-nums text-ink-faint">
                    {String(offset + i + 1).padStart(2, "0")}
                  </TD>

                  <TD>
                    {rental.user ? (
                      <>
                        <span className="block truncate text-meta text-ink">
                          {rental.user.name}
                        </span>
                        <span className="block truncate font-mono text-micro text-ink-faint">
                          {rental.user.email}
                        </span>
                      </>
                    ) : (
                      <span className="font-mono text-meta text-ink-faint">
                        #{rental.userId.slice(0, 8)}
                      </span>
                    )}
                  </TD>

                  <TD>
                    <Link
                      href={`/properties/${rental.propertyId}`}
                      className="block truncate text-body text-ink transition-colors hover:text-signal"
                    >
                      {rental.property?.title ?? (
                        <span className="font-mono text-meta text-ink-faint">
                          #{rental.propertyId.slice(0, 8)}
                        </span>
                      )}
                    </Link>
                    {rental.property && (
                      <span className="block truncate text-micro text-ink-faint">
                        {rental.property.location}
                      </span>
                    )}
                  </TD>

                  <TD className="font-mono text-meta text-ink-muted">
                    {formatDateRange(rental.startDate, rental.endDate)}
                  </TD>

                  <TD>
                    <Badge tone={RENTAL_TONE[rental.status]}>
                      {rental.status}
                    </Badge>
                  </TD>

                  <TD align="right">
                    <AdminRentalActions
                      requestId={rental.id}
                      status={rental.status}
                    />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>

          {meta && (
            <Pagination
              page={meta.page}
              totalPage={meta.totalPage}
              total={meta.total}
              hrefFor={(next) =>
                next > 1 ? `/admin/rentals?page=${next}` : "/admin/rentals"
              }
            />
          )}
        </>
      )}
    </div>
  );
}
