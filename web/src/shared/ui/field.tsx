"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/shared/lib/cn";

const CONTROL =
  "w-full border border-rule-strong bg-paper px-3 text-body text-ink " +
  "placeholder:text-ink-faint transition-colors duration-150 " +
  "focus:border-ink focus:outline-2 focus:outline-offset-[-1px] focus:outline-focus " +
  "disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-faint " +
  "aria-[invalid=true]:border-critical";

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: true;
  }) => React.ReactNode;
}

export function Field({
  label,
  hint,
  error,
  required,
  children,
}: FieldShellProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-micro font-medium uppercase tracking-label text-ink-muted"
      >
        {label}
        {required && <span className="ml-1 text-critical">*</span>}
      </label>

      {children({
        id,
        "aria-describedby": describedBy,
        ...(error ? { "aria-invalid": true as const } : {}),
      })}

      {error ? (
        <p id={errorId} role="alert" className="text-micro text-critical">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-micro text-ink-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, "h-11", className)} {...props} />;
}

export function TextArea({
  className,
  rows = 4,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea rows={rows} className={cn(CONTROL, "py-2.5", className)} {...props} />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(CONTROL, "h-11 appearance-none pr-9", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        focusable="false"
        size={16}
        strokeWidth={1.5}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted"
      />
    </div>
  );
}
