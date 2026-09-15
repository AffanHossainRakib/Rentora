"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  Button,
  ButtonLink,
  Field,
  Select,
  TextArea,
  TextInput,
} from "@/shared/ui";
import type { ActionResult } from "@/shared/api/action-result";
import type { Property } from "@/shared/types";
import { createPropertyAction, updatePropertyAction } from "../model/actions";

type FormState = ActionResult<Property> | null;

export function PropertyForm({
  mode,
  categories,
  property,
}: {
  mode: "create" | "edit";
  categories: string[];
  property?: Property;
}) {
  const action =
    mode === "edit" && property
      ? updatePropertyAction.bind(null, property.id)
      : createPropertyAction;

  const [result, formAction, pending] = useActionState<FormState, FormData>(
    action,
    null,
  );

  const fieldErrors = result && !result.ok ? result.fieldErrors : {};
  const failure = result && !result.ok ? result.message : null;
  const saved = result?.ok ? result.data : null;

  return (
    <form action={formAction} className="grid grid-cols-1 gap-5 sm:grid-cols-6">
      <div role="status" className="empty:hidden sm:col-span-6">
        {saved && (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border border-positive/45 px-4 py-3 text-meta text-ink">
            <span className="text-micro uppercase tracking-label text-positive">
              {mode === "create" ? "Published" : "Saved"}
            </span>
            {mode === "create" ? (
              <>
                <span>“{saved.title}” is now listed.</span>
                <Link
                  href={`/properties/${saved.id}`}
                  className="text-signal underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  View listing
                </Link>
              </>
            ) : (
              <span>Changes to “{saved.title}” are live.</span>
            )}
          </p>
        )}
      </div>

      {failure && (
        <p
          role="alert"
          className="border border-critical/45 px-4 py-3 text-meta text-critical sm:col-span-6"
        >
          {failure}
        </p>
      )}

      <div className="sm:col-span-6">
        <Field label="Title" error={fieldErrors.title} required>
          {(props) => (
            <TextInput
              {...props}
              name="title"
              required
              maxLength={140}
              defaultValue={property?.title ?? ""}
              placeholder="Two-bedroom apartment in Dhanmondi"
            />
          )}
        </Field>
      </div>

      <div className="sm:col-span-6">
        <Field
          label="Description"
          hint="What a tenant should know before requesting."
          error={fieldErrors.description}
        >
          {(props) => (
            <TextArea
              {...props}
              name="description"
              rows={5}
              defaultValue={property?.description ?? ""}
            />
          )}
        </Field>
      </div>

      <div className="sm:col-span-3 lg:col-span-2">
        <Field
          label="Rent ৳ / month"
          hint="Must be greater than zero."
          error={fieldErrors.price}
          required
        >
          {(props) => (
            <TextInput
              {...props}
              name="price"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              required
              defaultValue={property?.price ?? ""}
              className="tabular-nums"
            />
          )}
        </Field>
      </div>

      <div className="sm:col-span-3 lg:col-span-2">
        <Field label="Category" error={fieldErrors.category} required>
          {(props) => (
            <Select
              {...props}
              name="category"
              required
              defaultValue={property?.category ?? ""}
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <div className="sm:col-span-6 lg:col-span-2">
        <Field label="Location" error={fieldErrors.location} required>
          {(props) => (
            <TextInput
              {...props}
              name="location"
              required
              defaultValue={property?.location ?? ""}
              placeholder="Dhanmondi, Dhaka"
            />
          )}
        </Field>
      </div>

      <div className="sm:col-span-6">
        <label className="flex cursor-pointer items-center gap-3 border border-rule-strong px-4 py-3 text-meta text-ink transition-colors hover:border-ink focus-within:outline-2 focus-within:outline-offset-[-2px] focus-within:outline-focus">
          <input
            type="checkbox"
            name="isAvailable"
            defaultChecked={property?.isAvailable ?? true}
            className="size-4 accent-signal"
          />
          <span>
            Available to rent
            <span className="ml-2 text-micro text-ink-faint">
              Unavailable listings stay visible but cannot be requested.
            </span>
          </span>
        </label>
      </div>

      <div className="sm:col-span-6">
        <Field
          label="Amenities"
          hint="One per line."
          error={fieldErrors.amenities}
        >
          {(props) => (
            <TextArea
              {...props}
              name="amenities"
              rows={4}
              defaultValue={property?.amenities.join("\n") ?? ""}
              placeholder={"WiFi\nParking\nLift"}
            />
          )}
        </Field>
      </div>

      <div className="sm:col-span-6">
        <Field
          label="Pictures"
          hint="One image URL per line. The first is used as the cover."
          error={fieldErrors.pictures}
        >
          {(props) => (
            <TextArea
              {...props}
              name="pictures"
              rows={4}
              defaultValue={property?.pictures.join("\n") ?? ""}
              placeholder={"https://images.example.com/front.jpg"}
            />
          )}
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-rule pt-5 sm:col-span-6">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Publish listing"
              : "Save changes"}
        </Button>
        <ButtonLink href="/landlord/properties" variant="ghost">
          Cancel
        </ButtonLink>
      </div>
    </form>
  );
}
