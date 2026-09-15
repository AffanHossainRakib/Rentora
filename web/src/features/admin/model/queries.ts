import { searchParams } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { serverRequest } from "@/shared/api/server";
import type {
  ApiMeta,
  PageQuery,
  Property,
  RentalRequest,
  Role,
  User,
} from "@/shared/types";

export async function listUsers(
  filters: { role?: Role } & PageQuery = {},
): Promise<{ users: User[]; meta: ApiMeta | null }> {
  const { data, meta } = await serverRequest<{ users: User[] }>(
    `${ENDPOINTS.admin.users}${searchParams({ ...filters })}`,
  );
  return { users: data.users, meta: meta ?? null };
}

export async function listAllProperties(
  filters: PageQuery = {},
): Promise<{ properties: Property[]; meta: ApiMeta | null }> {
  const { data, meta } = await serverRequest<{ properties: Property[] }>(
    `${ENDPOINTS.admin.properties}${searchParams({ ...filters })}`,
  );
  return { properties: data.properties, meta: meta ?? null };
}

export async function listAllRentals(
  filters: PageQuery = {},
): Promise<{ rentalRequests: RentalRequest[]; meta: ApiMeta | null }> {
  const { data, meta } = await serverRequest<{ rentalRequests: RentalRequest[] }>(
    `${ENDPOINTS.admin.rentals}${searchParams({ ...filters })}`,
  );
  return { rentalRequests: data.rentalRequests, meta: meta ?? null };
}
