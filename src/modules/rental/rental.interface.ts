import { z } from "zod";
import {
  createRentalRequestSchema,
  getRentalRequestsQuerySchema,
  updateRentalRequestStatusSchema,
} from "./rental.validation";

export type CreateRentalRequestPayload = z.infer<
  typeof createRentalRequestSchema
>;
export type UpdateRentalRequestStatusPayload = z.infer<
  ReturnType<typeof updateRentalRequestStatusSchema>
>;
export type GetRentalRequestsQuery = z.infer<
  typeof getRentalRequestsQuerySchema
>;
