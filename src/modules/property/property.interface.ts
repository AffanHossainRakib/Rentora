import z from "zod";
import {
  createPropertySchema,
  getPropertiesQuerySchema,
  updatePropertySchema,
} from "./property.validation";

export type CreatePropertyPayload = z.infer<typeof createPropertySchema>;
export type UpdatePropertyPayload = z.infer<typeof updatePropertySchema>;
export type GetPropertiesQuery = z.infer<typeof getPropertiesQuerySchema>;
