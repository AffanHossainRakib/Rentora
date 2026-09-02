import { ApiError } from "./client";

export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; message: string; fieldErrors: Record<string, string> };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(error: unknown): ActionResult<never> {
  if (error instanceof ApiError) {
    return { ok: false, message: error.message, fieldErrors: error.fieldErrors };
  }
  return {
    ok: false,
    message:
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.",
    fieldErrors: {},
  };
}
