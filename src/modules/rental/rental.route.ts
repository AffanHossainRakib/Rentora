import { Router } from "express";
import { rentalController } from "./rental.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createRentalRequestSchema,
  getRentalRequestsQuerySchema,
} from "./rental.validation";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();

router.post(
  "/",
  auth(Role.TENANT),
  validateRequest({ body: createRentalRequestSchema }),
  rentalController.createRentalRequest,
);

router.get(
  "/",
  auth(Role.TENANT),
  validateRequest({ query: getRentalRequestsQuerySchema }),
  rentalController.getMyRentalRequests,
);

router.get(
  "/:id",
  auth(Role.ADMIN, Role.LANDLORD, Role.TENANT),
  rentalController.getRentalRequestById,
);

export const rentalRoutes = router;
