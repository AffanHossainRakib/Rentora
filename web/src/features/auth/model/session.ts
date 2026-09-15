import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import type { Role } from "@/shared/types";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AccessClaims extends SessionUser {
  exp?: number;
}

const ROLES: Role[] = ["TENANT", "LANDLORD", "ADMIN"];

function decodeClaims(token: string): AccessClaims | null {
  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    const json = Buffer.from(
      payload.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf8");
    const claims = JSON.parse(json) as Partial<AccessClaims>;

    if (
      typeof claims.id !== "string" ||
      typeof claims.email !== "string" ||
      typeof claims.role !== "string" ||
      !ROLES.includes(claims.role as Role)
    ) {
      return null;
    }

    return {
      id: claims.id,
      name: typeof claims.name === "string" ? claims.name : claims.email,
      email: claims.email,
      role: claims.role as Role,
      exp: typeof claims.exp === "number" ? claims.exp : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Signed-in identity read straight from the access-token cookie — no network.
 *
 * Claims are deliberately NOT verified here: this only picks which shell to
 * render. Every data request still carries the cookie to the API, which
 * verifies the signature and enforces the role, so a forged token buys you a
 * dashboard whose every request then fails.
 */
export const readSession = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get("accessToken")?.value;
  if (!token) return null;

  const claims = decodeClaims(token);
  if (!claims) return null;

  // A stale token must not render a signed-in shell.
  if (claims.exp && claims.exp * 1000 <= Date.now()) return null;

  const { exp: _exp, ...user } = claims;
  return user;
});
