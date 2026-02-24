# ClusterGrowth SaaS

A cross-business customer sharing and growth platform for local businesses to generate and redeem cluster-wide coupons.

## Architecture

- **Frontend**: React + TypeScript + Vite, served at port 5000
- **Routing**: React Router DOM (HashRouter) for SPA navigation
- **State**: React Context API (AuthContext) for authentication
- **Data**: mockService (client-side mock data service)
- **Styling**: Tailwind CSS (CDN via index.html)
- **PDF**: jsPDF for coupon PDF generation
- **Charts**: recharts for analytics visualizations

## File Structure

```
client/src/
  App.tsx              - Root component with HashRouter + ProtectedRoute logic
  main.tsx             - Entry point
  types/types.ts       - All shared TypeScript types and enums
  context/
    AuthContext.tsx    - Authentication context and login logic
  pages/
    Login.tsx          - Login page with 4 role modes
    Dashboard.tsx      - Business owner dashboard
    IssueCoupon.tsx    - Coupon issuance page
    RedeemCoupon.tsx   - Coupon redemption page
    Settings.tsx       - Business settings
    Analytics.tsx      - Business analytics/reports
    ActivityLog.tsx    - Business activity log
    AdminDashboard.tsx - Super/Sub admin dashboard
    AdminClusters.tsx  - Cluster management
    AdminBusinesses.tsx- Business management
    AdminReports.tsx   - Admin reports
    AdminActivityLog.tsx - Admin activity log
    AdminSettings.tsx  - Admin settings (Super Admin only)
  components/
    Layout.tsx         - Main layout with sidebar navigation
    StatCard.tsx       - Reusable stats card component
  services/
    mockService.ts     - Client-side mock data service (localStorage-backed)
index.html             - HTML entry point with Tailwind CDN
vite.config.ts         - Vite config with @ alias pointing to client/src
```

## User Roles

- **SUPER_ADMIN** - Full platform access, can manage all clusters/businesses/admins
- **SUB_ADMIN** - Limited admin with permission-based access
- **BUSINESS_OWNER** - Can issue/redeem coupons, view reports, manage settings
- **SUB_MERCHANT** - Counter staff, can only redeem coupons

## Key Features

- Role-based routing and access control
- Cluster-wide coupon issuance (bulk and single)
- Cross-business coupon redemption with discount rules
- Business subscription management with expiry dates
- PDF coupon generation and download
- Analytics and activity logging
- Sub-admin and sub-merchant account management

## Dependencies

- react, react-dom (v19)
- react-router-dom (v7)
- lucide-react (icons)
- recharts (charts)
- jspdf (PDF generation)

## Running

The "Start application" workflow runs `npm run dev` which starts the Vite dev server on port 5000.
