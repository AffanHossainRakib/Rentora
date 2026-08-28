import { Router } from "express";
import { propertyController } from "./property.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createPropertySchema,
  updatePropertySchema,
} from "./property.validation";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();

router.post(
  "/",
  auth(Role.LANDLORD),
  validateRequest({ body: createPropertySchema }),
  propertyController.createProperty,
);

router.put(
  "/:id",
  auth(Role.LANDLORD),
  validateRequest({ body: updatePropertySchema }),
  propertyController.updateProperty,
);

router.delete("/:id", auth(Role.LANDLORD), propertyController.deleteProperty);

export const landlordPropertyRoutes = router;
