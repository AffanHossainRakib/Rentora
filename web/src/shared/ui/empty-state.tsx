export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 border border-dashed border-rule-strong px-6 py-16 text-center">
      <p className="text-h4 text-ink">{title}</p>
      {description && (
        <p className="max-w-prose-tight text-meta text-ink-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
