import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";
import { GetPaymentsQuery } from "./payment.interface";
import { Role } from "../../../prisma/generated/prisma/enums";

const createPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await paymentService.createPayment(
      req.user?.id as string,
      req.body,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Payment session created successfully.",
      data: result,
    });
  },
);

const handleWebhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers["stripe-signature"] as string;

    await paymentService.handleWebhook(req.body as Buffer, signature);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Webhook processed successfully.",
      data: null,
    });
  },
);

const getMyPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { payments, meta } = await paymentService.getMyPayments(
      req.user?.id as string,
      req.validatedQuery as GetPaymentsQuery,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment history fetched successfully.",
      data: { payments },
      meta,
    });
  },
);

const getPaymentById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payment = await paymentService.getPaymentById(
      req.user?.id as string,
      req.user?.role as Role,
      req.params.id as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment fetched successfully.",
      data: { payment },
    });
  },
);

export const paymentController = {
  createPayment,
  handleWebhook,
  getMyPayments,
  getPaymentById,
};
