## Packages
recharts | Data visualization for analytics and reports
date-fns | Date formatting for coupons and tables
react-hook-form | Form state management
@hookform/resolvers | Zod validation resolver for forms
zod | Schema validation
lucide-react | Icons

## Notes
- Uses Replit Auth (OIDC). Login is handled via `window.location.href = '/api/login'`
- Sidebar layout using existing shadcn `SidebarProvider`
- App expects `/api/profile` to return `{ role: string, businessId?: number, ... }`
- Static images for landing page: using Unsplash placeholders
