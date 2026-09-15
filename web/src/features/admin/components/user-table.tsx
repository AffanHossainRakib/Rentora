import { Badge, Dot, EmptyState, TBody, TD, TH, THead, TR, Table } from "@/shared/ui";
import type { User } from "@/shared/types";
import { UserBanToggle } from "./user-ban-toggle";

export function UserTable({ users }: { users: User[] }) {
  if (users.length === 0) {
    return (
      <EmptyState
        title="No accounts here"
        description="No user matches this filter. Clear the role filter to see every account on the platform."
      />
    );
  }

  return (
    <Table caption="Every Rentora account, with its role and activation state">
      <THead>
        <TH className="w-12">No.</TH>
        <TH>Account</TH>
        <TH className="w-32">Role</TH>
        <TH className="w-36">Status</TH>
        <TH align="right" className="w-40">
          Action
        </TH>
      </THead>

      <TBody>
        {users.map((user, i) => (
          <TR key={user.id}>
            <TD className="font-mono text-meta tabular-nums text-ink-faint">
              {String(i + 1).padStart(2, "0")}
            </TD>

            <TD>
              <span className="block truncate text-body text-ink">
                {user.name}
              </span>
              <span className="block truncate font-mono text-micro text-ink-faint">
                {user.email}
              </span>
            </TD>

            <TD>
              <Badge tone={user.role === "ADMIN" ? "accent" : "neutral"}>
                {user.role}
              </Badge>
            </TD>

            <TD>
              <span className="flex items-center gap-2 text-meta text-ink-muted">
                <Dot tone={user.isActive ? "positive" : "critical"} />
                {user.isActive ? "Active" : "Deactivated"}
              </span>
            </TD>

            <TD align="right">
              <UserBanToggle
                userId={user.id}
                userName={user.name}
                isActive={user.isActive}
              />
            </TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
