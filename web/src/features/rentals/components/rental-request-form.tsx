"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createRentalAction } from "../model/actions";
import { Button } from "@/shared/ui";
import { DateRangeField } from "@/shared/ui/date-range-field";
import { formatRent, nightsBetween } from "@/shared/lib/format";
import type { ActionResult } from "@/shared/api/action-result";
import type { RentalRequest } from "@/shared/types";

type RentalState = ActionResult<RentalRequest> | null;

const RANGE_ERROR = "The end date must be after the start date.";

/** Rejects an impossible range in the browser so it never costs a round trip. */
async function submitRental(
  previous: RentalState,
  formData: FormData,
): Promise<ActionResult<RentalRequest>> {
  const start = String(formData.get("startDate") ?? "");
  const end = String(formData.get("endDate") ?? "");

  if (!start || !end || new Date(end) <= new Date(start)) {
    return {
      ok: false,
      message: "Check the tenancy dates.",
      fieldErrors: { endDate: RANGE_ERROR },
    };
  }

  return createRentalAction(previous, formData);
}

export function RentalRequestForm({
  propertyId,
  isAvailable,
  price,
}: {
  propertyId: string;
  isAvailable: boolean;
  price: number;
}) {
  const [state, formAction, isPending] = useActionState<RentalState, FormData>(
    submitRental,
    null,
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const bothDates = Boolean(startDate && endDate);
  const outOfOrder = bothDates && new Date(endDate) <= new Date(startDate);
  const nights = bothDates && !outOfOrder ? nightsBetween(startDate, endDate) : 0;

  const fieldErrors = state && !state.ok ? state.fieldErrors : {};
  const created = state?.ok ? state.data : null;
  const failure =
    state && !state.ok && Object.keys(state.fieldErrors).length === 0
      ? state.message
      : null;

  return (
    <form action={formAction}>
      {!isAvailable && (
        <p className="border-b border-rule bg-paper px-5 py-3 text-meta text-ink-muted">
          This listing is currently let, so it cannot take new requests. Browse{" "}
          <Link
            href="/properties?isAvailable=true"
            className="text-signal underline underline-offset-4"
          >
            available listings
          </Link>{" "}
          instead.
        </p>
      )}

      <fieldset
        disabled={!isAvailable}
        className="flex min-w-0 flex-col gap-4 px-5 py-5"
      >
        <legend className="sr-only">Tenancy dates</legend>
        <input type="hidden" name="propertyId" value={propertyId} />

        <div className="flex flex-col gap-1.5">
          <span className="text-micro font-medium uppercase tracking-label text-ink-muted">
            Tenancy dates <span className="ml-1 text-critical">*</span>
          </span>
          <DateRangeField
            startName="startDate"
            endName="endDate"
            startValue={startDate}
            endValue={endDate}
            disabled={!isAvailable}
            startError={fieldErrors.startDate}
            endError={outOfOrder ? RANGE_ERROR : fieldErrors.endDate}
            onChange={({ start, end }) => {
              setStartDate(start);
              setEndDate(end);
            }}
          />
          {(fieldErrors.startDate || fieldErrors.endDate || outOfOrder) && (
            <p role="alert" className="text-micro text-critical">
              {fieldErrors.startDate ??
                (outOfOrder ? RANGE_ERROR : fieldErrors.endDate)}
            </p>
          )}
        </div>

      </fieldset>

      <dl className="grid grid-cols-2 border-t border-rule">
        <div className="border-r border-rule px-5 py-4">
          <dt className="text-micro uppercase tracking-label text-ink-muted">
            Nights requested
          </dt>
          <dd className="mt-1.5 font-mono text-h4 tabular-nums leading-none text-ink">
            {String(nights).padStart(2, "0")}
          </dd>
        </div>
        <div className="px-5 py-4">
          <dt className="text-micro uppercase tracking-label text-ink-muted">
            Monthly rent
          </dt>
          <dd className="mt-1.5 font-mono text-h4 tabular-nums leading-none text-ink">
            {formatRent(price)}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-4 border-t border-rule px-5 py-5">
        <p className="text-micro text-ink-faint">
          Nights describe the tenancy window only — they are not a multiplier.
          Nothing is charged now; Stripe collects the monthly rent of{" "}
          <span className="font-mono tabular-nums">{formatRent(price)}</span>{" "}
          once the landlord approves the request.
        </p>

        <div role="status" aria-live="polite">
          {created && (
            <p className="border border-positive/45 px-4 py-3 text-meta text-ink">
              Request sent. It sits at{" "}
              <span className="font-mono text-micro uppercase tracking-label">
                Pending
              </span>{" "}
              until the landlord decides — track it in{" "}
              <Link
                href="/tenant/rentals"
                className="text-signal underline underline-offset-4"
              >
                /tenant/rentals
              </Link>
              .
            </p>
          )}
          {failure && (
            <p className="border border-critical/45 px-4 py-3 text-meta text-critical">
              {failure}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" disabled={!isAvailable || isPending}>
          {isPending ? "Sending request…" : "Request tenancy"}
        </Button>
      </div>
    </form>
  );
}
