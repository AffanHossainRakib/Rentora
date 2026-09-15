import type { Metadata } from "next";
import { UserBanToggle } from "@/features/admin";
import {
  listAllProperties,
  listAllRentals,
  listUsers,
} from "@/features/admin/server";
import { Panel, PanelHeader, SectionHeading, Stat, StatGrid } from "@/shared/ui";
import { RENTAL_STATUSES } from "@/shared/lib/status";
import { cn } from "@/shared/lib/cn";
import type { Property, RentalRequest, RentalStatus, Role, User } from "@/shared/types";

export const metadata: Metadata = { title: "Overview" };

/** How many records of each collection the overview samples. */
const SAMPLE = 100;

const ROLE_ORDER: Role[] = ["TENANT", "LANDLORD", "ADMIN"];

/** Three fills only — the accent, the ink, and the control hairline. */
const BAR_FILL: Record<RentalStatus, string> = {
  PENDING: "bg-rule-strong",
  APPROVED: "bg-signal",
  REJECTED: "bg-signal/35",
  ACTIVE: "bg-ink",
  COMPLETED: "bg-ink/40",
};

interface Snapshot {
  users: User[];
  properties: Property[];
  rentals: RentalRequest[];
  userTotal: number;
  propertyTotal: number;
}

type Load = { ok: true; snapshot: Snapshot } | { ok: false; message: string };

async function loadSnapshot(): Promise<Load> {
  try {
    const [users, properties, rentals] = await Promise.all([
      listUsers({ limit: SAMPLE }),
      listAllProperties({ limit: SAMPLE }),
      listAllRentals({ limit: SAMPLE }),
    ]);

    return {
      ok: true,
      snapshot: {
        users: users.users,
        properties: properties.properties,
        rentals: rentals.rentalRequests,
        userTotal: users.meta?.total ?? users.users.length,
        propertyTotal: properties.meta?.total ?? properties.properties.length,
      },
    };
  } catch (cause) {
    return {
      ok: false,
      message:
        cause instanceof Error
          ? cause.message
          : "The Rentora API did not respond.",
    };
  }
}

export default async function AdminOverviewPage() {
  const load = await loadSnapshot();

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        index="01"
        title="Platform overview"
        description="Accounts, stock and the state of every tenancy on Rentora."
      />

      {load.ok ? <Overview snapshot={load.snapshot} /> : <Unavailable message={load.message} />}
    </div>
  );
}

function Unavailable({ message }: { message: string }) {
  return (
    <Panel className="px-5 py-6">
      <p className="text-micro uppercase tracking-label text-critical">
        Data unavailable
      </p>
      <p className="mt-2 max-w-prose text-meta text-ink-muted">{message}</p>
      <p className="mt-1 max-w-prose text-meta text-ink-faint">
        Nothing has been read from the platform. Reload once the API answers
        again.
      </p>
    </Panel>
  );
}

function Overview({ snapshot }: { snapshot: Snapshot }) {
  const { users, properties, rentals, userTotal, propertyTotal } = snapshot;

  const byRole = ROLE_ORDER.map((role) => ({
    role,
    count: users.filter((user) => user.role === role).length,
  }));

  const roleNote = byRole
    .map(({ role, count }) => `${role} ${String(count).padStart(2, "0")}`)
    .join(" · ");

  const available = properties.filter((property) => property.isAvailable).length;
  const availableShare = properties.length
    ? Math.round((available / properties.length) * 100)
    : 0;

  const active = rentals.filter((rental) => rental.status === "ACTIVE").length;
  const pending = rentals.filter((rental) => rental.status === "PENDING").length;

  const byStatus = RENTAL_STATUSES.map((status) => ({
    status,
    count: rentals.filter((rental) => rental.status === status).length,
  }));
  const deactivated = users.filter((user) => !user.isActive);

  return (
    <>
      <div className="animate-rise">
        <StatGrid>
          {/* `note` is a plain string, so the mono treatment is applied here. */}
          <Stat
            label="Accounts"
            value={userTotal}
            note={roleNote}
            className="[&>p]:font-mono [&>p]:tabular-nums"
          />
          <Stat
            label="Properties"
            value={propertyTotal}
            note="Listed platform-wide"
          />
          <Stat
            label="Available"
            value={available}
            note={`${availableShare}% of the sample is free to let`}
          />
          <Stat
            label="Active tenancies"
            value={active}
            note={`${pending} request${pending === 1 ? "" : "s"} awaiting a decision`}
          />
        </StatGrid>

        <p className="mt-3 max-w-prose text-micro text-ink-faint">
          Account and property totals come from the API&rsquo;s pagination meta.
          Every breakdown below is computed from the first {SAMPLE} records of
          each collection, so it is a sample once the platform grows past that.
        </p>
      </div>

      <Panel className="animate-rise [animation-delay:80ms]">
        <PanelHeader
          index="02"
          title="Platform health"
          description="Every rental request in the sample, by status."
        />
        <div className="px-5 py-5">
          <StatusBar rows={byStatus} total={rentals.length} />
        </div>
      </Panel>

      <Panel className="animate-rise [animation-delay:160ms]">
        <PanelHeader
          index="03"
          title="Deactivated accounts"
          description="A deactivated account is refused with 403 on every request until it is restored."
        />
        {deactivated.length === 0 ? (
          <p className="px-5 py-6 text-meta text-ink-muted">
            No account is deactivated.
          </p>
        ) : (
          <ul className="divide-y divide-rule">
            {deactivated.map((user) => (
              <li
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-body text-ink">{user.name}</p>
                  <p className="truncate font-mono text-micro text-ink-faint">
                    {user.email} · {user.role}
                  </p>
                </div>
                <UserBanToggle
                  userId={user.id}
                  userName={user.name}
                  isActive={false}
                />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}

function StatusBar({
  rows,
  total,
}: {
  rows: Array<{ status: RentalStatus; count: number }>;
  total: number;
}) {
  if (total === 0) {
    return (
      <p className="text-meta text-ink-muted">
        No rental request has been made yet.
      </p>
    );
  }

  return (
    <>
      {/* The legend below is the accessible reading of this bar. */}
      <div aria-hidden className="flex h-8 w-full border border-rule-strong">
        {rows
          .filter((row) => row.count > 0)
          .map((row) => (
            <div
              key={row.status}
              className={BAR_FILL[row.status]}
              style={{ width: `${(row.count / total) * 100}%` }}
            />
          ))}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 sm:grid-cols-3 lg:grid-cols-5">
        {rows.map((row) => (
          <div
            key={row.status}
            className="flex items-center gap-2 border-t border-rule py-2"
          >
            <span
              aria-hidden
              className={cn("size-2 shrink-0", BAR_FILL[row.status])}
            />
            <dt className="text-micro uppercase tracking-label text-ink-muted">
              {row.status}
            </dt>
            <dd className="ml-auto font-mono text-meta tabular-nums text-ink">
              {String(row.count).padStart(2, "0")}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}
