import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { rentalService } from "./rental.service";
import { GetRentalRequestsQuery } from "./rental.interface";
import { Role } from "../../../prisma/generated/prisma/enums";

const createRentalRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const rentalRequest = await rentalService.createRentalRequest(
      req.user?.id as string,
      req.body,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Rental request submitted successfully.",
      data: { rentalRequest },
    });
  },
);

const getMyRentalRequests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rentalRequests, meta } = await rentalService.getMyRentalRequests(
      req.user?.id as string,
      req.validatedQuery as GetRentalRequestsQuery,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental requests fetched successfully.",
      data: { rentalRequests },
      meta,
    });
  },
);

const getRentalRequestById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const rentalRequest = await rentalService.getRentalRequestById(
      req.user?.id as string,
      req.user?.role as Role,
      req.params.id as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental request fetched successfully.",
      data: { rentalRequest },
    });
  },
);

const getLandlordRequests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rentalRequests, meta } = await rentalService.getLandlordRequests(
      req.user?.id as string,
      req.validatedQuery as GetRentalRequestsQuery,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental requests fetched successfully.",
      data: { rentalRequests },
      meta,
    });
  },
);

const updateRentalRequestStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const rentalRequest = await rentalService.updateRentalRequestStatus(
      req.user?.id as string,
      req.params.id as string,
      req.body.status,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `Rental request ${rentalRequest.status.toLowerCase()} successfully.`,
      data: { rentalRequest },
    });
  },
);

export const rentalController = {
  createRentalRequest,
  getMyRentalRequests,
  getRentalRequestById,
  getLandlordRequests,
  updateRentalRequestStatus,
};
