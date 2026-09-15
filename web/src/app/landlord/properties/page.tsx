import type { Metadata } from "next";
import { readSession } from "@/features/auth/server";
import { PropertyRowActions } from "@/features/properties";
import { listMyProperties } from "@/features/properties/server";
import {
  Badge,
  ButtonLink,
  EmptyState,
  Panel,
  SectionHeading,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/shared/ui";
import { formatRent } from "@/shared/lib/format";
import type { Property } from "@/shared/types";

export const metadata: Metadata = { title: "Properties" };

export default async function LandlordPropertiesPage() {
  const user = await readSession();

  let properties: Property[] = [];
  let error: string | null = null;

  if (user) {
    try {
      const page = await listMyProperties(user.id, { limit: 100 });
      properties = page.properties;
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : "Your listings could not be loaded.";
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        index="02"
        title="Properties"
        description="Every listing you have published, with its current availability."
        action={
          <ButtonLink href="/landlord/properties/new" size="sm">
            New listing
          </ButtonLink>
        }
      />

      {error ? (
        <Panel className="px-5 py-6">
          <p className="text-micro uppercase tracking-label text-critical">
            Listings unavailable
          </p>
          <p role="alert" className="mt-2 text-meta text-ink-muted">
            {error}
          </p>
        </Panel>
      ) : properties.length === 0 ? (
        <EmptyState
          title="No listings yet"
          description="Publish your first property and it will appear here, ready for tenant requests."
          action={
            <ButtonLink href="/landlord/properties/new">
              Create a listing
            </ButtonLink>
          }
        />
      ) : (
        <Panel>
          <Table caption="Your published listings">
            <THead>
              <TH className="w-12">#</TH>
              <TH>Listing</TH>
              <TH>Category</TH>
              <TH numeric className="w-36">Rent / mo</TH>
              <TH>Availability</TH>
              <TH align="right">Actions</TH>
            </THead>
            <TBody>
              {properties.map((property, index) => (
                <TR key={property.id}>
                  <TD className="font-mono text-micro tabular-nums text-ink-faint">
                    {String(index + 1).padStart(2, "0")}
                  </TD>

                  <TD>
                    <span className="block truncate text-body text-ink">
                      {property.title}
                    </span>
                    <span className="block truncate text-micro text-ink-faint">
                      {property.location}
                    </span>
                  </TD>

                  <TD className="text-meta text-ink-muted">
                    {property.category}
                  </TD>

                  <TD numeric className="font-mono text-meta">
                    {formatRent(property.price)}
                  </TD>

                  <TD>
                    <Badge tone={property.isAvailable ? "positive" : "neutral"}>
                      {property.isAvailable ? "Available" : "Let"}
                    </Badge>
                  </TD>

                  <TD align="right">
                    <PropertyRowActions
                      propertyId={property.id}
                      propertyTitle={property.title}
                    />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Panel>
      )}
    </div>
  );
}
