"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DURATION, EASE, STAGGER, prefersReducedMotion } from "@/shared/lib/motion";
import { INTRO_EVENT } from "@/app/_components/brand-loader";

gsap.registerPlugin(useGSAP);

/**
 * Hero entrance. The headline is masked per line — each line sits in an
 * `overflow-hidden` wrapper and slides up from below it — which reads far
 * better than per-character splitting and leaves the text a single readable
 * node for assistive tech.
 *
 * It waits for the brand curtain so the two sequences do not overlap.
 */
export function HeroIntro({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();

      let introSeen = false;
      try {
        introSeen = sessionStorage.getItem("rentora:intro-seen") === "1";
      } catch {
        /* no-op */
      }

      const tl = gsap.timeline({
        paused: !introSeen && !reduced,
        defaults: { ease: EASE.expressive },
      });

      // Start behind the brand curtain, which now lifts on page-ready rather
      // than a fixed timer, so its length cannot be guessed in advance.
      const start = () => tl.play();
      if (tl.paused()) window.addEventListener(INTRO_EVENT, start, { once: true });

      tl.set(scope.current, { visibility: "visible" });

      if (reduced) {
        tl.from('[data-hero="eyebrow"], [data-hero="line"], [data-hero="fade"]', {
          opacity: 0,
          duration: DURATION.slow,
          stagger: STAGGER.row,
        });
        return;
      }

      tl.from('[data-hero="eyebrow"]', {
        opacity: 0,
        y: 8,
        duration: DURATION.slow,
      })
        .from(
          '[data-hero="line"]',
          {
            yPercent: 110,
            duration: DURATION.headline,
            stagger: STAGGER.line,
          },
          "-=0.1",
        )
        .from(
          '[data-hero="fade"]',
          {
            opacity: 0,
            y: 16,
            duration: DURATION.large,
            ease: EASE.out,
            stagger: STAGGER.list,
          },
          "-=0.35",
        );
      return () => window.removeEventListener(INTRO_EVENT, start);
    },
    { scope },
  );

  return (
    <div ref={scope} data-reveal>
      {children}
    </div>
  );
}
