"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/shared/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex min-h-dvh max-w-shell flex-col justify-center px-gutter py-16"
    >
      <p className="font-mono text-micro uppercase tracking-label text-signal">
        Unexpected error
      </p>
      <h1 className="mt-4 text-h1">Something broke on our side.</h1>
      <p className="mt-5 max-w-prose text-body text-ink-muted">
        The request could not be completed. If the API server is not running,
        start it and try again — the interface reads every screen from{" "}
        <code className="font-mono text-meta text-ink">/api/v1</code>.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-micro text-ink-faint">
          Reference {error.digest}
        </p>
      )}
      <div className="mt-8 flex flex-wrap gap-2">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="outline">
          Back to home
        </ButtonLink>
      </div>
    </main>
  );
}
