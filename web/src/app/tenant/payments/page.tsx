import type { Metadata } from "next";
import { PaymentTable } from "@/features/payments";
import { listMyPayments } from "@/features/payments/server";
import { ApiError } from "@/shared/api/client";
import { Pagination, Panel, SectionHeading } from "@/shared/ui";
import type { ApiMeta } from "@/shared/types";

export const metadata: Metadata = { title: "Payments" };

const PAGE_SIZE = 10;
const OFFLINE =
  "Rentora could not reach the API. No payment has been affected — try again shortly.";

export default async function TenantPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: rawPage } = await searchParams;
  const page = toPage(rawPage);
  const result = await load(page);

  const hrefFor = (target: number) =>
    target > 1 ? `/tenant/payments?page=${target}` : "/tenant/payments";

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        index="03"
        title="Payments"
        description="Every charge Rentora has raised against your tenancies."
      />

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
          <PaymentTable payments={result.payments} />
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

function toPage(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

async function load(page: number) {
  try {
    const { payments, meta } = await listMyPayments({ page, limit: PAGE_SIZE });
    return { payments, meta, error: null as string | null };
  } catch (error) {
    return {
      payments: [],
      meta: null as ApiMeta | null,
      error: error instanceof ApiError ? error.message : OFFLINE,
    };
  }
}
