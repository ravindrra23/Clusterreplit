# ClusterGrowth SaaS

A cross-business customer sharing and growth platform allowing local businesses to generate and redeem cluster-wide coupons.

## Architecture

- **Frontend** — React + TypeScript + Vite at port 5000
- **Email Server** — Minimal Express server at port 3001 (Gmail SMTP via Nodemailer)
- **Routing** — React Router DOM v7 with HashRouter for SPA navigation
- **Auth** — Custom AuthContext with 4 user roles, all password-protected
- **Data** — mockService using localStorage for UI data + PostgreSQL for cross-device auth sync
- **Styling** — Tailwind CSS v3 + tailwindcss-animate (PostCSS build)
- **PDF** — jsPDF for bulk coupon PDF generation and printing
- **Charts** — recharts for analytics visualizations

## Development Workflow

```
npx tsx server/emailServer.ts &   (port 3001, email API)
npx vite --config vite.replit.config.ts  (port 5000, frontend with /api proxy)
```

## Entry Point Chain

```
index.html → /client/src/main.tsx → @/App.tsx
```

The `@/` alias maps to `./client/src/` (configured in both vite.config.ts and tsconfig.json).

## User Roles & Login Modes

| Role | Mode | Login Route | Description |
|------|------|-------------|-------------|
| `SUPER_ADMIN` | SUPER | `/superadmin-login-str` | Email + password (default: admin@clustergrowth.com / admin@123) |
| `SUB_ADMIN` | STAFF | `/superadmin-login-str` | Email + password, permission-based access |
| `BUSINESS_OWNER` | MERCHANT | `/login-merchant-str` | Login ID + password (set by admin) |
| `SUB_MERCHANT` | COUNTER | `/login-merchant-str` | Merchant name + email + password (staff at counter) |

## Password Recovery System

All 4 roles support forgot-password via email OTP:
1. User clicks "Forgot Password" on Login screen
2. App generates 6-digit OTP (10-min expiry) stored in localStorage
3. OTP sent to registered email via SMTP (Gmail)
4. User enters OTP → sets new password
5. New password saved back to localStorage

### Email Configuration (Required for OTP)
Set these in Replit environment secrets:
- `SMTP_EMAIL` — Gmail address that sends recovery emails
- `SMTP_APP_PASSWORD` — Gmail App Password (16-char, from Google Account security)

## Cross-Device Auth (PostgreSQL Sync)

All authentication data is synced to PostgreSQL so login works from any device:
- **auth_businesses** — Stores loginId, ownerPassword, full business data (JSONB)
- **auth_super_admin** — Stores super admin email + password
- **auth_sub_admins** — Stores sub-admin credentials + data (JSONB)
- **auth_clusters** — Stores cluster data for hydration on new devices
- mockService auto-syncs to backend on every create/update/delete
- On login, credentials are verified against PostgreSQL (falls back to localStorage)
- On merchant login, business + cluster data is hydrated into localStorage

## Admin Security Features

- **Super Admin Credentials** — Manageable from Admin Settings page (email + password)
- **Sub-Admin Management** — Create/edit/delete with email + password
- **Business Owner PIN** — Default password `1234`, set per-business by admin
- **Sub-Merchant** — Email + password set in business Settings page

## Page Structure

### Business Owner Pages
- `/dashboard` — Stats, recent activity, cluster live coupons, broadcast notifications
- `/issue` — Bulk coupon generation (with 40-day lock), recent activity log
- `/redeem` — Coupon code verification and redemption with bill amount
- `/settings` — Profile, discount rules, sub-merchant credentials, lucky draw, email integration
- `/reports` — Analytics with charts (coupons issued vs redeemed)
- `/activity` — Activity log with coupon history

### Admin Pages
- `/admin` — Dashboard with stats, broadcast tool, quick links
- `/admin/clusters` — Create/edit/delete clusters, view business list, detail panel
- `/admin/businesses` — Register/edit/delete businesses, toggle bulk access, unlock issue lock
- `/admin/reports` — Platform-wide coupon and revenue reports
- `/admin/activity` — Cross-business activity log with PDF export
- `/admin/settings` — Sub-admin management + Super Admin credentials (SUPER_ADMIN only)

## Key Business Logic (in mockService.ts)

- **Clusters** — Group of businesses that share a coupon ecosystem
- **Bulk Coupons** — Business can issue to entire cluster; 40-day reissue lock enforced
- **Single Coupons** — Issued to individual customers with phone/email
- **Redemption** — Any business in cluster can redeem; discount rule applied from origin biz
- **Lucky Draw** — Optional gift attached to coupon, shown on redemption
- **Sub-Merchant** — Counter staff who can only redeem (set in Settings)
- **Sub-Admin** — Platform staff with granular permission flags

## Installed Packages

- `react`, `react-dom` (v19)
- `react-router-dom` (v7)
- `lucide-react` — icons
- `recharts` — charts
- `jspdf` — PDF generation
- `tailwindcss`, `autoprefixer`, `postcss` — CSS build
- `tailwindcss-animate` — animations (animate-in, fade-in, slide-in, zoom-in)
- `express`, `cors` — email API server
- `nodemailer` — Gmail SMTP email sending
- `pg` — PostgreSQL client for cross-device auth sync
- `tsx` — TypeScript execution for email server

## Production Deployment

- `npm run build` — Builds Vite frontend to `dist/` (preserves `dist/index.cjs`)
- `node ./dist/index.cjs` — Production server (email API + serves static files)
- `SMTP_EMAIL` and `SMTP_APP_PASSWORD` env vars must be set for email to work
