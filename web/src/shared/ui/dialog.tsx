"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/cn";

/**
 * Wraps the native <dialog>, which supplies the focus trap, Esc handling and
 * background inerting that would otherwise need to be hand-rolled.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[min(34rem,calc(100vw-2rem))] border border-ink bg-paper p-0 text-ink",
        "backdrop:bg-ink/45 backdrop:backdrop-blur-[2px]",
        "open:animate-dialog motion-reduce:open:animate-none",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-4 border-b border-rule px-5 py-4">
        <div className="min-w-0">
          <h2 id={titleId} className="text-h4 text-ink">
            {title}
          </h2>
          {description && (
            <p id={descId} className="mt-1 text-meta text-ink-muted">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="-mr-1 -mt-1 flex size-8 shrink-0 items-center justify-center text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          <X aria-hidden focusable="false" size={16} strokeWidth={1.5} />
        </button>
      </header>

      {children && <div className="px-5 py-5">{children}</div>}

      {footer && (
        <footer className="flex justify-end gap-2 border-t border-rule px-5 py-4">
          {footer}
        </footer>
      )}
    </dialog>
  );
}
