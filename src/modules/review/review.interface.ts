import z from "zod";
import { createReviewSchema } from "./review.validation";

export type CreateReviewPayload = z.infer<typeof createReviewSchema>;
