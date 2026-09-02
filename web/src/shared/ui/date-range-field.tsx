"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Calendar, toIso, type Iso } from "./calendar";
import { cn } from "@/shared/lib/cn";

const display = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function label(iso: Iso | ""): string {
  if (!iso) return "Select";
  const [y, m, d] = iso.split("-").map(Number);
  return display.format(new Date(y, m - 1, d));
}

/**
 * Two-date picker over a single calendar. The values live in hidden inputs so
 * the surrounding form posts normally and Server Action validation is unchanged.
 *
 * Clicking picks the start, then the end; a click before the current start
 * restarts the range rather than producing an invalid one.
 */
export function DateRangeField({
  startName,
  endName,
  startValue,
  endValue,
  onChange,
  min,
  startError,
  endError,
  disabled,
}: {
  startName: string;
  endName: string;
  startValue: string;
  endValue: string;
  onChange: (next: { start: string; end: string }) => void;
  min?: Iso;
  startError?: string;
  endError?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    // Deferred by a frame: attaching synchronously lets the very interaction
    // that opened the panel be seen as an outside click and close it again.
    const attach = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointerDown);
    }, 0);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(attach);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function select(iso: Iso) {
    // No start yet, or the range is already complete → begin a new one.
    if (!startValue || endValue) {
      onChange({ start: iso, end: "" });
      return;
    }
    if (iso <= startValue) {
      onChange({ start: iso, end: "" });
      return;
    }
    onChange({ start: startValue, end: iso });
    setOpen(false);
  }

  const today = toIso(new Date());

  return (
    <div ref={wrapper} className="relative">
      <input type="hidden" name={startName} value={startValue} />
      <input type="hidden" name={endName} value={endValue} />

      <div className="grid grid-cols-2 gap-px bg-rule-strong">
        <Trigger
          label="Start"
          value={label(startValue)}
          invalid={Boolean(startError)}
          disabled={disabled}
          expanded={open}
          controls={panelId}
          onClick={() => setOpen((v) => !v)}
        />
        <Trigger
          label="End"
          value={label(endValue)}
          invalid={Boolean(endError)}
          disabled={disabled}
          expanded={open}
          controls={panelId}
          onClick={() => setOpen((v) => !v)}
        />
      </div>

      {open && !disabled && (
        <div id={panelId} className="absolute left-0 top-[calc(100%+0.5rem)] z-30 w-[19rem]">
          <Calendar
            label="Choose your tenancy dates"
            value={startValue || undefined}
            rangeEnd={endValue || undefined}
            onSelect={select}
            min={min ?? today}
          />
          <p className="border-x border-b border-rule-strong bg-surface px-3 py-2 text-micro text-ink-faint">
            {startValue && !endValue
              ? "Now pick the end date."
              : "Pick a start date, then an end date."}
          </p>
        </div>
      )}
    </div>
  );
}

function Trigger({
  label,
  value,
  invalid,
  disabled,
  expanded,
  controls,
  onClick,
}: {
  label: string;
  value: string;
  invalid?: boolean;
  disabled?: boolean;
  expanded: boolean;
  controls: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-expanded={expanded}
      aria-controls={controls}
      {...(invalid ? { "aria-invalid": true } : {})}
      className={cn(
        "flex h-14 flex-col items-start justify-center gap-0.5 bg-paper px-3 text-left transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus",
        "disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-faint",
        invalid && "bg-critical/[0.06]",
      )}
    >
      <span className="text-micro uppercase tracking-label text-ink-faint">
        {label}
      </span>
      <span className="flex items-center gap-2 text-meta text-ink">
        <CalendarDays aria-hidden focusable="false" size={14} strokeWidth={1.75} />
        {value}
      </span>
    </button>
  );
}
