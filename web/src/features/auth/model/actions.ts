"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE_URL, ApiError } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { serverRequest } from "@/shared/api/server";
import { fail, type ActionResult } from "@/shared/api/action-result";
import { ROLE_HOME } from "@/shared/config/navigation";
import type { ApiErrorDetail, Role, User } from "@/shared/types";

/**
 * Login is the one call that cannot go through the shared transport: the API
 * returns its JWTs as Set-Cookie headers, which have to be copied onto this
 * response before the redirect so the session survives.
 */
export async function loginAction(
  _prev: ActionResult<never> | null,
  formData: FormData,
): Promise<ActionResult<never>> {
  let destination = "/";

  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.auth.login}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        email: String(formData.get("email") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || payload?.success === false) {
      throw new ApiError(
        payload?.message ?? "Unable to sign in.",
        response.status,
        (payload?.errorDetails as ApiErrorDetail[] | null) ?? null,
      );
    }

    await copySessionCookies(response);
    destination = await resolveHome();
  } catch (error) {
    return fail(error);
  }

  redirect(destination);
}

export async function registerAction(
  _prev: ActionResult<never> | null,
  formData: FormData,
): Promise<ActionResult<never>> {
  try {
    await serverRequest<{ user: User }>(ENDPOINTS.auth.register, {
      method: "POST",
      body: {
        name: String(formData.get("name") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
        role: String(formData.get("role") ?? "TENANT") as Exclude<Role, "ADMIN">,
        bio: String(formData.get("bio") ?? "").trim() || undefined,
      },
    });
  } catch (error) {
    return fail(error);
  }

  redirect("/login?registered=1");
}

export async function logoutAction(): Promise<void> {
  const jar = await cookies();
  jar.delete("accessToken");
  jar.delete("refreshToken");
  redirect("/");
}

async function copySessionCookies(response: Response): Promise<void> {
  const jar = await cookies();

  for (const raw of response.headers.getSetCookie()) {
    const [pair] = raw.split(";");
    const separator = pair.indexOf("=");
    if (separator < 1) continue;

    jar.set({
      name: pair.slice(0, separator).trim(),
      value: pair.slice(separator + 1).trim(),
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
  }
}

async function resolveHome(): Promise<string> {
  try {
    const { data } = await serverRequest<{ user: User }>(ENDPOINTS.auth.me);
    return ROLE_HOME[data.user.role];
  } catch {
    return "/";
  }
}
