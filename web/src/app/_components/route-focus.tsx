"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Next announces the new title but leaves focus on the link; move it. */
export function RouteFocus() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const target =
      document.querySelector<HTMLElement>("main h1") ??
      document.querySelector<HTMLElement>("main");
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus();
  }, [pathname]);

  return null;
}
