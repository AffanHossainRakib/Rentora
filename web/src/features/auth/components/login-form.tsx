"use client";

import { useActionState } from "react";
import { Button, Field, TextInput } from "@/shared/ui";
/*
 * Reached through the slice's model, not the `@/features/auth` barrel: the
 * barrel re-exports this component, so importing it back would close a cycle
 * across the client boundary.
 */
import { loginAction } from "../model/actions";

export function LoginForm() {
  const [result, formAction, isPending] = useActionState(loginAction, null);
  const failure = result && !result.ok ? result : null;

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      {failure && (
        <div
          role="alert"
          className="border border-critical/45 bg-surface px-4 py-3"
        >
          <p className="flex items-center gap-2 text-micro uppercase tracking-label text-critical">
            <span aria-hidden className="size-1.5 bg-critical" />
            Could not sign in
          </p>
          <p className="mt-1.5 text-meta text-ink">{failure.message}</p>
        </div>
      )}

      <Field label="Email" required error={failure?.fieldErrors.email}>
        {(props) => (
          <TextInput
            {...props}
            name="email"
            type="email"
            autoComplete="username"
            required
            placeholder="you@example.com"
          />
        )}
      </Field>

      <Field label="Password" required error={failure?.fieldErrors.password}>
        {(props) => (
          <TextInput
            {...props}
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        )}
      </Field>

      <Button type="submit" size="lg" disabled={isPending} className="w-full">
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
