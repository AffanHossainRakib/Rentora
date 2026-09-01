import { Router } from "express";
import { categoryController } from "./category.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createCategorySchema } from "./category.validation";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();

router.get("/", categoryController.getAllCategories);

router.post(
  "/",
  auth(Role.ADMIN),
  validateRequest({ body: createCategorySchema }),
  categoryController.createCategory,
);

export const categoryRoutes = router;
