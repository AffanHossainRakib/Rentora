import { z } from "zod";
import { Role } from "../../../prisma/generated/prisma/enums";

export const registerUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().pipe(z.email("Invalid email address")),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z
    .string()
    .trim()
    .toUpperCase()
    .pipe(
      z.enum([Role.TENANT, Role.LANDLORD], {
        error: "Invalid role. Must be one of TENANT, LANDLORD",
      }),
    ),
  bio: z.string().optional(),
  profilePicture: z.string().optional(),
});
