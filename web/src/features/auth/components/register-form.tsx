"use client";

import { useActionState, useId, useState } from "react";
import { Button, Field, TextArea, TextInput } from "@/shared/ui";
/* See login-form.tsx — importing the barrel here would close a cycle. */
import { registerAction } from "../model/actions";

const MIN_PASSWORD = 8;

/** ADMIN is absent by design — the API rejects self-registration as admin. */
const ROLES = [
  {
    value: "TENANT",
    label: "Tenant",
    description:
      "Search listings, request dates on one, pay the approved rent, and review the stay afterwards.",
  },
  {
    value: "LANDLORD",
    label: "Landlord",
    description:
      "Publish properties and decide on every rental request they attract.",
  },
] as const;

export function RegisterForm() {
  const [result, formAction, isPending] = useActionState(registerAction, null);
  const [password, setPassword] = useState("");
  const roleErrorId = useId();

  const failure = result && !result.ok ? result : null;
  const roleError = failure?.fieldErrors.role;
  const tooShort = password.length > 0 && password.length < MIN_PASSWORD;
  const passwordError =
    failure?.fieldErrors.password ??
    (tooShort ? `Use at least ${MIN_PASSWORD} characters.` : undefined);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      {failure && (
        <div
          role="alert"
          className="border border-critical/45 bg-surface px-4 py-3"
        >
          <p className="flex items-center gap-2 text-micro uppercase tracking-label text-critical">
            <span aria-hidden className="size-1.5 bg-critical" />
            Could not create the account
          </p>
          <p className="mt-1.5 text-meta text-ink">{failure.message}</p>
        </div>
      )}

      <Field label="Full name" required error={failure?.fieldErrors.name}>
        {(props) => (
          <TextInput {...props} name="name" autoComplete="name" required />
        )}
      </Field>

      <Field label="Email" required error={failure?.fieldErrors.email}>
        {(props) => (
          <TextInput
            {...props}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        )}
      </Field>

      <Field
        label="Password"
        required
        hint={`At least ${MIN_PASSWORD} characters`}
        error={passwordError}
      >
        {(props) => (
          <TextInput
            {...props}
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        )}
      </Field>

      <fieldset aria-describedby={roleError ? roleErrorId : undefined}>
        <legend className="text-micro font-medium uppercase tracking-label text-ink-muted">
          Account type
        </legend>

        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {ROLES.map((role) => (
            <label
              key={role.value}
              className="flex cursor-pointer gap-3 border border-rule-strong bg-paper p-4 transition-colors duration-150 hover:border-ink has-checked:border-ink has-checked:bg-surface"
            >
              <input
                type="radio"
                name="role"
                value={role.value}
                defaultChecked={role.value === "TENANT"}
                className="mt-0.5 size-4 shrink-0 accent-signal"
              />
              <span className="min-w-0">
                <span className="block text-meta font-medium text-ink">
                  {role.label}
                </span>
                <span className="mt-1.5 block text-micro text-ink-muted">
                  {role.description}
                </span>
              </span>
            </label>
          ))}
        </div>

        {roleError && (
          <p
            id={roleErrorId}
            role="alert"
            className="mt-1.5 text-micro text-critical"
          >
            {roleError}
          </p>
        )}
      </fieldset>

      <Field
        label="Short bio"
        hint="Optional. Shown on your Rentora profile."
        error={failure?.fieldErrors.bio}
      >
        {(props) => <TextArea {...props} name="bio" rows={3} />}
      </Field>

      <Button type="submit" size="lg" disabled={isPending} className="w-full">
        {isPending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
