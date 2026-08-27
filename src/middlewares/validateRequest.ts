import { ZodType } from "zod";
import { catchAsync } from "../utils/catchAsync";
import { NextFunction, Request, Response } from "express";

export type RequestSchema = {
  body?: ZodType;
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
      req.body = schema.body.parse(req.body);
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
