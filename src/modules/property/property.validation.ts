import z from "zod";

export const createPropertySchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  isAvailable: z.boolean().default(true),
  location: z.string().trim().min(1, "Location is required"),
  price: z.number().positive("Price must be a positive number"),
  categoryId: z.uuid("Invalid category id"),
  amenities: z.array(z.string()).optional(),
  pictures: z.array(z.string()).optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

export const getPropertiesQuerySchema = z.object({
  searchTerm: z.string().trim().optional(),
  location: z.string().trim().optional(),
  // categoryId: z.uuid("Invalid category id").optional(),
  categoryName: z.string().trim().optional(),
  isAvailable: z.stringbool().optional(),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().nonnegative().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
