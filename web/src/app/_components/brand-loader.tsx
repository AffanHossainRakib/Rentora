"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SITE } from "@/shared/config/navigation";
import { DURATION, EASE, STAGGER, prefersReducedMotion } from "@/shared/lib/motion";

gsap.registerPlugin(useGSAP);

const SESSION_KEY = "rentora:intro-seen";
const LETTERS = SITE.name.split("");

/** Never hold the page hostage to one stalled asset. */
const HARD_CAP_MS = 6000;

export const INTRO_EVENT = "rentora:intro-done";

/**
 * Brand curtain covering the initial load. It lifts when the page is actually
 * ready rather than on a fixed timer, but never before the wordmark has
 * finished animating, so a fast load still reads as deliberate not as a flash.
 *
 * Once per session, skipped under reduced motion, skippable by click or key.
 * `aria-hidden` and never focus-trapping — the page renders underneath, so
 * assistive tech is already in the document.
 */
export function BrandLoader() {
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const skip = useRef<() => void>(null);

  useGSAP(
    () => {
      let seen = false;
      try {
        seen = sessionStorage.getItem(SESSION_KEY) === "1";
      } catch {
        // Private browsing: treat as unseen, it is only a one-off animation.
      }

      if (seen || prefersReducedMotion()) {
        setDone(true);
        return;
      }

      // Written up front, so a reload mid-intro does not replay it.
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* no-op */
      }

      let lifted = false;
      const lift = () => {
        if (lifted) return;
        lifted = true;
        gsap.to(root.current, {
          yPercent: -100,
          duration: DURATION.large,
          ease: EASE.in,
          onComplete: () => {
            setDone(true);
            // The hero entrance waits on this rather than a guessed delay,
            // because the curtain's length now depends on load time.
            window.dispatchEvent(new Event(INTRO_EVENT));
          },
        });
      };

      // The curtain waits on whichever finishes last: the wordmark animation,
      // or the page actually becoming usable.
      let introFinished = false;
      let pageReady = document.readyState === "complete";
      const liftWhenReady = () => {
        if (introFinished && pageReady) lift();
      };

      const onLoad = () => {
        pageReady = true;
        liftWhenReady();
      };
      if (!pageReady) window.addEventListener("load", onLoad, { once: true });

      const intro = gsap
        .timeline({
          onComplete: () => {
            introFinished = true;
            liftWhenReady();
          },
        })
        .set(root.current, { opacity: 1 })
        .from('[data-loader="letter"]', {
          yPercent: 115,
          duration: DURATION.reveal,
          ease: EASE.expressive,
          stagger: STAGGER.list,
        })
        .to({}, { duration: 0.15 });

      const bail = window.setTimeout(lift, HARD_CAP_MS);

      const fastForward = () => {
        intro.progress(1);
        lift();
      };
      skip.current = fastForward;
      window.addEventListener("keydown", fastForward, { once: true });

      return () => {
        window.clearTimeout(bail);
        window.removeEventListener("load", onLoad);
        window.removeEventListener("keydown", fastForward);
      };
    },
    { scope: root },
  );

  if (done) return null;

  return (
    <div
      ref={root}
      aria-hidden
      onClick={() => skip.current?.()}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink opacity-0"
    >
      <p className="flex overflow-hidden pb-2 text-display text-paper">
        {LETTERS.map((letter, i) => (
          <span key={`${letter}-${i}`} data-loader="letter" className="block">
            {letter}
          </span>
        ))}
      </p>
    </div>
  );
}
