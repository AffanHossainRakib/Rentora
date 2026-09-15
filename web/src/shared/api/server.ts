import "server-only";

import { cookies } from "next/headers";
import { request, type RequestOptions } from "./client";
import type { ApiMeta, ApiSuccess } from "@/shared/types";

/**
 * Forwards the browser's cookie header, which `credentials: "include"` cannot
 * do from a Server Component.
 */
export async function serverRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiSuccess<T>> {
  const cookieHeader = (await cookies()).toString();

  return request<T>(path, {
    cache: "no-store",
    ...options,
    headers: {
      ...(cookieHeader && { cookie: cookieHeader }),
      ...options.headers,
    },
  });
}

export async function serverRequestPage<T>(
  path: string,
  options?: RequestOptions,
): Promise<{ data: T; meta: ApiMeta | null }> {
  const { data, meta } = await serverRequest<T>(path, options);
  return { data, meta: meta ?? null };
}

/** Public endpoints are safe to cache briefly — listings are not per-user. */
export async function publicRequest<T>(
  path: string,
  revalidate = 60,
): Promise<ApiSuccess<T>> {
  return request<T>(path, { next: { revalidate } });
}
