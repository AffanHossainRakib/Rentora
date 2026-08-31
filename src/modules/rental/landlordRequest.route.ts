import { Router } from "express";
import { rentalController } from "./rental.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  getRentalRequestsQuerySchema,
  updateRentalRequestStatusSchema,
} from "./rental.validation";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();

router.get(
  "/",
  auth(Role.LANDLORD),
  validateRequest({ query: getRentalRequestsQuerySchema }),
  rentalController.getLandlordRequests,
);

router.patch(
  "/:id",
  auth(Role.LANDLORD),
  validateRequest({ body: updateRentalRequestStatusSchema }),
  rentalController.updateRentalRequestStatus,
);

export const landlordRequestRoutes = router;
