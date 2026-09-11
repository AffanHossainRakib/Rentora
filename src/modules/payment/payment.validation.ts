import { z } from "zod";
import { PaymentStatus } from "../../../prisma/generated/prisma/enums";

export const createPaymentSchema = z.object({
  rentalRequestId: z.uuid("Invalid rental request id"),
  redirectUrl: z.string().trim().min(1, "redirectUrl cannot be empty").optional(),
});

export const getPaymentsQuerySchema = z.object({
  status: z.enum(PaymentStatus).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
