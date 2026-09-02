import type { Metadata } from "next";
import { RoleFilter, UserTable } from "@/features/admin";
import { listUsers } from "@/features/admin/server";
import { Pagination, Panel, SectionHeading } from "@/shared/ui";
import type { ApiMeta, Role, User } from "@/shared/types";

export const metadata: Metadata = { title: "Users" };

const ROLES: Role[] = ["TENANT", "LANDLORD", "ADMIN"];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; page?: string }>;
}) {
  const { role: rawRole, page: rawPage } = await searchParams;
  const role = ROLES.find((candidate) => candidate === rawRole);
  const page = Math.max(1, Number(rawPage) || 1);

  let users: User[] = [];
  let meta: ApiMeta | null = null;
  let error: string | null = null;

  try {
    const result = await listUsers({ role, page });
    users = result.users;
    meta = result.meta;
  } catch (cause) {
    error = cause instanceof Error ? cause.message : "The API did not respond.";
  }

  function hrefFor(next: number) {
    const params = new URLSearchParams();
    if (role) params.set("role", role);
    if (next > 1) params.set("page", String(next));
    return `/admin/users${params.size ? `?${params}` : ""}`;
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        index="02"
        title="Users"
        description="Every account on Rentora. Deactivating one leaves its data intact but refuses all of its API calls until it is restored."
        action={
          meta ? (
            <p className="text-micro uppercase tracking-label text-ink-faint">
              <span className="font-mono tabular-nums text-ink">
                {String(meta.total).padStart(2, "0")}
              </span>{" "}
              accounts
            </p>
          ) : null
        }
      />

      {error ? (
        <Panel className="px-5 py-6">
          <p className="text-micro uppercase tracking-label text-critical">
            Data unavailable
          </p>
          <p className="mt-2 max-w-prose text-meta text-ink-muted">{error}</p>
        </Panel>
      ) : (
        <>
          <RoleFilter />
          <UserTable users={users} />
          {meta && (
            <Pagination
              page={meta.page}
              totalPage={meta.totalPage}
              total={meta.total}
              hrefFor={hrefFor}
            />
          )}
        </>
      )}
    </div>
  );
}
