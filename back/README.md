# Back-end Architecture — Utils, Services & Middlewares

This document explains how the `src/utils`, `src/services` and `src/middlewares` folders are organized.

The back-end is written in vanilla JavaScript (Node.js/Express) — most of these utilities were implemented by hand rather than relying on external libraries as black boxes.

As a result, most files in this document have an existing equivalent in the Express ecosystem.

Three folders, three responsibilities:

**utils/** — pure logic (validation, hashing, formatting, errors)

**services/** — logic with side effects or external dependencies (token generation, file uploads, API calls)

**middlewares/** — functions hooked onto certain requests for verification purposes, executed before they reach a controller

# 1 — utils (src/utils)

## AppError.js
Custom error class, extending the native `Error`, which carries an HTTP `statusCode` in addition to the message.
It allows distinguishing expected errors (4xx) from unexpected bugs (500), without having to build the response by hand every time.

Equivalent: `http-errors` (Express)

## password.js
Wraps bcrypt for password hashing and comparison, used at account creation and login.

Equivalent: bcrypt wrapper — modern alternative: argon2

## validators.js
Unit validation rules (regex, length, etc.)

Equivalent: Zod

## sanitizer.js
Orchestrates the rules from `validators.js` depending on the calling context (create/update)

Equivalent: Zod

How these 4 files work together:
controller (req.body) -> sanitizer.js -> validators.js -> AppError (if invalid)

# 2 — services (src/services)

## authTokenService.js
Generates the JWT token issued at login and registration (`generateToken`), with a minimal payload (id, role, analyst_type_id).

## multerConfig.js
Configures Multer for file uploads.

## stockService.js
Provides the market data consumed by the application through local JSON files.
Behaves similarly to an external API.

# 3 — Middlewares (src/middlewares)

Each middleware enriches the same `req` object, passed by reference throughout a request.

## Example authorization chain (POST /recommendations)

Incoming request
-> authMiddleware(["analyst", "admin"]) adds req.user (full user object, fetched from the database)
-> assetMiddleware() adds req.asset (ticker / database id lookup)
-> specializationMiddleware() reads req.user + req.asset, authorizes or blocks
-> Controller

## authMiddleware.js
Verifies the JWT (`Authorization: Bearer <token>`), fetches the user from the database, and controls access based on role.

## assetMiddleware.js
Matches the ticker to the full asset record in the database, attached to `req.asset`.

## specializationMiddleware.js
Applies the project's core business rule: an analyst can only recommend an asset within their own specialization. Admins bypass this rule entirely.

## errorHandler.js
Single entry point for every error forwarded via `next(error)` in the application.
Reads `err.statusCode` (if the error comes from AppError) to determine the HTTP status code, defaulting to 500.

## securityHeadersMiddleware.js
Sets a group of security-related HTTP headers on every response.

Equivalent: Helmet.js

# 4 — Asset Identity Model (ticker vs asset_id)

## Objective

This project enforces a strict rule:

> **The backend MUST NEVER use a ticker as a business identifier.**
>
> The only internal source of truth is: `asset_id`.

The `ticker` exists only as a UI / external representation.

## Core Rule (NON-NEGOTIABLE)

### FORBIDDEN

- Using `ticker` in:
  - database relationships
  - business logic
  - recommendations system
  - user follow system
  - permissions / authorization logic
  - services or models

### ALLOWED

- `ticker` is only allowed for:
  - asset lookup (`getAssetByTicker`)
  - user input (API request)
  - UI display (frontend)
  - conversion step → `asset_id`

## Canonical Model (SOURCE OF TRUTH)

```
Asset
 ├── id (PRIMARY KEY)   INTERNAL SYSTEM IDENTIFIER
 ├── ticker (UNIQUE)     UI / EXTERNAL IDENTIFIER ONLY
 ├── name
 └── asset_type_id
```

