# Rentora — Motion Plan

Motion here is structural, not decorative. It exists to explain where something
came from, to confirm an action landed, or to pace a first impression. If a
movement does none of those, it does not ship.

Tokens live in `src/shared/lib/motion.ts` — never hardcode a duration or ease.

## The rules

1. **Animate `transform` and `opacity` only.** Both are compositor-only. Never
   animate `width`, `height`, `top`, `left`, or `margin`.
2. **Entrances decelerate, exits accelerate.** `EASE.out` in, `EASE.in` out.
3. **Nothing scrubbed to scroll gets an ease** — `EASE.linear`, or the element
   lags the scrollbar and feels broken.
4. **The above-the-fold sequence settles inside 800ms** (hard cap 1000ms), and
   never blocks input. Past ~1s a user stops reading motion as polish and starts
   reading it as latency.
5. **Reveal once.** `once: true`. Re-animating on scroll-back is nausea, not delight.
6. **Never hide content that JS has not yet un-hidden**, without a failsafe. The
   `data-motion="armed"` attribute is set pre-paint and self-clears after 2s; a
   `<noscript>` rule unhides everything outright; and reduced-motion users are
   never gated on the animation at all. A GSAP failure cannot blank the page.
   Hidden state uses `autoAlpha`, not bare `opacity` — an `opacity: 0` block is
   still focusable and still announced.
7. **Reduced motion substitutes, it does not disable.** Translation, scale and
   parallax are the vestibular triggers — drop those, keep a shortened fade so
   the user still gets the state-change feedback.
8. **Stagger totals ≤ 400ms.** `staggerFor()` switches from a per-element gap
   to a fixed total once `(n-1) × each` would exceed that, so a data-driven list
   never turns into a queue. `from: "random"` is banned — it destroys the
   perception of system order.
9. **Every timeline is cleaned up.** `useGSAP` with a `scope` handles it; a bare
   `useEffect` must call `ctx.revert()`.
10. **Text reveals mask by line, never by character.** Per-character splitting
    wrecks screen-reader pronunciation and looks like a template.

## Where motion is used

| Surface | Motion | Why |
|---|---|---|
| Brand curtain (`brand-loader`) | Letters rise behind a mask, then the panel lifts away | First impression. **Once per session**, skippable, capped at 1.2s, skipped entirely under reduced motion |
| Hero (`_hero-intro`) | Per-line masked rise, then a staggered fade for supporting copy | Establishes reading order on the one screen with no data yet |
| Section headings + bodies (`Reveal`) | `autoAlpha` + 24px rise, 500ms, on scroll, once | Marks section boundaries on a long viewport-paced page |
| Card grids, step lists, place lists (`Reveal stagger`) | Same, staggered 60ms (or a 400ms total, whichever is shorter) | Gives a grid a reading direction |
| Back to top | Fade + 12px rise on scroll past 600px | Appears only when it is useful |
| Dialog | 160ms fade + 8px drop (`--animate-dialog`) | Confirms the surface is new and modal |
| Buttons | 100ms colour/border in, 70ms press | Lands inside the 100ms direct-manipulation limit |
| Property card | 500ms image scale to 1.03, border to ink | Signals the whole card is one target |
| Table rows | 100ms background tint on hover | Row tracking across wide tables |
| Nav + links | 150ms colour only | Never move navigation |

## Where motion is deliberately absent

- **Dashboard data.** Tables, stats and status badges appear instantly.
  An operator re-reading a rent figure should never wait on a fade.
- **Form fields and validation.** Errors appear immediately; a delayed error is
  a missed error. Only the colour transitions.
- **Route changes.** No page transition. It would delay every navigation and
  fight the focus management in `route-focus`.
- **Loading skeletons.** Static bars, no shimmer. A shimmer implies progress
  that is not being measured.
- **Pagination, filters, sorting.** These are re-reads of the same surface.
  Animating them makes the data feel less trustworthy.

## Accessibility

- The brand curtain is `aria-hidden` and never traps focus — the real page
  renders underneath it, so assistive tech is already in the document rather
  than waiting behind a curtain. Click or any key fast-forwards it.
- Reveal targets are in the DOM and readable by crawlers regardless of
  animation state. `autoAlpha` toggles `visibility`, so a not-yet-revealed
  block is out of the tab order rather than an invisible keyboard trap — and it
  is only ever hidden when JS is confirmed running.
- `prefers-reduced-motion` is honoured in JS (`prefersReducedMotion()`) as well
  as the blanket CSS reset in `globals.css`, because GSAP writes inline styles
  that a CSS `transition-duration` override cannot reach.

## Cost

GSAP core + ScrollTrigger adds roughly 60 kB to the landing route's first load.
That is a deliberate trade for the landing page only — dashboard routes stay on
CSS transitions and do not import GSAP.
