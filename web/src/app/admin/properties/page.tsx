import type { Metadata } from "next";
import Link from "next/link";
import { listAllProperties } from "@/features/admin/server";
import {
  Badge,
  EmptyState,
  Pagination,
  Panel,
  SectionHeading,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
} from "@/shared/ui";
import { formatRent } from "@/shared/lib/format";
import type { ApiMeta, Property } from "@/shared/types";

export const metadata: Metadata = { title: "Properties" };

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: rawPage } = await searchParams;
  const page = Math.max(1, Number(rawPage) || 1);

  let properties: Property[] = [];
  let meta: ApiMeta | null = null;
  let error: string | null = null;

  try {
    const result = await listAllProperties({ page });
    properties = result.properties;
    meta = result.meta;
  } catch (cause) {
    error = cause instanceof Error ? cause.message : "The API did not respond.";
  }

  const offset = meta ? (meta.page - 1) * meta.limit : 0;

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        index="03"
        title="Properties"
        description="Every listing on the platform, whoever owns it. Editing and removal stay with the landlord who created the listing."
        action={
          meta ? (
            <p className="text-micro uppercase tracking-label text-ink-faint">
              <span className="font-mono tabular-nums text-ink">
                {String(meta.total).padStart(2, "0")}
              </span>{" "}
              listings
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
      ) : properties.length === 0 ? (
        <EmptyState
          title="No listings yet"
          description="Nothing has been listed on Rentora. Properties appear here the moment a landlord creates one."
        />
      ) : (
        <>
          <Table caption="Every property listed on Rentora, with its owner and rent">
            <THead>
              <TH className="w-12">No.</TH>
              <TH>Listing</TH>
              <TH className="w-56">Landlord</TH>
              <TH className="w-32">Category</TH>
              <TH numeric className="w-32">
                Rent
              </TH>
              <TH className="w-32">Availability</TH>
            </THead>

            <TBody>
              {properties.map((property, i) => (
                <TR key={property.id}>
                  <TD className="font-mono text-meta tabular-nums text-ink-faint">
                    {String(offset + i + 1).padStart(2, "0")}
                  </TD>

                  <TD>
                    <Link
                      href={`/properties/${property.id}`}
                      className="block truncate text-body text-ink transition-colors hover:text-signal"
                    >
                      {property.title}
                    </Link>
                    <span className="block truncate text-micro text-ink-faint">
                      {property.location}
                    </span>
                  </TD>

                  <TD>
                    {property.user ? (
                      <>
                        <span className="block truncate text-meta text-ink">
                          {property.user.name}
                        </span>
                        <span className="block truncate font-mono text-micro text-ink-faint">
                          {property.user.email}
                        </span>
                      </>
                    ) : (
                      // The admin list does not always embed the owner relation.
                      <span className="font-mono text-meta text-ink-faint">
                        #{property.userId.slice(0, 8)}
                      </span>
                    )}
                  </TD>

                  <TD className="text-meta text-ink-muted">
                    {property.category}
                  </TD>

                  <TD numeric className="font-mono">
                    {formatRent(property.price)}
                  </TD>

                  <TD>
                    <Badge tone={property.isAvailable ? "positive" : "neutral"}>
                      {property.isAvailable ? "Available" : "Let"}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>

          {meta && (
            <Pagination
              page={meta.page}
              totalPage={meta.totalPage}
              total={meta.total}
              hrefFor={(next) =>
                next > 1 ? `/admin/properties?page=${next}` : "/admin/properties"
              }
            />
          )}
        </>
      )}
    </div>
  );
}
