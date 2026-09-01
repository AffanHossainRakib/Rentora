import { z } from "zod";
import {
  createPaymentSchema,
  getPaymentsQuerySchema,
} from "./payment.validation";

export type CreatePaymentPayload = z.infer<typeof createPaymentSchema>;
export type GetPaymentsQuery = z.infer<typeof getPaymentsQuerySchema>;
