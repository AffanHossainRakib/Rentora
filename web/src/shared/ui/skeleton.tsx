import { cn } from "@/shared/lib/cn";

export function Bar({ className }: { className?: string }) {
  return <div aria-hidden className={cn("h-3 bg-ink/[0.07]", className)} />;
}

/**
 * Generic dashboard placeholder. The visual bars are hidden from assistive
 * tech; the live region is what actually announces the wait.
 */
export function PageSkeleton({
  label = "Loading…",
  rows = 6,
  stats = true,
}: {
  label?: string;
  rows?: number;
  stats?: boolean;
}) {
  return (
    <div className="flex flex-col gap-8">
      <p role="status" className="sr-only">
        {label}
      </p>

      <div aria-hidden className="border-b border-ink pb-3">
        <Bar className="h-2.5 w-16" />
        <Bar className="mt-4 h-7 w-64" />
        <Bar className="mt-4 w-full max-w-prose" />
      </div>

      {stats && (
        <div aria-hidden className="grid grid-cols-2 border-t border-l border-rule md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-r border-b border-rule px-5 py-5">
              <Bar className="h-2.5 w-20" />
              <Bar className="mt-3 h-7 w-16" />
            </div>
          ))}
        </div>
      )}

      <div aria-hidden className="border border-rule bg-surface">
        <div className="border-b border-rule px-5 py-4">
          <Bar className="h-3.5 w-40" />
        </div>
        <div className="divide-y divide-rule">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3">
              <Bar className="h-2.5 w-6 shrink-0" />
              <Bar className="w-1/3" />
              <Bar className="ml-auto h-2.5 w-24" />
              <Bar className="h-2.5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
