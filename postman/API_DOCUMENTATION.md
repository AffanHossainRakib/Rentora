# Rentora API Documentation

Backend API for **Rentora** — a rental property marketplace (RentNest-variant assignment). Node.js + Express + TypeScript + Prisma (PostgreSQL) + JWT auth + Stripe payments.

- **Base URL (local):** `http://localhost:{PORT}/api/v1`
- **Base URL (production):** `http://api.rentora.itsaffan.com/api/v1`
- **Postman collection:** [`Rentora.postman_collection.json`](./Rentora.postman_collection.json) (import alongside [`Rentora Enviroment.postman_environment.json`](./Rentora%20Enviroment.postman_environment.json) — set its `rentora` variable to the base URL above)

---

## Authentication

Rentora uses JWT stored in **httpOnly cookies**, set automatically on login:

| Cookie | Contains | Lifetime |
|---|---|---|
| `accessToken` | short-lived JWT, checked on every protected route | `JWT_ACCESS_EXPIRES_IN` (e.g. `1d`) |
| `refreshToken` | long-lived JWT | `JWT_REFRESH_EXPIRES_IN` (e.g. `7d`) |

Postman keeps cookies automatically once you log in through it, so no manual header setup is needed in the collection. A protected route also accepts a bearer token instead of the cookie:

```
Authorization: Bearer <accessToken>
```

Roles: **TENANT**, **LANDLORD**, **ADMIN** (`role` enum). Chosen at registration (`TENANT` or `LANDLORD` only — `ADMIN` cannot self-register). A deactivated user (`isActive: false`) is rejected with `403` on every subsequent request even with a valid token.

---

## Response format

All endpoints share one envelope shape.

**Success**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Human readable message.",
  "data": { "...": "..." },
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPage": 5 }
}
```
`meta` is only present on paginated list endpoints.

**Error**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "email: Invalid email address, password: Password must be at least 8 characters long",
  "errorDetails": [
    { "path": "email", "message": "Invalid email address" },
    { "path": "password", "message": "Password must be at least 8 characters long" }
  ]
}
```
`errorDetails` is `null` for non-validation errors in production; in development it instead carries `{ name, stack }` for debugging.

**404 (unmatched route)**
```json
{ "message": "Route not found", "path": "/api/v1/whatever", "date": "2026-09-02T12:00:00.000Z" }
```

Common status codes: `400` validation/business-rule error, `401` missing/invalid/expired token, `403` forbidden (wrong role, deactivated account, not the resource owner), `404` not found, `409` conflict (duplicate email, duplicate review), `500` unhandled server error.

---

## Auth — `/api/v1/auth`

### `POST /auth/register`
Public. Registers a TENANT or LANDLORD.

Body:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "TENANT",
  "bio": "optional",
  "profilePicture": "optional URL"
}
```
Validation: `name` non-empty · `email` valid email · `password` ≥ 8 chars · `role` one of `TENANT`/`LANDLORD` (case-insensitive, normalized to upper) · `bio`/`profilePicture` optional strings.

Response `201`: `{ data: { user } }` (password omitted, includes created `profile`). Errors: `409` if email already registered.

### `POST /auth/login`
Public. Body: `{ "email": "...", "password": "..." }`. Sets `accessToken` + `refreshToken` cookies. Response `200`: `{ data: null }`. Errors: `401` invalid credentials, `403` account deactivated.

### `GET /auth/me`
Auth: any role. Returns the current user's profile (password omitted). `200`: `{ data: { user } }`.

---

## Categories — `/api/v1/categories`

### `GET /categories`
Public. `200`: `{ data: { categories: Category[] } }`.

### `POST /categories`
Auth: **ADMIN**. Body: `{ "name": "Apartment" }` (non-empty; normalized to Title Case; must be unique). `201`: `{ data: { category } }`.

---

## Properties (public browse) — `/api/v1/properties`

### `GET /properties`
Public, paginated & filterable. Query params (all optional):

| Param | Type | Notes |
|---|---|---|
| `searchTerm` | string | matches `title` or `description` (case-insensitive) |
| `location` | string | partial match, case-insensitive |
| `category` | string | partial match on category name |
| `isAvailable` | boolean (`true`/`false`) | |
| `priceMin`, `priceMax` | number ≥ 0 | inclusive range |
| `page`, `limit` | positive int | default `page=1`, `limit=10` |

`200`: `{ data: { properties: Property[] }, meta }`. Each property embeds `category` as its name (string), not an id.

### `GET /properties/:id`
Public. `200`: `{ data: { property } }`. `404` if not found.

---

## Landlord Properties — `/api/v1/landlord/properties`

All routes auth: **LANDLORD**.

### `POST /landlord/properties`
Body:
```json
{
  "title": "Sunny Apartment",
  "description": "optional",
  "isAvailable": true,
  "location": "Dhaka, Bangladesh",
  "price": 25000,
  "category": "Apartment",
  "amenities": ["WiFi", "Parking"],
  "pictures": ["https://..."]
}
```
Validation: `title`/`location` non-empty · `price` positive number · `category` must match an existing category **name** · `isAvailable` defaults `true` · `amenities`/`pictures` optional string arrays. `201`: `{ data: { property } }`. `400` if `category` name doesn't exist.

### `PUT /landlord/properties/:id`
Same schema as create, all fields optional (partial update). Only the owning landlord may update. `200`: `{ data: { property } }`. `403` if not the owner, `404` if not found.

### `DELETE /landlord/properties/:id`
Only the owning landlord. Blocked with `409` if the property has a `PENDING`, `APPROVED`, or `ACTIVE` rental request attached. `200`: `{ data: null }`.

---

## Landlord Requests — `/api/v1/landlord/requests`

Auth: **LANDLORD** (status update also allows **ADMIN**).

### `GET /landlord/requests`
Rental requests submitted for properties the landlord owns. Query: `status` (`PENDING`/`APPROVED`/`REJECTED`/`ACTIVE`/`COMPLETED`), `page`, `limit`. `200`: `{ data: { rentalRequests }, meta }`.

### `PATCH /landlord/requests/:id`
Body: `{ "status": "APPROVED" }`. Allowed values depend on caller's role:
- **LANDLORD**: `PENDING → APPROVED | REJECTED` only (must own the property).
- **ADMIN**: same, plus `ACTIVE → COMPLETED` (manual override; auto-completion via cron is not yet implemented).

`400` if the transition isn't allowed from the request's current status. `200`: `{ data: { rentalRequest } }`.

---

## Tenant Rentals — `/api/v1/rentals`

### `POST /rentals`
Auth: **TENANT**. Body:
```json
{ "propertyId": "uuid", "startDate": "2026-09-02T00:00:00.000Z", "endDate": "2026-09-28T00:00:00.000Z" }
```
Validation: `propertyId` valid UUID · dates coerced to `Date` · `endDate` must be after `startDate`. `400` if the property isn't `isAvailable`. Creates request in `PENDING` status. `201`: `{ data: { rentalRequest } }`.

### `GET /rentals`
Auth: **TENANT**. The caller's own rental requests. Query: `status`, `page`, `limit`. `200`: `{ data: { rentalRequests }, meta }`.

### `GET /rentals/:id`
Auth: any role. Visible to the tenant who made it, the landlord who owns the property, or an admin. `403` otherwise, `404` if missing.

---

## Reviews — `/api/v1/reviews`

### `POST /reviews`
Auth: **TENANT**. Body:
```json
{ "rentalRequestId": "uuid", "rating": 5, "review": "Great place!" }
```
Validation: `rentalRequestId` UUID · `rating` integer 1–5 · `review` non-empty. Rules: must be your own rental request, its status must be `COMPLETED`, and it can only be reviewed once (`409` on a repeat). `201`: `{ data: { review } }`.

---

## Payments (Stripe) — `/api/v1/payments`

Payment provider: **Stripe Checkout** (`PaymentProvider.STRIPE`; the `SSLCOMMERZ` enum value exists in the schema for extensibility/seed data but no SSLCommerz integration is wired up).

### `POST /payments/create`
Auth: **TENANT**. Body: `{ "rentalRequestId": "uuid" }`. Rules:
- Only the tenant who owns the rental request may pay for it.
- The rental request must be `APPROVED`.
- `400` if that request already has a `COMPLETED` payment.
- If a `PENDING` payment / open Stripe session already exists, its checkout URL is reused instead of creating a duplicate.

Creates a Stripe Checkout Session for `property.price` (amount in the smallest currency unit) and a `Payment` row (`status: PENDING`). `201`:
```json
{ "data": { "paymentUrl": "https://checkout.stripe.com/...", "payment": { "id": "...", "status": "PENDING", "amount": 25000, "currency": "usd", "provider": "STRIPE", "transactionId": "cs_test_..." } } }
```
Redirect the tenant to `paymentUrl` to complete payment; Stripe returns them to `APP_URL?success=true|false`.

### `POST /payments/webhook`
Public (verified via Stripe signature, **not** JWT). Consumes the raw request body (registered with `express.raw()` before the JSON parser — see `app.ts`) and the `Stripe-Signature` header. Handles `checkout.session.completed` (marks the `Payment` `COMPLETED`, sets `paidAt`, advances the rental request to `ACTIVE`) and `checkout.session.expired` (marks it `FAILED`). Configure this URL as the endpoint in the Stripe Dashboard / `stripe listen --forward-to`.

### `GET /payments`
Auth: **TENANT**. The caller's own payment history, each with the related rental request + property embedded. Query: `status` (`PENDING`/`COMPLETED`/`FAILED`), `page`, `limit`. `200`: `{ data: { payments }, meta }`.

### `GET /payments/:id`
Auth: any role. Visible to the paying tenant, the owning landlord, or an admin. `403`/`404` otherwise.

---

## Admin — `/api/v1/admin`

All routes auth: **ADMIN**.

### `GET /admin/users`
Query: `role` (`TENANT`/`LANDLORD`/`ADMIN`), `page`, `limit`. `200`: `{ data: { users }, meta }`.

### `PATCH /admin/users/:id`
Body: `{ "isActive": false }` — bans/unbans a user. `200`: `{ data: { user } }`, message reflects `"banned"`/`"unbanned"`.

### `GET /admin/properties`
All properties platform-wide. Query: `page`, `limit`. `200`: `{ data: { properties }, meta }`.

### `GET /admin/rentals`
All rental requests platform-wide. Query: `page`, `limit`. `200`: `{ data: { rentalRequests }, meta }`.

---

## Data model summary

| Model | Key fields | Relations |
|---|---|---|
| `User` | `id, name, email(unique), password, role[TENANT\|LANDLORD\|ADMIN], isActive` | 1–1 `Profile`, 1–N `Property`, `RentalRequest`, `Review` |
| `Profile` | `userId(unique), profilePicture?, bio?` | belongs to `User` |
| `Category` | `id, name(unique)` | 1–N `Property` |
| `Property` | `id, userId, title, description?, isAvailable, location, price, categoryId, amenities[], pictures[]` (indexed on `isAvailable`, `location`, `price`, `categoryId`) | belongs to `User`(landlord) + `Category`; 1–N `RentalRequest`, `Review` |
| `RentalRequest` | `id, userId, propertyId, status[PENDING\|APPROVED\|REJECTED\|ACTIVE\|COMPLETED], startDate, endDate` | belongs to `User`(tenant) + `Property`; 1–N `Payment`; 1–1 `Review` |
| `Payment` | `id, rentalRequestId, status[PENDING\|COMPLETED\|FAILED], transactionId?, amount, method, provider[STRIPE\|SSLCOMMERZ], currency, paidAt?` | belongs to `RentalRequest` |
| `Review` | `id, userId, propertyId, rentalRequestId(unique), rating(1–5), review` | belongs to `User`, `Property`, `RentalRequest` |

---

## Seeded credentials (`prisma/seed.ts`)

All seeded accounts share the password **`password`**.

| Role | Email |
|---|---|
| Admin | `admin@rentora.test` |
| Landlord | `landlord1@rentora.test`, `landlord2@rentora.test` |
| Tenant | `tenant1@rentora.test`, `tenant2@rentora.test` |

Run `npx prisma db seed` (or your configured seed script) to populate this data.
