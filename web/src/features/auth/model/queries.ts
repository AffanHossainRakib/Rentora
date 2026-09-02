import { cache } from "react";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { serverRequest } from "@/shared/api/server";
import { ApiError } from "@/shared/api/client";
import type { User } from "@/shared/types";

/**
 * Fresh server-side identity. Prefer `readSession()` for role gating — this
 * costs a network round trip and is only needed when `isActive` or a
 * server-side change matters. Returns null when simply signed out.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  try {
    const { data } = await serverRequest<{ user: User }>(ENDPOINTS.auth.me);
    return data.user;
  } catch (error) {
    if (error instanceof ApiError && [401, 403].includes(error.statusCode)) {
      return null;
    }
    throw error;
  }
});
