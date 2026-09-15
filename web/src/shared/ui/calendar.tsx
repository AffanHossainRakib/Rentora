"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/cn";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const monthLabel = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
});
const fullDate = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export type Iso = string;

export function toIso(date: Date): Iso {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function fromIso(value: Iso | undefined): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Monday-first offset for the 1st of the month. */
function leadingBlanks(year: number, month: number): number {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

export interface CalendarProps {
  /** Selected day, or the range start when `rangeEnd` is also given. */
  value?: Iso;
  rangeEnd?: Iso;
  onSelect: (iso: Iso) => void;
  min?: Iso;
  max?: Iso;
  /** Labels the grid for screen readers. */
  label: string;
  className?: string;
}

/**
 * Date grid following the APG grid pattern: one tab stop, arrows move a roving
 * focus, and the focused cell is the only one in the tab order. Selection is
 * announced through `aria-selected` plus a live region for month changes.
 */
export function Calendar({
  value,
  rangeEnd,
  onSelect,
  min,
  max,
  label,
  className,
}: CalendarProps) {
  const selected = fromIso(value);
  const end = fromIso(rangeEnd);
  const minDate = fromIso(min);
  const maxDate = fromIso(max);

  const [cursor, setCursor] = useState<Date>(
    () => selected ?? minDate ?? startOfDay(new Date()),
  );
  const [focusedDay, setFocusedDay] = useState<Date>(
    () => selected ?? minDate ?? startOfDay(new Date()),
  );
  const gridRef = useRef<HTMLDivElement>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const today = startOfDay(new Date());

  const days = useMemo(() => {
    const count = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: count }, (_, i) => new Date(year, month, i + 1));
  }, [year, month]);

  const blanks = leadingBlanks(year, month);

  function disabled(day: Date): boolean {
    if (minDate && day < minDate) return true;
    if (maxDate && day > maxDate) return true;
    return false;
  }

  function moveFocus(next: Date) {
    setFocusedDay(next);
    if (next.getMonth() !== month || next.getFullYear() !== year) {
      setCursor(new Date(next.getFullYear(), next.getMonth(), 1));
    }
    requestAnimationFrame(() => {
      gridRef.current
        ?.querySelector<HTMLButtonElement>(`[data-day="${toIso(next)}"]`)
        ?.focus();
    });
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };

    if (event.key in moves) {
      event.preventDefault();
      moveFocus(addDays(focusedDay, moves[event.key]));
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      moveFocus(addDays(focusedDay, -((focusedDay.getDay() + 6) % 7)));
    } else if (event.key === "End") {
      event.preventDefault();
      moveFocus(addDays(focusedDay, 6 - ((focusedDay.getDay() + 6) % 7)));
    } else if (event.key === "PageUp") {
      event.preventDefault();
      moveFocus(new Date(year, month - 1, focusedDay.getDate()));
    } else if (event.key === "PageDown") {
      event.preventDefault();
      moveFocus(new Date(year, month + 1, focusedDay.getDate()));
    }
  }

  function shiftMonth(delta: number) {
    setCursor(new Date(year, month + delta, 1));
  }

  return (
    <div className={cn("border border-rule-strong bg-surface", className)}>
      <div className="flex items-center justify-between border-b border-rule px-2 py-2">
        <NavButton label="Previous month" onClick={() => shiftMonth(-1)}>
          <ChevronLeft aria-hidden focusable="false" size={16} strokeWidth={1.5} />
        </NavButton>

        <p aria-live="polite" className="text-meta font-medium text-ink">
          {monthLabel.format(cursor)}
        </p>

        <NavButton label="Next month" onClick={() => shiftMonth(1)}>
          <ChevronRight aria-hidden focusable="false" size={16} strokeWidth={1.5} />
        </NavButton>
      </div>

      <div className="grid grid-cols-7 border-b border-rule">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            aria-hidden
            className="py-2 text-center text-micro uppercase tracking-label text-ink-faint"
          >
            {day}
          </span>
        ))}
      </div>

      <div
        ref={gridRef}
        role="grid"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="grid grid-cols-7"
      >
        {Array.from({ length: blanks }, (_, i) => (
          <span key={`blank-${i}`} role="presentation" className="h-9" />
        ))}

        {days.map((day) => {
          const iso = toIso(day);
          const isDisabled = disabled(day);
          const isStart = selected && iso === toIso(selected);
          const isEnd = end && iso === toIso(end);
          const inRange =
            selected && end && day > selected && day < end && !isDisabled;
          const isToday = iso === toIso(today);
          const isFocusTarget = iso === toIso(focusedDay);

          return (
            <button
              key={iso}
              type="button"
              role="gridcell"
              data-day={iso}
              tabIndex={isFocusTarget ? 0 : -1}
              disabled={isDisabled}
              aria-selected={Boolean(isStart || isEnd)}
              aria-current={isToday ? "date" : undefined}
              aria-label={fullDate.format(day)}
              onClick={() => {
                setFocusedDay(day);
                onSelect(iso);
              }}
              className={cn(
                "relative h-9 font-mono text-meta tabular-nums transition-colors duration-100",
                "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus",
                isDisabled && "cursor-not-allowed text-ink-faint/50",
                !isDisabled && "text-ink hover:bg-ink/[0.06]",
                inRange && "bg-signal/12",
                (isStart || isEnd) && "bg-ink text-paper hover:bg-ink",
              )}
            >
              {day.getDate()}
              {isToday && !isStart && !isEnd && (
                <span
                  aria-hidden
                  className="absolute inset-x-3 bottom-1.5 h-px bg-signal"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-8 items-center justify-center text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus"
    >
      {children}
    </button>
  );
}
