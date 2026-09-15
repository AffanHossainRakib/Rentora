import { cn } from "@/shared/lib/cn";

export function StatGrid({ children }: { children: React.ReactNode }) {
  return (
    <dl className="grid grid-cols-2 border-t border-l border-rule md:grid-cols-4">
      {children}
    </dl>
  );
}

export function Stat({
  label,
  value,
  note,
  className,
}: {
  label: string;
  value: string | number;
  note?: string;
  className?: string;
}) {
  return (
    <div className={cn("border-r border-b border-rule px-5 py-5", className)}>
      <dt className="text-micro uppercase tracking-label text-ink-muted">
        {label}
      </dt>
      <dd className="mt-2 font-mono text-h2 tabular-nums leading-none text-ink">
        {value}
      </dd>
      {note && <p className="mt-2 text-micro text-ink-faint">{note}</p>}
    </div>
  );
}
