"use server";

import { revalidatePath } from "next/cache";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { serverRequest } from "@/shared/api/server";
import { fail, ok, type ActionResult } from "@/shared/api/action-result";
import type { User } from "@/shared/types";

export async function setUserActiveAction(
  id: string,
  isActive: boolean,
): Promise<ActionResult<User>> {
  try {
    const { data } = await serverRequest<{ user: User }>(
      ENDPOINTS.admin.user(id),
      { method: "PATCH", body: { isActive } },
    );
    revalidatePath("/admin/users");
    return ok(data.user);
  } catch (error) {
    return fail(error);
  }
}
