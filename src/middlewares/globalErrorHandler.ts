import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import { Prisma } from "../../prisma/generated/prisma/client";
import { AppError } from "../errors/AppError";
import config from "../config";

const isProduction = config.node_env === "production";
// const isProduction = true;

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("Error : ", err);

  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let errorMessage = err.message || "Internal Server Error";
  let errorName = err.name || "Error";
  let errorDetails: unknown = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorName = err.name;
  } else if (err instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    errorName = "ValidationError";
    errorMessage = err.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    errorDetails = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    errorMessage = "You have provided incorrect field type or missing fields";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Duplicate Key Error";
    } else if (err.code === "P2003") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Foreign key constraint failed";
    } else if (err.code === "P2025") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage =
        "An operation failed because it depends on one or more records that were required but not found.";
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = httpStatus.UNAUTHORIZED;
      errorMessage =
        "Authentication failed against database server. Please Check Your Credentials";
    } else if (err.errorCode === "P1001") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Can't reach database server";
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    errorMessage = "Error occurred during query execution";
  }

  if (!isProduction && errorDetails === null) {
    errorDetails = { name: errorName, stack: err.stack };
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: errorMessage,
    errorDetails,
  });
};
