import { Router } from "express";
import { propertyController } from "./property.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { getPropertiesQuerySchema } from "./property.validation";

const router = Router();

router.get(
  "/",
  validateRequest({ query: getPropertiesQuerySchema }),
  propertyController.getAllProperties,
);

router.get("/:id", propertyController.getPropertyById);

export const propertyRoutes = router;
