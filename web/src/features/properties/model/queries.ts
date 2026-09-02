import { searchParams } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { publicRequest } from "@/shared/api/server";
import type { ApiMeta, Property, PropertyQuery } from "@/shared/types";

export async function listProperties(
  filters: PropertyQuery = {},
): Promise<{ properties: Property[]; meta: ApiMeta | null }> {
  const { data, meta } = await publicRequest<{ properties: Property[] }>(
    `${ENDPOINTS.properties.list}${searchParams({ ...filters })}`,
  );
  return { properties: data.properties, meta: meta ?? null };
}

export async function getProperty(id: string): Promise<Property> {
  const { data } = await publicRequest<{ property: Property }>(
    ENDPOINTS.properties.detail(id),
  );
  return data.property;
}

/**
 * The deployed API returns `categories` as a string array while the docs
 * describe `{ id, name }` objects. Accept both and hand the UI plain names —
 * a property references its category by name, so nothing else is needed.
 */
export async function listCategories(): Promise<string[]> {
  const { data } = await publicRequest<{
    categories: Array<string | { name?: string }>;
  }>(ENDPOINTS.categories.list, 300);

  return data.categories
    .map((entry) => (typeof entry === "string" ? entry : entry?.name))
    .filter((name): name is string => Boolean(name));
}

/**
 * The API documents no `GET /landlord/properties`, so a landlord's own stock is
 * derived from the public list. Swap this for a scoped endpoint once one exists.
 */
export async function listMyProperties(
  landlordId: string,
  filters: PropertyQuery = {},
): Promise<{ properties: Property[]; meta: ApiMeta | null }> {
  // Public endpoint, so it can be cached briefly rather than refetched on every
  // navigation between landlord pages. Property mutations call `revalidatePath`,
  // so an edit still shows up immediately.
  const { data, meta } = await publicRequest<{ properties: Property[] }>(
    `${ENDPOINTS.properties.list}${searchParams({ limit: 100, ...filters })}`,
    30,
  );
  return {
    properties: data.properties.filter((p) => p.userId === landlordId),
    meta: meta ?? null,
  };
}
