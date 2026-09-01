import { ZodType } from "zod";
import { catchAsync } from "../utils/catchAsync";
import { NextFunction, Request, Response } from "express";

export type RequestSchema = {
  body?: ZodType | ((req: Request) => ZodType);
  params?: ZodType;
  query?: ZodType;
};

declare global {
  namespace Express {
    interface Request {
      validatedQuery?: Record<string, unknown>;
    }
  }
}

export const validateRequest = (schema: RequestSchema) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (schema?.body) {
      const bodySchema =
        typeof schema.body === "function" ? schema.body(req) : schema.body;
      req.body = bodySchema.parse(req.body);
    }
    if (schema?.params) {
      req.params = schema.params.parse(req.params) as typeof req.params;
    }
    if (schema?.query) {
      req.validatedQuery = schema.query.parse(req.query) as Record<
        string,
        unknown
      >;
    }
    next();
  });
};
