# ElectroBuddy Project Reference Guide

## 1. Project Overview

**ElectroBuddy** is a professional electrical services and e-commerce platform that allows users to:
- Book electrical services
- Purchase electrical products
- Track orders and bookings
- Manage subscriptions
- Technicians can manage their assigned jobs

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn-ui components
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **State Management**: Zustand + React Query
- **Routing**: React Router DOM v6
- **Authentication**: Supabase Auth
- **Payments**: Razorpay integration

---

## 2. Project Structure

```
electroobuddy/
├── src/
│   ├── pages/              # All page components
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── user/           # User dashboard pages
│   │   ├── technician/     # Technician portal pages
│   │   └── *.tsx          # Public pages (Index, Services, Products, etc.)
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # shadcn-ui components
│   │   └── *.tsx         # Custom components (Navbar, Footer, etc.)
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.tsx   # Authentication hook
│   │   └── useNotifications.ts
│   ├── contexts/          # React contexts
│   │   └── CartContext.tsx
│   ├── stores/            # Zustand stores
│   ├── lib/               # Utilities
│   ├── integrations/      # Third-party integrations
│   │   └── supabase/     # Supabase client & types
│   ├── data/              # Static data (services.ts, testimonials.ts)
│   └── types/             # TypeScript types
├── supabase/
│   ├── migrations/        # Database migrations (SQL)
│   ├── functions/         # Edge Functions (TypeScript)
│   └── config.toml        # Supabase config
└── public/               # Static assets
```

---

## 3. User Roles & Access

| Role | Path | Description |
|------|------|-------------|
| Public | `/` | Landing page, services, products |
| User | `/dashboard/*` | Login, bookings, orders, profile |
| Admin | `/admin/*` | Full platform management |
| Technician | `/technician/*` | Job management, profile |

### Key Routes

**Public Pages:**
- `/` - Homepage
- `/services` - Service listing
- `/products` - Product catalog
- `/booking` - Service booking form
- `/track-booking` - Track booking status
- `/cart` - Shopping cart
- `/checkout` - Checkout

**User Dashboard:**
- `/login` - User login/signup
- `/dashboard` - User dashboard home
- `/dashboard/bookings` - My bookings
- `/dashboard/orders` - My orders
- `/dashboard/subscriptions` - My subscriptions
- `/dashboard/profile` - Profile settings

**Admin Dashboard (hidden routes):**
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin home
- `/admin/products` - Product management
- `/admin/services` - Service management
- `/admin/bookings` - Booking management
- `/admin/orders` - Order management
- `/admin/users` - User management
- `/admin/technicians` - Technician management
- `/admin/subscriptions` - Subscription management

**Technician Portal (hidden routes):**
- `/technician/login` - Technician login
- `/technician/dashboard` - Technician home
- `/technician/bookings` - Assigned jobs
- `/technician/profile` - Profile

---

## 4. Database Schema Overview

### Core Tables

**users & profiles:**
- `auth.users` - Supabase auth
- `profiles` - User profile info (name, phone, address)
- `user_roles` - Role assignment (admin, user, technician)

**Services & Bookings:**
- `services` - Available electrical services
- `bookings` - Service bookings with status tracking

**E-commerce:**
- `products` - Electrical products
- `categories` - Product categories
- `coupons` - Discount codes
- `orders` - Customer orders
- `order_items` - Order line items

**Technicians:**
- `technicians` - Registered technicians with skills

**Subscriptions:**
- `subscription_plans` - Subscription packages
- `subscription_orders` - Subscription purchases

**Notifications:**
- `notifications` - In-app notifications
- `push_subscriptions` - Push notification endpoints

---

## 5. Key Integrations

### Supabase
- **Client**: `src/integrations/supabase/client.ts`
- **Types**: `src/integrations/supabase/types.ts`
- **Auth**: Uses Supabase Auth with email/password

### Razorpay
- Subscription payments
- Webhook handling in edge functions

### Shiprocket
- Shipping integration for orders
- Order creation and tracking

### Push Notifications
- Web Push API
- VAPID keys for authentication
- Service worker: `public/sw.js`

---

## 6. State Management

**Global State:**
- `CartContext` - Shopping cart state
- `useAuth` hook - User authentication state

**Server State:**
- React Query (`@tanstack/react-query`) - For API data fetching

**Local State:**
- Zustand stores - For UI state (services store)

---

## 7. Key Features

### Service Booking
- Form at `/booking`
- Modal booking popup (appears after 30min or on revisit)
- Booking status tracking at `/track-booking`

### E-commerce
- Product catalog at `/products`
- Product details at `/products/:slug`
- Cart and checkout flow
- Order tracking

### Subscriptions
- `/subscriptions` - Plan listing
- Razorpay integration for payments
- User subscription management

### Notifications
- In-app notifications
- Push notifications (browser)
- Email notifications (edge function)

---

## 8. Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

---

## 9. Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

---

## 10. Database Migrations

All migrations are in `supabase/migrations/` - run in chronological order.

Key migrations:
- `20260323000000_complete_database_schema.sql` - Core schema
- `20260306_ecommerce.sql` - E-commerce tables
- `20260322_create_technicians_table.sql` - Technician system
- `20260418_create_offer_system.sql` - Offers/coupons

---

## 11. Key Files Reference

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main app with all routes |
| `src/hooks/useAuth.tsx` | Auth logic |
| `src/contexts/CartContext.tsx` | Cart state |
| `src/integrations/supabase/client.ts` | DB client |
| `src/pages/admin/AdminDashboard.tsx` | Admin home |
| `src/pages/user/UserDashboard.tsx` | User home |
| `src/pages/technician/TechnicianDashboard.tsx` | Technician home |

---

## 12. Admin Features

- Dashboard with stats/charts
- Product CRUD
- Order management
- Service management
- User management
- Technician management
- Coupon/Category management
- Shipping settings
- Subscription management
- Notifications management

---

## 13. Common Tasks

**Add new product category:**
1. Add to admin categories page
2. Or run SQL in Supabase

**Add new service:**
1. Add via admin services page
2. Or insert into `services` table

**Create admin user:**
1. Sign up via user auth
2. Manually insert into `user_roles` with role='admin'

**Add technician:**
1. Via `/technician/signup` (self-registration)
2. Or admin creates via `/admin/technicians`