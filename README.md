# PapanMaya — Dark Neobrutalism Kanban on Cloudflare Workers

<p align="center">
  <strong>Minimal, secure Kanban board with TOTP auth, Telegram alerts & auto-delete.</strong><br/>
  Dark neobrutalism design · 100% edge · No external DB
</p>

<p align="center">
  <a href="https://workers.cloudflare.com"><img alt="Cloudflare Workers" src="https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white"></a>
  <a href="https://hono.dev"><img alt="Hono" src="https://img.shields.io/badge/Hono-4.x-E36002?style=flat-square"></a>
  <a href="https://vite.dev"><img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white"></a>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-34D399?style=flat-square">
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#api">API</a> •
  <a href="#deployment">Deploy</a>
</p>

---

## ✨ Preview

```
┌─────────────────────────────────────────┐
│  PM  PAPANMAYA  Dark board • @alex      │  ⚙️ Settings   Logout │
├─────────────────────────────────────────┤
│  To Do (2)  + │ In Progress (1) │ Done (3) │
│  ┌─────────┐   ┌─────────┐    ┌─────────┐ │
│  │ Design  │   │ API     │    │ Release │ │
│  │ S: -    │   │ S: May  │    │ S: May  │ │
│  └─────────┘   └─────────┘    └─────────┘ │
└─────────────────────────────────────────┘
```

> **Dark neobrutalism** — `Space Grotesk + Inter + JetBrains Mono`, off-white ` #FAFAFA` on `#0B0B0E`, lime ` #E9FF70` accent, 1.5px borders, 5px hard shadows, 16px radius.

---

## 🚀 Features

| Area | Details |
|------|---------|
| **Kanban** | Drag & drop `todo → in-progress → done`, inline edit, start/deadline, live counts |
| **Auth** | Passwordless **TOTP** (RFC 6238, 30s window). QR via `uqr`, JWT cookie `httpOnly, 24h, HS256` |
| **Tasks** | Manual **Delete** (confirm) + create/update/patch status |
| **Auto-Delete** | Per-user setting `1/3/7/14/30 days` or `Disabled`. Purges `DONE` tasks where `updated_at` age exceeded — driven by DO Alarm |
| **Telegram** | Link `chat_id` via `/user/settings/telegram`, bot commands `/info` (stats) & `/list [status]`, deadline push **6h before** |
| **Alarms** | Single DO alarm multiplexed: next deadline `-6h` vs next auto-delete expiry vs daily fallback |
| **Design** | Dark neobrutalism, responsive (3-col → 1-col), empty states, backdrop blur dialogs |
| **i18n** | Full English (`lang="en"`, `en-US` dates) |

---

## 🧱 Tech Stack

| Layer | Choice |
|-------|--------|
| Runtime | **Cloudflare Workers** + **Durable Objects** (SQLite `storage.sql`) |
| Framework | **Hono 4** (`hono/jwt`, `hono/cookie`, `hono/html`) |
| Build | **Vite 8** + `@cloudflare/vite-plugin` + `vite-ssr-components` |
| Auth | Custom **TOTP** (`BASE32` + `HMAC-SHA1` via `WebCrypto`) + `hono/jwt HS256` |
| QR | **uqr** `renderSVG(otpauth://totp/…)` |
| Deploy | **Wrangler 4** |

---

## 🏗️ Architecture

```
Client (Space Grotesk)  ──►  Hono Worker (src/index.tsx)
                               ├─ /auth          → authRouter (TOTP → JWT cookie)
                               ├─ /api/tasks     → taskRouter (authMiddleware → DO RPC)
                               ├─ /user/*        → userRouter (telegram_id, auto_delete_days)
                               └─ /webhook/telegram → webhookRouter (public)
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

## ⚡ Quick Start

**Prereqs:** Node 20+, `pnpm` (or npm), Cloudflare account for deploy.

```bash
# 1. Install
pnpm install

# 2. Dev (Vite + Miniflare + DO)
pnpm dev
# → http://localhost:5173  (auth at /auth/register)

# 3. Build check
pnpm build

# 4. Typegen (optional)
pnpm run cf-typegen
```

Open `http://localhost:5173` → **Create Account** → Scan QR in Authenticator → **Verify & Sign Up** → Board.

---

## 🔧 Configuration

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

| Var | Required | Notes |
|-----|----------|-------|
| `TELEGRAM_BOT_TOKEN` | No | For deadline alerts & bot. Leave placeholder to disable |
| `JWT_SECRET` | Yes | HS256 secret for `auth` cookie & pending TOTP token. Use `openssl rand -hex 32` |

> For local dev, `vars` are injected via Miniflare. For production, set via `wrangler secret put JWT_SECRET` or `vars` in dashboard. `ppp/` prototype is git-ignored and never deployed (` .gitignore:37`).

---

## 📁 Project Structure

```
src/
  index.tsx                 # Hono app + authMiddleware (HS256) + routes
  types.ts                  # Env, User (auto_delete_days), Task (updated_at)
  durable-objects/KanbanBoard.ts
  services/
    db.ts                   # SQLite, migrations, CRUD, auto-delete queries
    alarm.ts                # Multiplexed alarm: deadline + auto-delete
    telegram.ts             # sendMessage, handleWebhook (/info, /list)
  routes/
    auth.tsx                # /auth/* (register init/verify, login, logout)
    tasks.tsx               # GET/POST/PATCH/DELETE /api/tasks
    user.tsx                # POST /user/settings/telegram, /auto-delete
    webhook.tsx             # POST /webhook/telegram
  views/
    Layout.tsx              # <html lang="en">, design system, CSS vars
    AuthUI.tsx              # Login / Register / Verify (QR)
    KanbanUI.tsx            # Board, columns, cards, dialogs, JS
  utils/totp.ts             # generateSecret (BASE32), verifyTOTP (±30s)
wrangler.jsonc
vite.config.ts
```

---

## 🔌 API

**Auth (unprotected)**

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/auth/login` | — | HTML |
| `GET` | `/auth/register` | — | HTML |
| `POST` | `/auth/register/init` | `username` | HTML with QR + `pending_token` (JWT) |
| `POST` | `/auth/register/verify` | `pending_token, code` | `302 /` + `Set-Cookie: auth` (or 401/400) |
| `POST` | `/auth/login` | `username, code` | `302 /` + cookie |
| `GET` | `/auth/logout` | — | `302 /auth/login` (clears cookie) |

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

## 🤖 Telegram Bot

1. Create bot via `@BotFather` → token → set `TELEGRAM_BOT_TOKEN`.
2. User links ID: Board → **Settings** → paste `chat_id` (from `@userinfobot`) → **Save ID**.
3. Set webhook: `https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<your-worker>/webhook/telegram`

**Commands**

```
/info                — PapanMaya Stats @user (counts per status)
/list todo           — Titles in todo
/list in-progress    — Titles in in-progress
/list done           — Titles in done
```

Deadline push: `🚨 DEADLINE REMINDER (< 6 HOURS)` fires 6h before `deadline` for tasks not `done` & not `notified`.

---

## 🗑️ Auto-Delete

Per-user `auto_delete_days` (`users` table). When `>0`, `AlarmService` daily (or at next expiry) runs:

```sql
DELETE FROM tasks
WHERE status='done' AND updated_at <= now - auto_delete_days*86400000
```

`updated_at` refreshed on every `updateTask` (status or content). Next alarm = `MIN(updated_at + days)` or `+24h` fallback. Configure in **Settings → Auto-Delete** (Disabled / 1 / 3 / 7 / 14 / 30 days). Pill shows `ACTIVE • 7 days` or `INACTIVE`.

Manual delete: **Task Details → 🗑️ Delete Task** (confirm) → `DELETE /api/tasks/:id`.

---

## 🔒 Security

- **TOTP**: `BASE32` 20-byte secret, `HMAC-SHA1`, `±1` step window (90s tolerance). Window verified via `crypto.subtle`.
- **JWT**: `HS256` via `hono/jwt`, `verify(token, JWT_SECRET, 'HS256')`. Pending token & auth cookie both signed with `JWT_SECRET`.
- **Cookie**: `httpOnly, Secure, Path=/, Max-Age=86400` (auth), `deleteCookie` on logout.
- **Isolation**: All `tasks` filtered by `username` from JWT payload; DO is single instance but SQL `WHERE username=?` enforces per-user data.

---

## 🚀 Deployment

```bash
# login once
npx wrangler login

# production secrets (optional, overrides vars)
echo "your-jwt-secret" | npx wrangler secret put JWT_SECRET
echo "123456:ABC..." | npx wrangler secret put TELEGRAM_BOT_TOKEN

# deploy (build + upload)
pnpm run deploy
# → https://papanmaya.<subdomain>.workers.dev
```

`wrangler deploy` builds `src/index.tsx` and migrates `KanbanBoard` as SQLite DO. Existing DBs auto-migrate via `ALTER TABLE` backfill.

---

## 🛠️ Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Vite dev + Miniflare DO (http://localhost:5173) |
| `pnpm build` | Production build (`dist/`) |
| `pnpm preview` | Build + preview |
| `pnpm deploy` | Build + `wrangler deploy` |
| `pnpm run cf-typegen` | Generate `CloudflareBindings` types |

---

## 🗺️ Roadmap

- [ ] Task search & filters, due-date sorting
- [ ] Bulk move / archive
- [ ] WebSocket live updates (DO `fetch` + `WebSocket`)
- [ ] i18n toggle, light theme
- [ ] Playwright e2e (register → create → drag → delete)

---

## 🤝 Contributing

PRs welcome. Keep `ppp/` prototype git-ignored; feature branches should rebase on `master` and keep commits sequential with `ppp/` excluded (see `git log --oneline`).

```bash
git add src/...   # never git add ppp/
```

---

## 📄 License

MIT — see `LICENSE` (or add one). Built with Hono + Cloudflare Workers.

<p align="center">Made with lime <code>#E9FF70</code> and hard shadows.</p>
