# PapanMaya

<p align="center">
  <strong>A focused board for work that needs to move, not just be listed.</strong><br/>
  Minimal Kanban workspace for personal and small-team clarity — secure, fast, and edge-native.
</p>

<p align="center">
  <a href="https://workers.cloudflare.com"><img alt="Cloudflare Workers" src="https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white"></a>
  <a href="https://hono.dev"><img alt="Hono" src="https://img.shields.io/badge/Hono-4.x-E36002?style=flat-square"></a>
  <a href="https://vite.dev"><img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white"></a>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-34D399?style=flat-square">
</p>

<p align="center">
  <a href="https://t.me/papanmaya_bot"><img alt="Telegram Bot" src="https://img.shields.io/badge/Telegram-%40papanmaya__bot-26A5E4?style=flat-square&logo=telegram&logoColor=white"></a>
</p>

<p align="center">
  <strong>🤖 Try the bot: <a href="https://t.me/papanmaya_bot">https://t.me/papanmaya_bot</a></strong> — link your Chat ID in Settings to receive deadline alerts and use <code>/info</code> / <code>/list</code> anywhere.
</p>

<p align="center">
  <a href="#why-papanmaya-was-built">Why</a> •
  <a href="#the-problem">Problem</a> •
  <a href="#the-solution">Solution</a> •
  <a href="#features">Features</a> •
  <a href="#tech-stack">Stack</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api">API</a>
</p>

---

## Why PapanMaya Was Built

Most boards either overcomplicate or under-deliver. Teams juggle multiple apps for tasks, reminders, and chat — context gets lost, deadlines slip, and boards become archives of forgotten cards.

PapanMaya was built to answer a simple question: *what if a board respected focus, deadlines, and privacy by default?*

It started as an internal need for a private, fast, and opinionated workspace where every card has a clear place, every deadline is acknowledged, and nothing lingers longer than it should.

---

## The Problem

- **Scattered attention:** Tasks live in different tools, statuses are unclear, and priorities fade.
- **Silent deadlines:** Due dates pass without nudges, especially when notifications are opt-in or noisy.
- **Account and privacy friction:** Traditional auth adds password fatigue; shared boards often leak context between users.
- **Board rot:** Completed work piles up, making it harder to see what actually matters now.

For individuals and small teams, these frictions compound into missed commitments and lack of trust in the tool itself.

---

## The Solution

PapanMaya offers a single, calm surface that keeps work visible and accountable:

**Clarity over complexity.** Three clear states — *To Do, In Progress, Done* — with drag-and-drop and inline editing. No hidden menus, no extra layers.

**Security without friction.** Passwordless sign-in via authenticator codes. Each person’s board is isolated, so your tasks stay yours.

**Deadlines that speak.** Proactive reminders before a deadline, delivered where you already are, instead of another inbox to check. You choose whether to connect, and you control the channel.

**A board that stays clean.** Completed work doesn’t accumulate forever. You decide if and when done tasks should be removed automatically, so the board reflects the present — not the past.

**Conversation where work lives.** Quick, contextual updates via chat commands keep the board and your conversations in sync, without forcing you to live inside the app.

The result is a board that does less, but does it consistently: it shows what needs attention, reminds you at the right moment, and quietly tidies itself.

---

## Features

| Area | Details |
|------|---------|
| **Kanban** | Drag & drop `todo → in-progress → done`, inline edit, start/deadline, live counts, responsive 3-col → 1-col |
| **Auth** | Passwordless **TOTP** (RFC 6238, 30s window, ±1 step), QR via `uqr`, JWT cookie `httpOnly, Secure, 24h, HS256` |
| **Tasks** | Create / update / patch status / **manual Delete** (confirm) |
| **Auto-Delete** | Per-user `1 / 3 / 7 / 14 / 30 days` or `Disabled`. Purges `DONE` tasks where `updated_at` age exceeded — driven by Durable Object alarm |
| **Telegram** | Link `chat_id`, bot commands `/info` (stats) & `/list [status]`, deadline push **6h before** |
| **Alarms** | Single DO alarm multiplexed: next deadline `-6h` vs next auto-delete expiry vs daily fallback |
| **i18n** | Full English (`lang="en"`, `en-US` dates) |

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Runtime | **Cloudflare Workers** + **Durable Objects** (SQLite `storage.sql`) |
| Framework | **Hono 4** (`hono/jwt`, `hono/cookie`, `hono/html`) |
| Build | **Vite 8** + `@cloudflare/vite-plugin` + `vite-ssr-components` |
| Auth | Custom **TOTP** (`BASE32` + `HMAC-SHA1` via `WebCrypto`) + `hono/jwt HS256` |
| QR | **uqr** `renderSVG(otpauth://totp/…)` |
| Deploy | **Wrangler 4** |

---

## Architecture

```
Client ──► Hono Worker (src/index.tsx)
            ├─ /auth               → authRouter (TOTP → JWT cookie)
            ├─ /api/tasks          → taskRouter (authMiddleware → DO RPC)
            ├─ /user/*             → userRouter (telegram_id, auto_delete_days)
            └─ /webhook/telegram   → webhookRouter (public)
                       │
                       ▼
            Durable Object KanbanBoard (single "default-board")
            ├─ DatabaseService (SQLite: users, tasks)
            ├─ TelegramService (fetch api.telegram.org)
            └─ AlarmService (setAlarm / processAlarm)
```

**SQL Schema**

```sql
users (username PK, totp_secret, telegram_id, auto_delete_days INTEGER)
tasks (id PK, username, title, detail, status, start_date, deadline, created_at, updated_at, notified)
```

Migrations: `new_sqlite_classes: ["KanbanBoard"]` (`wrangler.jsonc:14`). Runtime `ALTER TABLE` backfill for existing DBs.

---

## Project Structure

```
src/
  index.tsx                      # Hono app + HS256 authMiddleware + routes
  types.ts                       # Env, User (auto_delete_days), Task (updated_at)
  durable-objects/KanbanBoard.ts # DO entry, RPC, alarm hook
  services/
    db.ts                        # SQLite + migrations + CRUD + auto-delete
    alarm.ts                     # Deadline + auto-delete alarm multiplexing
    telegram.ts                  # sendMessage, handleWebhook
  routes/
    auth.tsx                     # /auth/* (register init/verify, login, logout)
    tasks.tsx                    # GET/POST/PATCH/DELETE /api/tasks
    user.tsx                     # POST /user/settings/telegram, /auto-delete
    webhook.tsx                  # POST /webhook/telegram
  views/
    Layout.tsx                   # <html lang="en">, CSS vars, design system
    AuthUI.tsx                   # Login / Register / Verify (QR)
    KanbanUI.tsx                 # Board, columns, cards, dialogs
  utils/totp.ts                  # generateSecret (BASE32), verifyTOTP (±30s)
wrangler.jsonc
vite.config.ts
```

---

## Quick Start

**Prereqs:** Node 20+, `pnpm` (or npm), Cloudflare account for deploy.

```bash
# Install
pnpm install

# Dev (Vite + Miniflare + Durable Object)
pnpm dev
# → http://localhost:5173  (auth at /auth/register)

# Build check
pnpm build

# Generate types from wrangler config (optional)
pnpm run cf-typegen
```

Open `http://localhost:5173` → **Create Account** → Scan QR in Authenticator → **Verify & Sign Up** → Board.

---

## Configuration

`wrangler.jsonc`

```jsonc
{
  "name": "papanmaya",
  "compatibility_date": "2025-08-03",
  "main": "./src/index.tsx",
  "durable_objects": { "bindings": [{ "name": "KANBAN_BOARD", "class_name": "KanbanBoard" }] },
  "migrations": [{ "tag": "v1", "new_sqlite_classes": ["KanbanBoard"] }],
  "vars": {
    "TELEGRAM_BOT_TOKEN": "YOUR_BOT_TOKEN",
    "JWT_SECRET": "change-me-in-production"
  }
}
```

| Variable | Required | Notes |
|----------|----------|-------|
| `TELEGRAM_BOT_TOKEN` | No | For deadline alerts & bot. Leave placeholder to disable |
| `JWT_SECRET` | Yes | HS256 secret for `auth` cookie & pending TOTP token. Use `openssl rand -hex 32` |

For production, prefer `wrangler secret put JWT_SECRET` / `TELEGRAM_BOT_TOKEN` over plain `vars`.

---

## API Reference

**Auth (unprotected)**

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/auth/login` | — | HTML |
| `GET` | `/auth/register` | — | HTML |
| `POST` | `/auth/register/init` | `username` | HTML with QR + `pending_token` (JWT) |
| `POST` | `/auth/register/verify` | `pending_token, code` | `302 /` + `Set-Cookie: auth` (or 401/400) |
| `POST` | `/auth/login` | `username, code` | `302 /` + cookie |
| `GET` | `/auth/logout` | — | `302 /auth/login` |

**Tasks (protected: `auth` cookie, `authMiddleware` verifies HS256)**

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/api/tasks` | — | `Task[]` |
| `POST` | `/api/tasks` | `{title, detail, start_date, deadline}` | `{id, status:"todo"}` 201 |
| `PATCH` | `/api/tasks/:id` | `{status}` or `{title, detail, start_date, deadline}` | `{success:true}` |
| `DELETE` | `/api/tasks/:id` | — | `{success:true}` |

**User Settings (protected)**

| Method | Path | Body |
|--------|------|------|
| `POST` | `/user/settings/telegram` | `telegram_id` |
| `POST` | `/user/settings/auto-delete` | `auto_delete_days` (`""`=disabled, `1/3/7/14/30`) |

**Webhook (unprotected)**

| Method | Path | Body |
|--------|------|------|
| `POST` | `/webhook/telegram` | Telegram `Update` JSON |

All protected routes redirect to `/auth/login` if `auth` missing/invalid.

---

## Telegram Bot

> **Live bot:** **[@papanmaya_bot](https://t.me/papanmaya_bot)** — open the link, tap **Start**, then link your Chat ID in **Settings** to enable alerts.

1. Create your own bot via `@BotFather` → token → set `TELEGRAM_BOT_TOKEN` (skip if using the live bot above).
2. User links ID: **Settings** → paste `chat_id` (from `@userinfobot` or from the bot after `/start`) → **Save ID**.
3. Set webhook: `https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<your-worker>/webhook/telegram`

*For the hosted instance, the webhook for [@papanmaya_bot](https://t.me/papanmaya_bot) is already configured — just link your ID.*

**Commands**

```
/info                — Stats @user (counts per status)
/list todo           — Titles in todo
/list in-progress    — Titles in in-progress
/list done           — Titles in done
```

Deadline push: `🚨 DEADLINE REMINDER (< 6 HOURS)` fires 6h before `deadline` for tasks not `done`.

---

## Auto-Delete

Per-user `auto_delete_days` (`users` table). When `>0`, `AlarmService` runs:

```sql
DELETE FROM tasks
WHERE status='done' AND updated_at <= now - auto_delete_days*86400000
```

`updated_at` refreshed on every `updateTask`. Next alarm = `MIN(updated_at + days)` or `+24h` fallback. Configure in **Settings → Auto-Delete** (Disabled / 1 / 3 / 7 / 14 / 30 days).

Manual delete: **Task Details → 🗑️ Delete Task** (confirm) → `DELETE /api/tasks/:id`.

---

## Security

- **TOTP:** `BASE32` 20-byte secret, `HMAC-SHA1`, `±1` step window (90s tolerance) via `crypto.subtle`.
- **JWT:** `HS256` via `hono/jwt`, `verify(token, JWT_SECRET, 'HS256')`.
- **Cookie:** `httpOnly, Secure, Path=/, Max-Age=86400`.
- **Isolation:** All `tasks` filtered by `username` from JWT payload; DO is single instance but SQL `WHERE username=?` enforces per-user data.

---

## Deployment

```bash
# login once
npx wrangler login

# production secrets (optional)
echo "your-jwt-secret" | npx wrangler secret put JWT_SECRET
echo "123456:ABC..." | npx wrangler secret put TELEGRAM_BOT_TOKEN

# deploy (build + upload)
pnpm run deploy
# → https://papanmaya.<subdomain>.workers.dev
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Vite dev + Miniflare DO (http://localhost:5173) |
| `pnpm build` | Production build |
| `pnpm preview` | Build + preview |
| `pnpm deploy` | Build + `wrangler deploy` |
| `pnpm run cf-typegen` | Generate `CloudflareBindings` types |

---

## Roadmap

- [ ] Task search & filters, due-date sorting
- [ ] Bulk move / archive

---

## License

MIT
