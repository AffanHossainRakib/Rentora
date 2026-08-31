import { z } from "zod";
import { Role } from "../../../prisma/generated/prisma/enums";

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const getUsersQuerySchema = z.object({
  role: z.enum(Role).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
