import { cn } from "@/shared/lib/cn";

const SQUARE = { sm: "size-2", md: "size-2.5" } as const;
const NUMERAL = { sm: "text-micro", md: "text-meta" } as const;

const SLOTS = [1, 2, 3, 4, 5];

export function RatingStars({
  rating,
  size = "sm",
  className,
}: {
  rating: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const clamped = Math.min(5, Math.max(0, rating));
  const filled = Math.round(clamped);
  const numeral = Number.isInteger(clamped)
    ? String(clamped)
    : clamped.toFixed(1);

  return (
    <span
      role="img"
      aria-label={`Rated ${numeral} out of 5`}
      className={cn("inline-flex items-center gap-2", className)}
    >
      <span aria-hidden className="flex items-center gap-1">
        {SLOTS.map((slot) => (
          <span
            key={slot}
            className={cn(
              SQUARE[size],
              slot <= filled ? "bg-signal" : "border border-rule-strong",
            )}
          />
        ))}
      </span>
      <span
        aria-hidden
        className={cn(
          "font-mono tabular-nums leading-none text-ink-muted",
          NUMERAL[size],
        )}
      >
        {numeral}
      </span>
    </span>
  );
}
