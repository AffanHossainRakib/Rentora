export function ErrorPanel({
  title = "Could not reach the server",
  message,
  hint = "Check that the Rentora API is running and NEXT_PUBLIC_API_BASE_URL points at it.",
}: {
  title?: string;
  message?: string;
  hint?: string;
}) {
  return (
    <div role="alert" className="border border-critical/45 bg-surface px-5 py-4">
      <p className="flex items-center gap-2 text-micro uppercase tracking-label text-critical">
        <span aria-hidden className="size-1.5 bg-critical" />
        {title}
      </p>
      {message && <p className="mt-2 text-meta text-ink">{message}</p>}
      <p className="mt-1 max-w-prose text-micro text-ink-faint">{hint}</p>
    </div>
  );
}
