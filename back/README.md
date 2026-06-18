# Architecture Rule Map — Asset Identity Model (ticker - asset_id)

## Objective

This project enforces a strict rule:

> **The backend MUST NEVER use a ticker as a business identifier.**
>
> The only internal source of truth is: `asset_id`.

The `ticker` exists only as a UI / external representation.

---

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

---

## Canonical Model (SOURCE OF TRUTH)

```txt id="asset-model"
Asset
 ├── id (PRIMARY KEY) INTERNAL SYSTEM IDENTIFIER
 ├── ticker (UNIQUE)  UI / EXTERNAL IDENTIFIER ONLY
 ├── name
 └── asset_type_id


