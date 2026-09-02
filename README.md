# Rentora

Backend API for a rental property marketplace — tenants browse and rent properties, landlords list and manage them, admins oversee the platform. Built with Node.js, Express, TypeScript, Prisma (PostgreSQL), JWT auth, and Stripe payments.

## Stack

- **Runtime:** Node.js + TypeScript (`tsx` for dev, `tsup` for build)
- **Framework:** Express 5
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** JWT (access + refresh) in httpOnly cookies, bcrypt password hashing
- **Payments:** Stripe (checkout + webhooks)
- **Validation:** Zod

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT secrets, Stripe keys, etc.
npm run db:generate
npm run db:migrate
npm run dev
```

Server starts on `PORT` from `.env`. Visit `GET /` for a health check.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Generate Prisma client and bundle for production |
| `npm start` | Run the built server (`dist/server.js`) |
| `npm test` | Run tests (`node --test`) |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:migrate` | Apply Prisma migrations in dev |
| `npm run stripe:webhook` | Forward Stripe webhook events to localhost |
| `npm run deploy` | Build and deploy to Vercel |

## Project structure

```
src/
  modules/       # auth, category, property, rental, review, payment, admin
  middlewares/    # auth guard, error handler, request validation
  utils/, lib/, config/, errors/
prisma/
  schema/        # one .prisma file per model
  migrations/
postman/          # Postman collection + full API reference
docs/             # design notes and decision logs per feature
```

Each module follows the same layout: `*.route.ts` → `*.controller.ts` → `*.service.ts`, with `*.validation.ts` (Zod) and `*.interface.ts` alongside.

## API

Full endpoint reference, request/response shapes, and auth details: **[`postman/API_DOCUMENTATION.md`](./postman/API_DOCUMENTATION.md)**.

Import [`postman/Rentora.postman_collection.json`](./postman/Rentora.postman_collection.json) with its matching environment file to try it live.

Quick overview — all routes are under `/api/v1`:

| Resource | Base path | Roles |
|---|---|---|
| Auth | `/auth` | public register/login, `/auth/me` for any signed-in user |
| Categories | `/categories` | public read, admin write |
| Properties | `/properties` | public read |
| Landlord properties | `/landlord/properties` | landlord |
| Rentals | `/rentals` | tenant |
| Landlord rental requests | `/landlord/requests` | landlord, admin |
| Reviews | `/reviews` | tenant |
| Payments | `/payments` | tenant (Stripe checkout + webhook) |
| Admin | `/admin` | admin |

## Environment variables

See [`.env.example`](./.env.example) for the full list: database connection, port/app URL, bcrypt rounds, JWT secrets/expiry, and Stripe keys.
