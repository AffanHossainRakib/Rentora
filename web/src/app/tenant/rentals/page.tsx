import type { Metadata } from "next";
import { RentalTable, StatusFilter } from "@/features/rentals";
import { listMyRentals } from "@/features/rentals/server";
import { ApiError } from "@/shared/api/client";
import { Pagination, Panel, SectionHeading } from "@/shared/ui";
import { RENTAL_STATUSES } from "@/shared/lib/status";
import type { ApiMeta, RentalStatus } from "@/shared/types";

export const metadata: Metadata = { title: "Rentals" };

const PAGE_SIZE = 10;
const OFFLINE =
  "Rentora could not reach the API. Your requests are safe — try again shortly.";

export default async function TenantRentalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status: rawStatus, page: rawPage } = await searchParams;
  const status = toStatus(rawStatus);
  const page = toPage(rawPage);

  const result = await load({ status, page });

  const hrefFor = (target: number) => {
    const query = new URLSearchParams();
    if (status) query.set("status", status);
    if (target > 1) query.set("page", String(target));
    return query.size ? `/tenant/rentals?${query}` : "/tenant/rentals";
  };

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        index="02"
        title="Rentals"
        description="Every request you have sent, from first ask to closed tenancy."
      />

      <StatusFilter />

      {result.error ? (
        <Panel as="div" className="p-6">
          <p className="text-micro uppercase tracking-label text-critical">
            Data unavailable
          </p>
          <p className="mt-2 max-w-prose text-body text-ink-muted">
            {result.error}
          </p>
        </Panel>
      ) : (
        <>
          <RentalTable rentals={result.rentals} />
          {result.meta && (
            <Pagination
              page={result.meta.page}
              totalPage={result.meta.totalPage}
              total={result.meta.total}
              hrefFor={hrefFor}
            />
          )}
        </>
      )}
    </div>
  );
}

/** Only a value the API's enum accepts is ever forwarded. */
function toStatus(value: string | undefined): RentalStatus | undefined {
  return RENTAL_STATUSES.find((status) => status === value);
}

function toPage(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

async function load(filters: { status?: RentalStatus; page: number }) {
  try {
    const { rentalRequests, meta } = await listMyRentals({
      ...filters,
      limit: PAGE_SIZE,
    });
    return { rentals: rentalRequests, meta, error: null as string | null };
  } catch (error) {
    return {
      rentals: [],
      meta: null as ApiMeta | null,
      error: error instanceof ApiError ? error.message : OFFLINE,
    };
  }
}
