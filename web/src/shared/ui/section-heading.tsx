export function SectionHeading({
  index,
  title,
  description,
  action,
}: {
  index: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-3">
      <div className="min-w-0">
        <p className="font-mono text-micro uppercase tracking-label text-ink-faint">
          {index}
        </p>
        <h1 className="mt-1.5 text-h2 text-ink">{title}</h1>
        {description && (
          <p className="mt-2 max-w-prose text-meta text-ink-muted">
            {description}
          </p>
        )}
      </div>
      {action}
    </header>
  );
}
