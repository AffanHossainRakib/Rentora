import type { Metadata } from "next";
import { PropertyForm } from "@/features/properties";
import { listCategories } from "@/features/properties/server";
import { ButtonLink, Panel, PanelHeader, SectionHeading } from "@/shared/ui";

export const metadata: Metadata = { title: "New listing" };

export default async function NewPropertyPage() {
  let categories: string[] = [];
  let error: string | null = null;

  try {
    categories = await listCategories();
  } catch (cause) {
    error =
      cause instanceof Error
        ? cause.message
        : "The category list could not be loaded.";
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        index="02.1"
        title="New listing"
        description="Published immediately. Tenants can request it as soon as it is marked available."
        action={
          <ButtonLink href="/landlord/properties" variant="outline" size="sm">
            Back to properties
          </ButtonLink>
        }
      />

      {error || categories.length === 0 ? (
        <Panel className="px-5 py-6">
          <p className="text-micro uppercase tracking-label text-critical">
            Categories unavailable
          </p>
          <p role="alert" className="mt-2 max-w-prose text-meta text-ink-muted">
            {error ??
              "No categories exist yet, so a listing cannot be filed under one."}{" "}
            A listing is rejected unless its category matches one the API already
            knows, so the form is hidden until categories load. Try again shortly.
          </p>
        </Panel>
      ) : (
        <Panel>
          <PanelHeader
            index="01"
            title="Listing details"
            description="Fields marked with an asterisk are required by the API."
          />
          <div className="px-5 py-6">
            <PropertyForm mode="create" categories={categories} />
          </div>
        </Panel>
      )}
    </div>
  );
}
