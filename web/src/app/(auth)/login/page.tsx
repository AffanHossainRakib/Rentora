import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth";
import { SectionHeading } from "@/shared/ui";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const { registered } = await searchParams;

  return (
    <>
      <SectionHeading
        index="01"
        title="Sign in"
        description="Rentora signs you in with an httpOnly session cookie and sends you to the workspace for your role."
      />

      {registered && (
        <div
          role="status"
          className="mt-8 border border-positive/45 bg-surface px-4 py-3"
        >
          <p className="flex items-center gap-2 text-micro uppercase tracking-label text-positive">
            <span aria-hidden className="size-1.5 bg-positive" />
            Account created
          </p>
          <p className="mt-1.5 text-meta text-ink">Sign in to continue.</p>
        </div>
      )}

      <LoginForm />

      <p className="mt-6 text-meta text-ink-muted">
        No account yet?{" "}
        <Link
          href="/register"
          className="text-ink underline decoration-rule-strong underline-offset-4 transition-colors hover:text-signal hover:decoration-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          Create one
        </Link>
        .
      </p>

    </>
  );
}
