import z from "zod";
import { createCategorySchema } from "./category.validation";

export type CreateCategoryPayload = z.infer<typeof createCategorySchema>;
