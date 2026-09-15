"use server";

import { revalidatePath } from "next/cache";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { serverRequest } from "@/shared/api/server";
import { fail, ok, type ActionResult } from "@/shared/api/action-result";
import type { Category, Property } from "@/shared/types";

export interface PropertyInput {
  title: string;
  description?: string;
  isAvailable?: boolean;
  location: string;
  price: number;
  category: string;
  amenities?: string[];
  pictures?: string[];
}

function readPropertyForm(formData: FormData): PropertyInput {
  const lines = (value: FormDataEntryValue | null) =>
    String(value ?? "")
      .split(/[\n,]/)
      .map((entry) => entry.trim())
      .filter(Boolean);

  return {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || undefined,
    location: String(formData.get("location") ?? "").trim(),
    price: Number(formData.get("price") ?? 0),
    category: String(formData.get("category") ?? "").trim(),
    isAvailable: formData.get("isAvailable") === "on",
    amenities: lines(formData.get("amenities")),
    pictures: lines(formData.get("pictures")),
  };
}

export async function createPropertyAction(
  _prev: ActionResult<Property> | null,
  formData: FormData,
): Promise<ActionResult<Property>> {
  try {
    const { data } = await serverRequest<{ property: Property }>(
      ENDPOINTS.landlord.properties,
      { method: "POST", body: readPropertyForm(formData) },
    );
    revalidatePath("/landlord/properties");
    return ok(data.property);
  } catch (error) {
    return fail(error);
  }
}

export async function updatePropertyAction(
  id: string,
  _prev: ActionResult<Property> | null,
  formData: FormData,
): Promise<ActionResult<Property>> {
  try {
    const { data } = await serverRequest<{ property: Property }>(
      ENDPOINTS.landlord.property(id),
      { method: "PUT", body: readPropertyForm(formData) },
    );
    revalidatePath("/landlord/properties");
    revalidatePath(`/properties/${id}`);
    return ok(data.property);
  } catch (error) {
    return fail(error);
  }
}

export async function deletePropertyAction(
  id: string,
): Promise<ActionResult<null>> {
  try {
    await serverRequest<null>(ENDPOINTS.landlord.property(id), {
      method: "DELETE",
    });
    revalidatePath("/landlord/properties");
    return ok(null);
  } catch (error) {
    return fail(error);
  }
}

export async function createCategoryAction(
  _prev: ActionResult<Category> | null,
  formData: FormData,
): Promise<ActionResult<Category>> {
  try {
    const { data } = await serverRequest<{ category: Category }>(
      ENDPOINTS.categories.create,
      { method: "POST", body: { name: String(formData.get("name") ?? "").trim() } },
    );
    revalidatePath("/admin/categories");
    return ok(data.category);
  } catch (error) {
    return fail(error);
  }
}
