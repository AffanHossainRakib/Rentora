import { z } from "zod";
import {
  Role,
  RentalRequestStatus,
} from "../../../prisma/generated/prisma/enums";

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

export const updateRentalRequestStatusSchema = (role: Role) => {
  const isAdmin = role === Role.ADMIN;

  return z.object({
    status: z.enum(
      isAdmin
        ? [
            RentalRequestStatus.APPROVED,
            RentalRequestStatus.REJECTED,
            RentalRequestStatus.COMPLETED,
          ]
        : [RentalRequestStatus.APPROVED, RentalRequestStatus.REJECTED],
      {
        error: isAdmin
          ? "Status must be one of APPROVED, REJECTED, or COMPLETED"
          : "Status must be one of APPROVED or REJECTED",
      },
    ),
  });
};

export const getRentalRequestsQuerySchema = z.object({
  status: z.enum(RentalRequestStatus).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
