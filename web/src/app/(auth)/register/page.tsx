import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/features/auth";
import { SectionHeading } from "@/shared/ui";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <>
      <SectionHeading
        index="02"
        title="Create account"
        description="Register as a tenant or a landlord. Administrator accounts are issued by Rentora and cannot be created here."
      />

      <RegisterForm />

      <p className="mt-6 text-meta text-ink-muted">
        Already registered?{" "}
        <Link
          href="/login"
          className="text-ink underline decoration-rule-strong underline-offset-4 transition-colors hover:text-signal hover:decoration-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          Sign in
        </Link>
        .
      </p>
    </>
  );
}
