"use client";

import { useActionState, useId } from "react";
import { createReviewAction } from "../model/actions";
import { Button, Field, TextArea } from "@/shared/ui";

const RATINGS = [5, 4, 3, 2, 1] as const;

export function ReviewForm({ rentalRequestId }: { rentalRequestId: string }) {
  const [state, formAction, pending] = useActionState(createReviewAction, null);
  const ratingErrorId = useId();

  const fieldErrors = state && !state.ok ? state.fieldErrors : {};
  const ratingError = fieldErrors.rating;
  const done = state?.ok === true;
  // The summary only adds noise when a field already carries the message.
  const summary =
    state && !state.ok && Object.keys(state.fieldErrors).length === 0
      ? state.message
      : null;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="rentalRequestId" value={rentalRequestId} />

      <fieldset
        disabled={pending || done}
        aria-describedby={ratingError ? ratingErrorId : undefined}
        className="flex flex-col gap-2"
      >
        <legend className="text-micro font-medium uppercase tracking-label text-ink-muted">
          Rating
          <span className="ml-1 text-critical">*</span>
        </legend>

        {/*
          Reversed source order lets a checked input fill every *following*
          sibling, which after the reverse are the lower ratings — the whole
          scale up to the choice, with no JavaScript.
        */}
        <div className="flex w-fit flex-row-reverse gap-1">
          {RATINGS.map((value) => (
            <input
              key={value}
              type="radio"
              name="rating"
              value={value}
              required
              aria-label={`${value} out of 5`}
              className={
                "peer size-9 shrink-0 appearance-none border border-rule-strong " +
                "transition-colors duration-150 " +
                "hover:border-signal hover:bg-signal peer-hover:border-signal peer-hover:bg-signal " +
                "checked:border-signal checked:bg-signal peer-checked:border-signal peer-checked:bg-signal " +
                "disabled:opacity-60 " +
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              }
            />
          ))}
        </div>

        <p className="text-micro text-ink-faint">
          One square is poor, five is excellent.
        </p>

        {ratingError && (
          <p id={ratingErrorId} role="alert" className="text-micro text-critical">
            {ratingError}
          </p>
        )}
      </fieldset>

      <Field label="Your review" error={fieldErrors.review} required>
        {(props) => (
          <TextArea
            {...props}
            name="review"
            required
            rows={5}
            disabled={pending || done}
            placeholder="How was the property, the landlord, the neighbourhood?"
          />
        )}
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending || done}>
          {pending ? "Submitting…" : "Submit review"}
        </Button>

        <p role="status" className="text-meta text-positive">
          {done ? "Review published. Thank you." : null}
        </p>
      </div>

      <p role="alert" className="text-meta text-critical">
        {summary}
      </p>
    </form>
  );
}
