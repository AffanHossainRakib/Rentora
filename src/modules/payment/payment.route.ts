import { Router } from "express";
import { paymentController } from "./payment.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createPaymentSchema,
  getPaymentsQuerySchema,
} from "./payment.validation";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();

router.post(
  "/create",
  auth(Role.TENANT),
  validateRequest({ body: createPaymentSchema }),
  paymentController.createPayment,
);

router.post("/webhook", paymentController.handleWebhook);

router.get(
  "/",
  auth(Role.TENANT),
  validateRequest({ query: getPaymentsQuerySchema }),
  paymentController.getMyPayments,
);

router.get(
  "/:id",
  auth(Role.ADMIN, Role.LANDLORD, Role.TENANT),
  paymentController.getPaymentById,
);

export const paymentRoutes = router;
