import { Router } from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { registerUserSchema, loginUserSchema } from "./auth.validation";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();

router.post(
  "/register",
  validateRequest({ body: registerUserSchema }),
  authController.registerUser,
);

router.post(
  "/login",
  validateRequest({ body: loginUserSchema }),
  authController.loginUser,
);

router.get(
  "/me",
  auth(Role.ADMIN, Role.LANDLORD, Role.TENANT),
  authController.getCurrentUser,
);

export const authRoutes = router;
