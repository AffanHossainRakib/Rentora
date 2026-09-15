"use server";

import { revalidatePath } from "next/cache";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { serverRequest } from "@/shared/api/server";
import { fail, ok, type ActionResult } from "@/shared/api/action-result";
import type { RentalRequest, RentalStatus } from "@/shared/types";

export async function createRentalAction(
  _prev: ActionResult<RentalRequest> | null,
  formData: FormData,
): Promise<ActionResult<RentalRequest>> {
  const toIso = (value: FormDataEntryValue | null) => {
    const raw = String(value ?? "");
    return raw ? new Date(raw).toISOString() : "";
  };

  try {
    const { data } = await serverRequest<{ rentalRequest: RentalRequest }>(
      ENDPOINTS.rentals.create,
      {
        method: "POST",
        body: {
          propertyId: String(formData.get("propertyId") ?? ""),
          startDate: toIso(formData.get("startDate")),
          endDate: toIso(formData.get("endDate")),
        },
      },
    );
    revalidatePath("/tenant/rentals");
    return ok(data.rentalRequest);
  } catch (error) {
    return fail(error);
  }
}

export async function decideRequestAction(
  id: string,
  status: RentalStatus,
): Promise<ActionResult<RentalRequest>> {
  try {
    const { data } = await serverRequest<{ rentalRequest: RentalRequest }>(
      ENDPOINTS.landlord.request(id),
      { method: "PATCH", body: { status } },
    );
    revalidatePath("/landlord/requests");
    revalidatePath("/admin/rentals");
    return ok(data.rentalRequest);
  } catch (error) {
    return fail(error);
  }
}
