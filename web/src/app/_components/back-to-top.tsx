"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        })
      }
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        "fixed bottom-6 right-6 z-30 flex h-11 items-center gap-2 border border-ink bg-paper px-4",
        "text-micro uppercase tracking-label text-ink transition-[opacity,transform,background-color] duration-200",
        "hover:bg-ink hover:text-paper",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <ArrowUp aria-hidden focusable="false" size={14} strokeWidth={1.75} />
      Top
    </button>
  );
}
