# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A restaurant/hookah lounge reservation system consisting of three independent services:

- **`backend-repo/`** — Laravel 12 API (PHP 8.2, MySQL)
- **`admin/`** — React 19 SPA serving both the admin dashboard and customer booking flow
- **`notice-system/`** — Node.js Express server acting as a WhatsApp bridge via `whatsapp-web.js`

---

## Commands

### Backend (`backend-repo/`)

```bash
# Run all services together (API + queue worker + log watcher + Vite)
composer dev

# Run tests (uses in-memory SQLite)
composer test

# Run a single test file
php artisan test --filter ReservationAvailabilityTest

# Code style fixer
./vendor/bin/pint

# Fresh setup from scratch
composer setup
```

### Admin SPA (`admin/`)

```bash
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run lint       # ESLint
npm run preview    # Preview production build
```

### Notice System (`notice-system/`)

```bash
npm start          # Start WhatsApp bridge (node src/index.js)
npm test           # Jest tests
```

---

## Architecture

### Backend (Laravel)

**Auth:** Laravel Sanctum. Admin token stored via `/api/admin/login`; protected routes use `auth:sanctum` middleware. The notice-system integration routes (`/api/admin/config`, retry) are intentionally outside Sanctum — the notice-system has its own `x-api-secret` auth layer.

**Configuration duality:** Business settings live in two places:
- `settings` DB table (via `Setting` model) — business name, contact info, notification toggles, logo, menu PDF
- `storage/app/config.json` — schedule/shifts, blocked days, slot definitions

Both are merged at runtime in `SettingsController::index()`. The cache key `config.json` is used (`Cache::rememberForever`); after any write to `config.json`, call `Cache::forget('config.json')`.

**Notification pipeline:** `NotificationService` sends WhatsApp notifications via HTTP POST to `notice-system` (configured via `NOTICE_SYSTEM_URL` and `NOTICE_SYSTEM_SECRET` env vars, consumed through `config/notice.php`). Email notifications are queued via Laravel's Mail. Both channels are independent — one failure doesn't block the other. All notification attempts are logged to the `notification_logs` table.

**Queue:** Uses the database queue driver (`QUEUE_CONNECTION=database`). Delayed jobs (`SendReminderJob`, `SendReviewJob`) are dispatched at reservation confirmation and cancelled by scanning the `jobs` table payload when status changes.

**Status lifecycle:**
```
PENDIENTE → CONFIRMADA → ASISTIÓ
                      → NO_ASISTIÓ
           → CANCELADA
```
Status transitions dispatch/cancel notification jobs:
- `CONFIRMADA`: sends confirmation, schedules reminder job
- `CANCELADA`: sends cancellation, cancels pending jobs
- `ASISTIÓ`: schedules review job

**Source values:** `web` (customer form), `manual` (admin-created), `whatsapp` (X-Source header). Source is immutable after creation.

### Admin SPA (React)

A single Vite build hosts two apps under different routes:
- `/admin/*` — Admin dashboard (Sanctum token auth, Zustand `useAuthStore`, MUI v7)
- `/reservacion/*` (also `/reservar/*`) — Customer booking flow (multi-step wizard)
- `/` — Under construction placeholder

The customer booking flow is a step machine: `selection → zone_selection → event_selection → confirmation → success`. State lives in `useReservationStore` (Zustand).

The admin theme is a Google Material Design-style palette: primary `#1A73E8`, background `#F1F3F4`, text `#202124`.

### Notice System (Node.js)

Express server that bridges the Laravel backend to WhatsApp via `whatsapp-web.js`. Key endpoints:
- `/notify/*` — Protected by `x-api-secret` header; sends WhatsApp messages
- `/health` — Returns WhatsApp connection status (used by admin dashboard's `WhatsAppStatus` component)
- `/qr?token=...` — Shows QR code for WhatsApp device pairing (token-protected via `ADMIN_ACCESS_TOKEN`)
- `/monitoring?token=...` — Message log dashboard

Set `TEST_PHONE` in `notice-system/.env` to redirect all messages to a test number during development.

---

## Environment Variables

### `backend-repo/.env`

Key non-obvious variables:
- `DB_CONNECTION=mysqli` — uses `mysqli` driver, not `mysql`
- `NOTICE_SYSTEM_URL` — URL of the notice-system server (e.g., `http://localhost:3001`)
- `NOTICE_SYSTEM_SECRET` — must match `API_SECRET` in notice-system

### `notice-system/.env`

```
PORT=3001
API_SECRET=...           # Must match NOTICE_SYSTEM_SECRET in backend
ADMIN_ACCESS_TOKEN=...   # For QR/monitoring UI access
RESTAURANT_PHONE=...     # Admin WhatsApp number
TEST_PHONE=              # If set, all messages go here instead of real recipient
BACKEND_URL=...          # Backend URL for the monitoring dashboard
```
