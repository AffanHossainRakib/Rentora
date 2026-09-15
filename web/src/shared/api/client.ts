import type { ApiErrorDetail, ApiMeta, ApiSuccess } from "@/shared/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.rentora.itsaffan.com/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly details: ApiErrorDetail[] | null = null,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** Field-keyed map for wiring validation errors back onto inputs. */
  get fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const d of this.details ?? []) out[d.path] ??= d.message;
    return out;
  }
}

type QueryValue = string | number | boolean | null | undefined;
export type Query = Record<string, QueryValue>;

export function searchParams(query: Query = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const serialised = params.toString();
  return serialised ? `?${serialised}` : "";
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string;
  next?: { revalidate?: number | false; tags?: string[] };
}

export async function request<T>(
  path: string,
  { body, token, headers, ...init }: RequestOptions = {},
): Promise<ApiSuccess<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);
  const failed =
    !response.ok || (payload as { success?: boolean } | null)?.success === false;

  if (failed) {
    const error = payload as Partial<{
      message: string;
      errorDetails: ApiErrorDetail[] | null;
    }> | null;

    throw new ApiError(
      error?.message ?? `Request failed with status ${response.status}`,
      response.status,
      Array.isArray(error?.errorDetails) ? error.errorDetails : null,
    );
  }

  return payload as ApiSuccess<T>;
}

export async function requestPage<T>(
  path: string,
  options?: RequestOptions,
): Promise<{ data: T; meta: ApiMeta | null }> {
  const { data, meta } = await request<T>(path, options);
  return { data, meta: meta ?? null };
}
