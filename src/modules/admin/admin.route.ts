import { Router } from "express";
import { adminController } from "./admin.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  getUsersQuerySchema,
  paginationQuerySchema,
  updateUserStatusSchema,
} from "./admin.validation";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();

router.use(auth(Role.ADMIN));

router.get(
  "/users",
  validateRequest({ query: getUsersQuerySchema }),
  adminController.getAllUsers,
);

router.patch(
  "/users/:id",
  validateRequest({ body: updateUserStatusSchema }),
  adminController.updateUserStatus,
);

router.get(
  "/properties",
  validateRequest({ query: paginationQuerySchema }),
  adminController.getAllProperties,
);

router.get(
  "/rentals",
  validateRequest({ query: paginationQuerySchema }),
  adminController.getAllRentalRequests,
);

export const adminRoutes = router;
