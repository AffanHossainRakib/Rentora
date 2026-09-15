import type { Metadata } from "next";
import { RequestTable, StatusFilter } from "@/features/rentals";
import { listLandlordRequests } from "@/features/rentals/server";
import { Pagination, Panel, SectionHeading } from "@/shared/ui";
import { RENTAL_STATUSES } from "@/shared/lib/status";
import type { ApiMeta, RentalRequest, RentalStatus } from "@/shared/types";

export const metadata: Metadata = { title: "Requests" };

export default async function LandlordRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const query = await searchParams;
  const status: RentalStatus | undefined = RENTAL_STATUSES.find(
    (candidate) => candidate === query.status,
  );
  const page = Math.max(1, Number(query.page) || 1);

  let requests: RentalRequest[] = [];
  let meta: ApiMeta | null = null;
  let error: string | null = null;

  try {
    const result = await listLandlordRequests({ status, page });
    requests = result.rentalRequests;
    meta = result.meta;
  } catch (cause) {
    error =
      cause instanceof Error
        ? cause.message
        : "Rental requests could not be loaded.";
  }

  function hrefFor(next: number) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (next > 1) params.set("page", String(next));
    const serialised = params.toString();
    return serialised ? `/landlord/requests?${serialised}` : "/landlord/requests";
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        index="03"
        title="Requests"
        description="Tenancy requests across every listing you own. Pending ones are waiting on you."
      />

      <StatusFilter />

      {error ? (
        <Panel className="px-5 py-6">
          <p className="text-micro uppercase tracking-label text-critical">
            Requests unavailable
          </p>
          <p role="alert" className="mt-2 text-meta text-ink-muted">
            {error}
          </p>
        </Panel>
      ) : (
        <div className="flex flex-col gap-5">
          <RequestTable requests={requests} />

          {meta && (
            <Pagination
              page={meta.page}
              totalPage={meta.totalPage}
              total={meta.total}
              hrefFor={hrefFor}
            />
          )}
        </div>
      )}
    </div>
  );
}
