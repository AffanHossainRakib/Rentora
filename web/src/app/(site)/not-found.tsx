import { ButtonLink } from "@/shared/ui";

export default function SiteNotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-shell flex-col justify-center px-gutter py-24">
      <p className="font-mono text-micro uppercase tracking-label text-signal">
        Error 404
      </p>
      <h1 className="mt-6 max-w-[16ch] text-h1 sm:text-display">
        This listing is gone.
      </h1>
      <p className="mt-7 max-w-prose text-lead text-ink-muted">
        It was either withdrawn by the landlord or the address is wrong. The rest
        of the listings are still there.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/properties" size="lg">
          Browse listings
        </ButtonLink>
        <ButtonLink href="/" size="lg" variant="outline">
          Back to home
        </ButtonLink>
      </div>
    </div>
  );
}
