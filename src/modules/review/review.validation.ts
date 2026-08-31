import z from "zod";

export const createReviewSchema = z.object({
  rentalRequestId: z.uuid("Invalid rental request id"),
  rating: z.number().int().min(1).max(5),
  review: z.string().trim().min(1, "Review text is required"),
});
