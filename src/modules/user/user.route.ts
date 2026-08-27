import { Router } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { registerUserSchema } from "./user.validation";

const router = Router();

router.post(
  "/register",
  validateRequest({ body: registerUserSchema }),
  userController.registerUser,
);

export const userRoutes = router;
