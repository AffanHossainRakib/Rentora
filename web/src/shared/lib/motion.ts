/**
 * Motion tokens, in seconds because GSAP takes seconds.
 *
 * Calibrated to IBM Carbon's *productive* set and Material 3's *standard*
 * family, not their expressive curves — those read as decorative in a
 * data-dense product. The one expressive moment is the brand curtain.
 */
export const DURATION = {
  hover: 0.1,
  hoverOut: 0.15,
  /** Inside the 100ms direct-manipulation limit. */
  press: 0.07,
  fast: 0.15,
  base: 0.2,
  moderate: 0.24,
  slow: 0.3,
  large: 0.4,
  /** Non-blocking, so the 500ms ceiling is affordable here and nowhere else. */
  reveal: 0.5,
  headline: 0.8,
} as const;

export const EASE = {
  out: "power2.out",
  enter: "circ.out",
  in: "power2.in",
  inOut: "power2.inOut",
  expressive: "expo.out",
  linear: "none",
} as const;

export const STAGGER = {
  row: 0.02,
  list: 0.05,
  card: 0.06,
  line: 0.07,
} as const;

const MAX_STAGGER_TOTAL = 0.4;

/**
 * Past ~400ms of total stagger a list reads as loading rather than arriving,
 * so switch from a per-element gap to a fixed total once the count is high.
 */
export function staggerFor(count: number, each: number = STAGGER.card) {
  if ((count - 1) * each <= MAX_STAGGER_TOTAL) {
    return { each, from: "start" as const };
  }
  return { amount: MAX_STAGGER_TOTAL, from: "start" as const };
}

export const SHIFT = {
  sm: 12,
  md: 24,
} as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
