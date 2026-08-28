import { Router } from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { registerUserSchema, loginUserSchema } from "./auth.validation";

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

export const authRoutes = router;
