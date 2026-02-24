# ClusterGrowth SaaS

A cross-business customer sharing and growth platform allowing local businesses to generate and redeem cluster-wide coupons.

## Architecture

- **Frontend only** — React + TypeScript + Vite at port 5000
- **Routing** — React Router DOM v7 with HashRouter for SPA navigation
- **Auth** — Custom AuthContext with 4 user roles (no backend auth)
- **Data** — mockService using localStorage for full persistence
- **Styling** — Tailwind CSS v3 + tailwindcss-animate (PostCSS build)
- **PDF** — jsPDF for bulk coupon PDF generation and printing
- **Charts** — recharts for analytics visualizations

## Entry Point Chain

```
index.html → /client/src/main.tsx → @/App.tsx
```

The `@/` alias maps to `./client/src/` (configured in both vite.config.ts and tsconfig.json).

## User Roles & Login Modes

| Role | Mode | Description |
|------|------|-------------|
| `SUPER_ADMIN` | SUPER | Full platform access, one-click login |
| `SUB_ADMIN` | STAFF | Email + password, permission-based access |
| `BUSINESS_OWNER` | MERCHANT | Select business from dropdown |
| `SUB_MERCHANT` | COUNTER | Merchant name + email + password (staff at counter) |

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
- `/admin/settings` — Sub-admin management (SUPER_ADMIN only)

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
