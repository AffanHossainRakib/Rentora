const bdt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const longDate = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const shortDate = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
});

export function formatRent(value: number): string {
  return `৳${bdt.format(value)}`;
}

export function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompact(value: number): string {
  return compact.format(value);
}

function parse(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(iso: string | null | undefined): string {
  const date = parse(iso);
  return date ? longDate.format(date) : "—";
}

export function formatDateShort(iso: string | null | undefined): string {
  const date = parse(iso);
  return date ? shortDate.format(date) : "—";
}

export function formatDateRange(start: string, end: string): string {
  return `${formatDateShort(start)} – ${formatDate(end)}`;
}

export function nightsBetween(start: string, end: string): number {
  const from = parse(start);
  const to = parse(end);
  if (!from || !to) return 0;
  return Math.max(0, Math.round((to.getTime() - from.getTime()) / 86_400_000));
}

export function toDateInput(iso: string): string {
  return parse(iso)?.toISOString().slice(0, 10) ?? "";
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
