import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { propertyService } from "./property.service";
import { GetPropertiesQuery } from "./property.interface";

const getAllProperties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { properties, meta } = await propertyService.getAllProperties(
      req.validatedQuery as GetPropertiesQuery,
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

const getPropertyById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const property = await propertyService.getPropertyById(
      req.params.id as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Property fetched successfully.",
      data: { property },
    });
  },
);

const createProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const property = await propertyService.createProperty(
      req.user?.id as string,
      req.body,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Property created successfully.",
      data: { property },
    });
  },
);

const updateProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const property = await propertyService.updateProperty(
      req.user?.id as string,
      req.params.id as string,
      req.body,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Property updated successfully.",
      data: { property },
    });
  },
);

const deleteProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await propertyService.deleteProperty(
      req.user?.id as string,
      req.params.id as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Property removed successfully.",
      data: null,
    });
  },
);

export const propertyController = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
};
