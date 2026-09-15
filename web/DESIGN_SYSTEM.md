# Rentora — Design System

**Direction: Swiss utilitarian.** International Typographic Style applied to a
data-dense product. Strict grid, hairline rules, one signal colour, numerals
that align. Nothing decorative that does not carry information.

## Non-negotiables

1. **No rounded corners.** Never use `rounded-*`. Every box is a rectangle.
2. **No shadows for separation.** Structure comes from 1px hairlines
   (`border-rule`) and from the grid. `shadow-*` is banned.
3. **One accent.** `signal` (Swiss red #E30613) marks interaction and emphasis
   only, and at most one accent-coloured element should be visible per screenful.
   Never a large fill. Status colours are for status, not decoration.
4. **Numerals are tabular.** Any figure in a table, stat, price, date or count
   gets `tabular-nums`. Quantities stay in `font-sans` (it ships `tnum`);
   `font-mono` is only for ids, two-digit indices, timestamps and references.
5. **Uppercase micro labels.** Field labels, column headers, eyebrow text:
   `text-micro uppercase tracking-label`.
6. **Section markers.** Headings carry a two-digit mono index (`01`, `02`) —
   the Swiss habit of numbering the grid.
7. **Left-align text, right-align numbers.** Always.
8. **No emoji, no gradients, no purple, no glassmorphism.**

## Tokens (`src/styles/tokens.css`)

Never write a raw hex, rgb or arbitrary px value. Use these only.

### Colour

| Utility | Meaning |
|---|---|
| `bg-paper` | page ground |
| `bg-surface` | raised panel / card |
| `text-ink` | primary text |
| `text-ink-muted` | secondary text (passes AA) |
| `text-ink-faint` | tertiary / micro labels (passes AA) |
| `border-rule` | hairline separator |
| `border-rule-strong` | control boundary (passes 3:1) |
| `text-signal` / `bg-signal` | the single accent |
| `text-positive` `text-warning` `text-critical` | status only |
| `outline-focus` | focus ring |

All have automatic dark-theme values. Do not hardcode a dark variant.

### Type

`text-micro` 11/16 · `text-meta` 13/20 · `text-body` 15/24 · `text-lead` 18/28 ·
`text-h4` 20/28 · `text-h3` 28/36 · `text-h2` 34/40 · `text-h1` 40/44 ·
`text-display` 64/68

Each step carries its own line-height, tracking and weight — tracking tightens
monotonically as size rises, so never add a `tracking-*` class to a heading.
`tracking-label` (0.08em) is for 11px uppercase only. Families: `font-sans`
(Instrument Sans, ships `tnum`), `font-mono` (Fragment Mono — a monospaced
Helvetica, reserved for ids, indices, timestamps and counters, never headings).

### Layout

`max-w-shell` (1224px — 12 columns of 80px with a 24px gutter, zero remainder)
· `max-w-content` (1560px, data tables) · `max-w-prose` (496px = 71 characters)
· `max-w-prose-tight` (392px) · `px-gutter` (responsive page gutter).
Spacing is the default 4px scale.
Body text never exceeds `max-w-prose`.

## Primitives — `@/shared/ui`

`Button` `ButtonLink` (variants `solid|outline|ghost|danger`, sizes `sm|md|lg`)
· `Badge` (tone) · `Dot` · `Panel` `PanelHeader` · `SectionHeading` ·
`Table` `THead` `TBody` `TR` `TH` `TD` (`numeric` prop right-aligns + tabular)
· `Field` `TextInput` `TextArea` `Select` · `Pagination` · `EmptyState` ·
`Stat` `StatGrid` · `Dialog`.

`Field` uses a render prop that supplies `id`, `aria-describedby` and
`aria-invalid`:

```tsx
<Field label="Location" error={errors.location} required>
  {(props) => <TextInput {...props} name="location" />}
</Field>
```

Build a new primitive only if nothing above fits, and put it in the feature
that needs it — not in `shared/ui`.

## Accessibility floor (WCAG 2.2 AA)

- Every interactive target ≥ 24×24px. Use `size-6` minimum for icon buttons.
- Never remove focus. `:focus-visible` is styled globally; if you suppress an
  inner outline with `outline-hidden`, put a visible `focus-within` indicator
  on the wrapper.
- Tables get a `caption` (the `Table` primitive takes one and screen-reader-hides it).
- Sortable headers use `aria-sort` — exactly one non-`none` at a time.
- Form errors: visible text, `role="alert"`, wired via `aria-describedby`.
  `aria-invalid` only once actually invalid.
- Pagination lives in `<nav aria-label="Pagination">` with `aria-current="page"`.
- Status messages go in a live region that exists before it is filled.
- Respect `prefers-reduced-motion` (global reset handles the blanket case; use
  `motion-reduce:` for anything bespoke).

## Motion

Restrained. One `animate-rise` staggered reveal per page load at most, using
`[animation-delay:*]`. Hover transitions ≤ 200ms on colour/border only.
No parallax, no scroll-jacking, no autoplay.
