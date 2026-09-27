# SparkleClean Kenya — Deployment & Operations

## Production topology

| Component | Project (Vercel) | Production URL |
|---|---|---|
| Frontend (Vite + React) | `sparkleclean-ke-frontend` | https://sparkleclean-ke-frontend.vercel.app |
| Backend API (Express) | `sparkleclean-ke` | https://sparkleclean-ke.vercel.app |
| Backend API (alias used by frontend build) | `sparkle-clean-backend` | https://sparkle-clean-backend.vercel.app |
| MongoDB | MongoDB Atlas (cluster `sparkleclean`) | `MONGO_URI` env var |

> Both backend projects deploy the **same** Express code. The frontend build points at
> `https://sparkle-clean-backend.vercel.app/api` via `VITE_API_URL`.

Deploys are driven by the Vercel GitHub integration: **pushing to `main` auto-deploys all
three projects** (each uses its own root directory). Env-var changes require a redeploy to
take effect.

## Environment variables

### `sparkleclean-ke-frontend` (build-time, type `Config`)
- `VITE_API_URL=https://sparkle-clean-backend.vercel.app/api`

### `sparkle-clean-backend` and `sparkleclean-ke` (runtime)
- `MONGO_URI` (secret)
- `JWT_SECRET` (secret)
- `NODE_ENV=production`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`
- `ADMIN_EMAIL=admin@sparkleclean.co.ke`
- `FRONTEND_URL=https://sparkleclean-ke-frontend.vercel.app`
- `CORS_ORIGINS=https://sparkleclean-ke-frontend.vercel.app,http://localhost:5173,http://localhost:5174,http://localhost:5175`
- `PORT=5000` (optional), `UNSPLASH_ACCESS_KEY`

Values are mirrored from `backend/.env`. Re-add them on the dashboard (Settings → Environment
Variables) for each project. Missing `CORS_ORIGINS` reverts CORS to localhost-only and produces
browser `Failed to fetch` errors from any deployed origin.

## ⚠️ MongoDB reachability from Vercel (REQUIRED for login to work)

Login requests return `500 Server error during login` with ~10 s latency while the whole
Vercel platform **cannot reach the Atlas cluster** (MongoDB connection times out). Local
connections work because your home/office IP is allowlisted.

Fix — in MongoDB Atlas → Network Access, allow Vercel's egress addresses. Easiest for this
single-admin app: **Add IP address `0.0.0.0/0`** (permissive, `mongodb+srv` still requires
valid credentials), or add the specific Vercel IP ranges for `iad1`
(76.76.21.0/24 and peers per https://vercel.com/docs/ip-ranges).

## "Failed to fetch" on admin login — root cause (2016-09-27)

The frontend hardcoded `http://localhost:5000/api` in `frontend/src/lib/api.ts`, so in
production every request targeted the *visitor's own* localhost. Fixed by reading
`import.meta.env.VITE_API_URL` (with `frontend/.env.production` and the Vercel env var).
CORS was also localhost-only; now driven by `CORS_ORIGINS`.

## Password reset flow

- `POST /api/auth/forgot-password` — returns the **same** generic message whether or not
  the email exists (anti-enumeration). Only the SHA-256 hash of the token is stored, with a
  30-minute expiry. A branded reset email is sent via Gmail SMTP in the background.
- `POST /api/auth/reset-password` — verifies the hashed token + expiry, hashes the new
  password via the model's pre-save hook, clears the token (single-use).
- The WhatsApp button is a **manual tap-to-send convenience link** (`wa.me` deep link) ONLY —
  automated WhatsApp messaging requires a paid Meta Business API and is intentionally not
  implemented. See code comments in `backend/src/controllers/auth.controller.ts`.

## Local development

```bash
cd backend  && npm install && npm run dev   # API on :5000, reads backend/.env
cd frontend && npm install && npm run dev   # UI on :5173
```

Build checks: `cd backend && npm run build` (tsc) and `cd frontend && npm run build`
(tsc + vite).