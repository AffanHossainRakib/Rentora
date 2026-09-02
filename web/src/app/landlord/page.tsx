import type { Metadata } from "next";
import Link from "next/link";
import { readSession } from "@/features/auth/server";
import { listMyProperties } from "@/features/properties/server";
import { RequestTable } from "@/features/rentals";
import { listLandlordRequests } from "@/features/rentals/server";
import {
  ButtonLink,
  Dot,
  EmptyState,
  Panel,
  PanelHeader,
  SectionHeading,
  Stat,
  StatGrid,
} from "@/shared/ui";
import { formatRent } from "@/shared/lib/format";
import type { Property, RentalRequest } from "@/shared/types";

export const metadata: Metadata = { title: "Overview" };

const LISTING_PREVIEW = 6;

export default async function LandlordOverviewPage() {
  const user = await readSession();

  let properties: Property[] = [];
  let requests: RentalRequest[] = [];
  let error: string | null = null;

  if (user) {
    try {
      const [propertyPage, requestPage] = await Promise.all([
        listMyProperties(user.id, { limit: 100 }),
        listLandlordRequests({ limit: 100 }),
      ]);
      properties = propertyPage.properties;
      requests = requestPage.rentalRequests;
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : "Your dashboard data could not be loaded.";
    }
  }

  const pending = requests.filter((request) => request.status === "PENDING");
  const active = requests.filter((request) => request.status === "ACTIVE");
  const available = properties.filter((property) => property.isAvailable);

  if (error) {
    return (
      <div className="flex flex-col gap-8">
        <SectionHeading index="01" title="Overview" />
        <Panel className="px-5 py-6">
          <p className="text-micro uppercase tracking-label text-critical">
            Dashboard unavailable
          </p>
          <p role="alert" className="mt-2 max-w-prose text-meta text-ink-muted">
            {error}
          </p>
        </Panel>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        index="01"
        title="Overview"
        description={
          pending.length > 0
            ? `${pending.length} request${pending.length === 1 ? "" : "s"} waiting on your decision.`
            : "Nothing is waiting on you. Your portfolio at a glance."
        }
        action={
          <ButtonLink href="/landlord/properties/new" size="sm">
            New listing
          </ButtonLink>
        }
      />

      <StatGrid>
        <Stat label="Listings" value={properties.length} />
        <Stat
          label="Available now"
          value={available.length}
          note={`${properties.length - available.length} let`}
        />
        <Stat label="Pending requests" value={pending.length} />
        <Stat label="Active tenancies" value={active.length} />
      </StatGrid>

      <Panel>
        <PanelHeader
          index="01"
          title="Pending decisions"
          description="Approve or reject each request. A request only moves out of PENDING once you decide."
          action={
            <ButtonLink href="/landlord/requests" variant="outline" size="sm">
              All requests
            </ButtonLink>
          }
        />
        {pending.length === 0 ? (
          <p className="px-5 py-8 text-meta text-ink-muted">
            No requests are waiting. New ones land here the moment a tenant
            submits them.
          </p>
        ) : (
          <RequestTable requests={pending} />
        )}
      </Panel>

      {properties.length === 0 ? (
        <EmptyState
          title="No listings yet"
          description="Rentora shows your properties to tenants as soon as you publish one."
          action={
            <ButtonLink href="/landlord/properties/new">
              Create a listing
            </ButtonLink>
          }
        />
      ) : (
        <Panel>
          <PanelHeader
            index="02"
            title="Your listings"
            description={
              properties.length > LISTING_PREVIEW
                ? `${LISTING_PREVIEW} of ${properties.length} shown.`
                : undefined
            }
            action={
              <ButtonLink
                href="/landlord/properties"
                variant="outline"
                size="sm"
              >
                Manage
              </ButtonLink>
            }
          />
          <ul className="divide-y divide-rule">
            {properties.slice(0, LISTING_PREVIEW).map((property, index) => (
              <li
                key={property.id}
                className="flex items-center gap-4 px-5 py-3"
              >
                <span className="font-mono text-micro tabular-nums text-ink-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Dot tone={property.isAvailable ? "positive" : "neutral"} />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/landlord/properties/${property.id}`}
                    className="block truncate text-body text-ink underline-offset-4 hover:text-signal hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  >
                    {property.title}
                  </Link>
                  <p className="truncate text-micro text-ink-faint">
                    {property.location} · {property.category}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-meta tabular-nums text-ink">
                  {formatRent(property.price)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
