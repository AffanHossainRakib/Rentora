import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminService } from "./admin.service";
import { GetUsersQuery, PaginationQuery } from "./admin.interface";

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { users, meta } = await adminService.getAllUsers(
      req.validatedQuery as GetUsersQuery,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Users fetched successfully.",
      data: { users },
      meta,
    });
  },
);

const updateUserStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await adminService.updateUserStatus(
      req.params.id as string,
      req.body.isActive,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `User ${user.isActive ? "unbanned" : "banned"} successfully.`,
      data: { user },
    });
  },
);

const getAllProperties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { properties, meta } = await adminService.getAllProperties(
      req.validatedQuery as PaginationQuery,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Properties fetched successfully.",
      data: { properties },
      meta,
    });
  },
);

const getAllRentalRequests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rentalRequests, meta } = await adminService.getAllRentalRequests(
      req.validatedQuery as PaginationQuery,
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

export const adminController = {
  getAllUsers,
  updateUserStatus,
  getAllProperties,
  getAllRentalRequests,
};
