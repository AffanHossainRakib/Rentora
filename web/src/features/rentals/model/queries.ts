import { searchParams } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { serverRequest } from "@/shared/api/server";
import type { ApiMeta, PageQuery, RentalRequest, RentalStatus } from "@/shared/types";

export interface RentalFilters extends PageQuery {
  status?: RentalStatus;
}

type RentalPage = { rentalRequests: RentalRequest[]; meta: ApiMeta | null };

export async function listMyRentals(
  filters: RentalFilters = {},
): Promise<RentalPage> {
  const { data, meta } = await serverRequest<{ rentalRequests: RentalRequest[] }>(
    `${ENDPOINTS.rentals.list}${searchParams({ ...filters })}`,
  );
  return { rentalRequests: data.rentalRequests, meta: meta ?? null };
}

export async function getRental(id: string): Promise<RentalRequest> {
  const { data } = await serverRequest<{ rentalRequest: RentalRequest }>(
    ENDPOINTS.rentals.detail(id),
  );
  return data.rentalRequest;
}

export async function listLandlordRequests(
  filters: RentalFilters = {},
): Promise<RentalPage> {
  const { data, meta } = await serverRequest<{ rentalRequests: RentalRequest[] }>(
    `${ENDPOINTS.landlord.requests}${searchParams({ ...filters })}`,
  );
  return { rentalRequests: data.rentalRequests, meta: meta ?? null };
}
