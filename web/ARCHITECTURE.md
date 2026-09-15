# Rentora Web — Architecture

## Layers

Imports flow in **one direction only**. A module may import from layers below it, never above, never sideways.

```
app/        routes. Thin. Composes features, owns no business logic.
   ↓
features/   one slice per domain concept. Owns its components + data access.
   ↓
shared/     framework-level primitives. Knows nothing about any feature.
```

### Enforced rules

1. `shared/**` must not import from `features/**` or `app/**`.
2. `features/a/**` must not import from `features/b/**`. If two slices need the same thing, it belongs in `shared/`.

   One deliberate exception: `admin` is a cross-cutting oversight slice, so it
   may compose another slice's *public surface* (`@/features/properties`,
   `@/features/rentals`) rather than duplicating their actions. The edge is
   one-directional — nothing imports `admin` — so the graph stays acyclic.

   Within a slice, components import their own `model/actions` **relatively**
   (`../model/actions`), never through their own barrel: that would be circular
   and would drag every sibling component into the client bundle.
3. `app/**` imports a feature only through its barrels: `@/features/rentals` or `@/features/rentals/server` — never `@/features/rentals/components/rental-table`.
4. Every feature exposes exactly **two** public surfaces and nothing else:
   - `index.ts` — components and Server Actions. Safe to import from anywhere, including Client Components.
   - `server.ts` — read queries. Server Components only.

   The split is load-bearing, not cosmetic. Queries reach `next/headers` through
   `@/shared/api/server`, which is marked `server-only`; a single barrel would
   drag that into the client bundle the moment any Client Component imported an
   action from it, and the build fails. Server Actions are exempt — `"use server"`
   modules are replaced by reference stubs on the client.
5. No god-barrels in `shared/`. Import the concern directly (`@/shared/lib/format`). The two exceptions are `@/shared/ui` (component library, conventional) and `@/shared/types` (types only, zero runtime cost).

## Slice anatomy

```
features/<slice>/
  index.ts          components + actions  (client-safe)
  server.ts         read queries          (server-only)
  components/       presentational + interactive UI for this slice
  model/
    queries.ts      server-side reads
    actions.ts      "use server" mutations
```

`model/` is the only place a slice talks to the network. Reads go through
`@/shared/api/server`, which forwards the httpOnly auth cookies that
`credentials: "include"` cannot reach from a Server Component. Mutations are
Server Actions, so client components never hold an API URL or a token.
Components never call `fetch`.

## Shared layer

```
shared/
  api/
    client.ts       transport: request(), ApiError, searchParams
    endpoints.ts    every API path, in one registry
    server.ts       cookie-forwarding server transport
    action-result.ts  discriminated result type for Server Actions
  types/            domain.ts (entities) + api.ts (envelope, pagination)
  ui/               design-system primitives, exported via index.ts
  lib/              cn, format, pagination, status vocabulary
  config/           navigation and site constants
```

## Data flow

Server Components read data and pass plain props down. `"use client"` is pushed
to the leaves that genuinely need interactivity — filter bars, dialogs, forms,
tables with sorting. A page is a Server Component unless it cannot be.

## Styling

Tailwind v4, CSS-first. All design tokens live in `src/styles/tokens.css` under
`@theme`. Components consume tokens through utility classes; no component
declares a raw hex value or a magic pixel number.
