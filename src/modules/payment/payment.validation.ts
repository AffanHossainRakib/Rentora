import { z } from "zod";
import { PaymentStatus } from "../../../prisma/generated/prisma/enums";

export const createPaymentSchema = z.object({
  rentalRequestId: z.uuid("Invalid rental request id"),
});

export const getPaymentsQuerySchema = z.object({
  status: z.enum(PaymentStatus).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
