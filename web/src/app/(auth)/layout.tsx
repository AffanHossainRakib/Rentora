import Link from "next/link";
import { SITE } from "@/shared/config/navigation";

/** `aside` is a parallel route slot, so the panel copy can follow the page. */
export default function AuthLayout({
  children,
  aside,
}: {
  children: React.ReactNode;
  aside: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[1fr_0.85fr]">
      <div className="flex min-h-dvh flex-col bg-paper">
        <header className="border-b border-rule px-gutter py-5">
          <Link
            href="/"
            className="inline-flex items-baseline gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            <span className="text-lead font-semibold tracking-tight-lg text-ink">
              {SITE.name}
            </span>
            <span className="font-mono text-micro text-ink-faint">BD</span>
          </Link>
        </header>

        <main
          id="main"
          tabIndex={-1}
          className="flex flex-1 items-start px-gutter py-12 sm:py-16"
        >
          <div className="mx-auto w-full max-w-prose">{children}</div>
        </main>
      </div>

      {aside}
    </div>
  );
}
