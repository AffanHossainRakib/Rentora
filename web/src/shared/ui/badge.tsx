import { cn } from "@/shared/lib/cn";
import type { Tone } from "@/shared/lib/status";

const TONE: Record<Tone, string> = {
  neutral: "text-ink-muted border-rule-strong",
  accent: "text-signal border-signal/45",
  positive: "text-positive border-positive/45",
  warning: "text-warning border-warning/50",
  critical: "text-critical border-critical/45",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center border px-2 text-micro font-medium uppercase tracking-label",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** A 6px square used as a status dot in dense rows. */
export function Dot({ tone = "neutral" }: { tone?: Tone }) {
  const fill: Record<Tone, string> = {
    neutral: "bg-ink-faint",
    accent: "bg-signal",
    positive: "bg-positive",
    warning: "bg-warning",
    critical: "bg-critical",
  };
  return <span className={cn("size-1.5 shrink-0", fill[tone])} aria-hidden />;
}
