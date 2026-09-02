import type { ThHTMLAttributes, TdHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export function Table({
  caption,
  children,
  className,
}: {
  caption: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    // A dense table legitimately scrolls sideways, but a scroll container that
    // is not focusable strands keyboard users (WCAG 2.1.1), so it takes a tab
    // stop and an accessible name of its own.
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className="w-full overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      <table className={cn("w-full min-w-[44rem] border-collapse", className)}>
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b-2 border-ink">
      <tr>{children}</tr>
    </thead>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TR({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={cn(
        "border-b border-rule transition-colors duration-100 hover:bg-ink/[0.035]",
        className,
      )}
    >
      {children}
    </tr>
  );
}

type Align = "left" | "right";

export function TH({
  children,
  align = "left",
  numeric,
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & {
  align?: Align;
  numeric?: boolean;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "h-9 px-3 text-micro font-medium uppercase tracking-label text-ink-faint",
        numeric && "whitespace-nowrap",
        align === "right" || numeric ? "text-right" : "text-left",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TD({
  children,
  align = "left",
  numeric,
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & {
  align?: Align;
  numeric?: boolean;
}) {
  return (
    <td
      className={cn(
        "h-9 px-3 py-2 align-middle text-meta text-ink",
        numeric && "whitespace-nowrap tabular-nums",
        align === "right" || numeric ? "text-right" : "text-left",
        className,
      )}
      {...props}
    >
      {children}
    </td>
  );
}
