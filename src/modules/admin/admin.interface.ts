import { z } from "zod";
import {
  getUsersQuerySchema,
  paginationQuerySchema,
  updateUserStatusSchema,
} from "./admin.validation";

export type UpdateUserStatusPayload = z.infer<typeof updateUserStatusSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
