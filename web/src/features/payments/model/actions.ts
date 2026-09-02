"use server";

import { redirect } from "next/navigation";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { serverRequest } from "@/shared/api/server";
import { fail, type ActionResult } from "@/shared/api/action-result";
import type { Payment } from "@/shared/types";

/** `redirect` throws, so it must sit outside the try block. */
export async function startCheckoutAction(
  rentalRequestId: string,
): Promise<ActionResult<never>> {
  let paymentUrl: string;

  try {
    const { data } = await serverRequest<{
      paymentUrl: string;
      payment: Payment;
    }>(ENDPOINTS.payments.create, {
      method: "POST",
      body: { rentalRequestId },
    });
    paymentUrl = data.paymentUrl;
  } catch (error) {
    return fail(error);
  }

  redirect(paymentUrl);
}
