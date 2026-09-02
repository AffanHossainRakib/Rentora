import type { Metadata } from "next";
import { readSession } from "@/features/auth/server";
import { PropertyForm, PropertyRowActions } from "@/features/properties";
import { getProperty, listCategories } from "@/features/properties/server";
import { ButtonLink, Panel, PanelHeader, SectionHeading } from "@/shared/ui";
import type { Property } from "@/shared/types";

export const metadata: Metadata = { title: "Edit listing" };

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await readSession();

  let property: Property | null = null;
  let categories: string[] = [];
  let error: string | null = null;

  try {
    [property, categories] = await Promise.all([
      getProperty(id),
      listCategories(),
    ]);
  } catch (cause) {
    error =
      cause instanceof Error
        ? cause.message
        : "This listing could not be loaded.";
  }

  const owned = Boolean(property && user && property.userId === user.id);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        index="02.2"
        title={property?.title ?? "Edit listing"}
        description={
          property
            ? `${property.location} · ${property.category}`
            : "Update the details tenants see before they request a tenancy."
        }
        action={
          <ButtonLink href="/landlord/properties" variant="outline" size="sm">
            Back to properties
          </ButtonLink>
        }
      />

      {error || !property ? (
        <Panel className="px-5 py-6">
          <p className="text-micro uppercase tracking-label text-critical">
            Listing unavailable
          </p>
          <p role="alert" className="mt-2 max-w-prose text-meta text-ink-muted">
            {error ?? "This listing no longer exists."}
          </p>
        </Panel>
      ) : !owned ? (
        <Panel className="px-5 py-6">
          <p className="text-micro uppercase tracking-label text-critical">
            Not your listing
          </p>
          <p className="mt-2 max-w-prose text-meta text-ink-muted">
            “{property.title}” belongs to another landlord, so it cannot be
            edited or deleted from here. The API rejects the attempt as well.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonLink href="/landlord/properties" size="sm">
              Your properties
            </ButtonLink>
            <ButtonLink
              href={`/properties/${property.id}`}
              variant="outline"
              size="sm"
            >
              View public listing
            </ButtonLink>
          </div>
        </Panel>
      ) : (
        <>
          {categories.length === 0 && (
            <Panel className="px-5 py-6">
              <p className="text-micro uppercase tracking-label text-warning">
                Categories unavailable
              </p>
              <p role="alert" className="mt-2 max-w-prose text-meta text-ink-muted">
                No categories loaded, so the category field has nothing to offer.
                Saving without a valid category name is rejected by the API.
              </p>
            </Panel>
          )}

          <Panel>
            <PanelHeader
              index="01"
              title="Listing details"
              description="Every field is sent on save, so leave the ones you are not changing as they are."
            />
            <div className="px-5 py-6">
              <PropertyForm
                mode="edit"
                property={property}
                categories={categories}
              />
            </div>
          </Panel>

          <Panel className="border-critical/40">
            <PanelHeader
              index="02"
              title="Danger zone"
              description="Deleting is permanent. A listing with a pending, approved or active rental is blocked by the API — the reason is shown in the confirmation dialog."
            />
            <div className="px-5 py-5">
              <PropertyRowActions
                propertyId={property.id}
                propertyTitle={property.title}
                variant="panel"
              />
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
