import z from "zod";
import { loginUserSchema, registerUserSchema } from "./auth.validation";

export type RegisterUserPayload = z.infer<typeof registerUserSchema>;
export type loginUserPayload = z.infer<typeof loginUserSchema>;
