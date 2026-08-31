import { z } from "zod";
import { RentalRequestStatus } from "../../../prisma/generated/prisma/enums";

export const createRentalRequestSchema = z
  .object({
    propertyId: z.uuid("Invalid property id"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "endDate must be after startDate",
    path: ["endDate"],
  });

export const updateRentalRequestStatusSchema = z.object({
  status: z.enum([RentalRequestStatus.APPROVED, RentalRequestStatus.REJECTED], {
    error: "Status must be either APPROVED or REJECTED",
  }),
});

export const getRentalRequestsQuerySchema = z.object({
  status: z.enum(RentalRequestStatus).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
