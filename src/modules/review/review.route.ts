import { Router } from "express";
import { reviewController } from "./review.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createReviewSchema } from "./review.validation";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();

router.post(
  "/",
  auth(Role.TENANT),
  validateRequest({ body: createReviewSchema }),
  reviewController.createReview,
);

export const reviewRoutes = router;
