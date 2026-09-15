# Rentora — Web

Frontend for the Rentora rental marketplace. Next.js 15 (App Router) ·
TypeScript · Tailwind v4. It talks to the Express/Prisma API described in
[`../API_DOCUMENTATION.md`](../API_DOCUMENTATION.md).

## Run it

```bash
cp .env.example .env.local     # point NEXT_PUBLIC_API_BASE_URL at your API
npm install
npm run dev
```

`.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

Use the production base URL (`http://api.rentora.itsaffan.com/api/v1`) to run
against the deployed backend instead. Every screen reads live data — there is
no mock layer — so the API must be reachable, and each page degrades to an
error panel rather than crashing when it is not.

## Scripts

| | |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | production build |
| `npm run typecheck` | `tsc --noEmit` |

## Routes

| Path | Access | |
|---|---|---|
| `/` | public | landing |
| `/properties` | public | browse, filter, paginate |
| `/properties/[id]` | public | listing detail, request a tenancy |
| `/login`, `/register` | public | auth |
| `/tenant` | TENANT | overview, rentals, payments, reviews |
| `/landlord` | LANDLORD | properties CRUD, incoming requests |
| `/admin` | ADMIN | users, properties, rentals, categories |

Role sections redirect to `/login` when signed out, and to the caller's own
home when the role does not match.

## How it fits together

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — layering rules and the barrel split.
- [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) — the Swiss token system and its rules.
- `src/shared/api/endpoints.ts` — every API path, in one registry.

Auth is httpOnly-cookie based. Server Components read through
`src/shared/api/server.ts`, which forwards the incoming cookie header;
mutations are Server Actions, so the browser never holds a token or an API URL.

## Known API gaps

- There is no `GET /landlord/properties`. A landlord's own stock is filtered
  out of the public list — see `features/properties/model/queries.ts`.
- There is no endpoint for reading reviews. The listing page renders them only
  when `GET /properties/:id` embeds a `reviews` relation.
- Categories can be created but not renamed or deleted, so no UI implies it.
