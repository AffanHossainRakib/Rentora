import { searchParams } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { serverRequest } from "@/shared/api/server";
import type { ApiMeta, PageQuery, Payment, PaymentStatus } from "@/shared/types";

export interface PaymentFilters extends PageQuery {
  status?: PaymentStatus;
}

export async function listMyPayments(
  filters: PaymentFilters = {},
): Promise<{ payments: Payment[]; meta: ApiMeta | null }> {
  const { data, meta } = await serverRequest<{ payments: Payment[] }>(
    `${ENDPOINTS.payments.list}${searchParams({ ...filters })}`,
  );
  return { payments: data.payments, meta: meta ?? null };
}

export async function getPayment(id: string): Promise<Payment> {
  const { data } = await serverRequest<{ payment: Payment }>(
    ENDPOINTS.payments.detail(id),
  );
  return data.payment;
}
