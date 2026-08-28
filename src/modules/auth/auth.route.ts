import { Router } from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { loginUserSchema } from "./auth.validation";

const router = Router();

router.post(
  "/login",
  validateRequest({ body: loginUserSchema }),
  authController.loginUser,
);

export const authRoutes = router;
