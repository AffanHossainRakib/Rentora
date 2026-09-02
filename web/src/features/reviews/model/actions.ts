"use server";

import { revalidatePath } from "next/cache";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { serverRequest } from "@/shared/api/server";
import { fail, ok, type ActionResult } from "@/shared/api/action-result";
import type { Review } from "@/shared/types";

export async function createReviewAction(
  _prev: ActionResult<Review> | null,
  formData: FormData,
): Promise<ActionResult<Review>> {
  try {
    const { data } = await serverRequest<{ review: Review }>(
      ENDPOINTS.reviews.create,
      {
        method: "POST",
        body: {
          rentalRequestId: String(formData.get("rentalRequestId") ?? ""),
          rating: Number(formData.get("rating") ?? 0),
          review: String(formData.get("review") ?? "").trim(),
        },
      },
    );
    revalidatePath("/tenant/rentals");
    return ok(data.review);
  } catch (error) {
    return fail(error);
  }
}
