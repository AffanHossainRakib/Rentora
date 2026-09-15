"use client";

import { useRef, type ElementType } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/shared/lib/cn";
import {
  DURATION,
  EASE,
  SHIFT,
  STAGGER,
  prefersReducedMotion,
  staggerFor,
} from "@/shared/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Scroll-triggered entrance, fired once and never reversed — content that
 * "arrives" a second time on scroll-back is a lie about what happened.
 *
 * Hidden state uses `autoAlpha` (visibility + opacity) rather than opacity
 * alone, so a not-yet-revealed block is out of the tab order and out of the
 * accessibility tree instead of being an invisible keyboard trap.
 */
export function Reveal({
  children,
  className,
  stagger = false,
  as: Tag = "div",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: boolean;
  as?: ElementType;
  delay?: number;
}) {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const targets = stagger ? Array.from(root.children) : [root];
      if (targets.length === 0) return;

      // Vestibular safety: drop the translation, keep the fade and the timing.
      const reduced = prefersReducedMotion();

      gsap.set(root, { visibility: "visible" });
      gsap.set(targets, { autoAlpha: 0, y: reduced ? 0 : SHIFT.md });

      gsap.to(targets, {
        autoAlpha: 1,
        y: 0,
        duration: reduced ? DURATION.slow : DURATION.reveal,
        ease: reduced ? EASE.linear : EASE.out,
        delay,
        stagger: stagger ? staggerFor(targets.length, STAGGER.card) : 0,
        scrollTrigger: {
          trigger: root,
          start: "top 85%",
          once: true,
        },
      });
    },
    { scope, dependencies: [stagger, delay] },
  );

  return (
    <Tag ref={scope} data-reveal className={cn(className)}>
      {children}
    </Tag>
  );
}
