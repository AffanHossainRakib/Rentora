import { z } from "zod";
import { loginUserSchema } from "./auth.validation";

export type loginUserPayload = z.infer<typeof loginUserSchema>;
