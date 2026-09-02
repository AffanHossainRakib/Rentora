import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/shared/lib/cn";

type Variant = "solid" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  solid:
    "bg-ink text-paper border-ink hover:bg-signal hover:border-signal active:translate-y-px",
  outline:
    "bg-transparent text-ink border-rule-strong hover:border-ink hover:bg-ink/[0.04] active:translate-y-px",
  ghost:
    "bg-transparent text-ink-muted border-transparent hover:text-ink hover:bg-ink/[0.05]",
  danger:
    "bg-transparent text-critical border-critical/40 hover:bg-critical hover:text-paper hover:border-critical",
};

const SIZE: Record<Size, string> = {
  sm: "h-8 px-3 text-micro tracking-label uppercase",
  md: "h-11 px-5 text-meta tracking-label uppercase",
  lg: "h-13 px-7 text-meta tracking-label uppercase",
};

const BASE =
  "inline-flex items-center justify-center gap-2 border font-medium whitespace-nowrap " +
  "transition-[background-color,color,border-color,transform] duration-150 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus " +
  "disabled:pointer-events-none disabled:opacity-40";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "solid",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(BASE, VARIANT[variant], SIZE[size], className)}
      {...props}
    />
  );
}

export interface ButtonLinkProps
  extends React.ComponentPropsWithoutRef<typeof Link> {
  variant?: Variant;
  size?: Size;
}

export function ButtonLink({
  variant = "solid",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(BASE, VARIANT[variant], SIZE[size], className)}
      {...props}
    />
  );
}
