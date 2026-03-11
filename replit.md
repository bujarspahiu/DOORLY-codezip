# Doorly

A SaaS platform for window and door professionals to manage their business operations.

## Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite (dev server on port 5000)
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend/Database**: Supabase (for data), localStorage (for user auth)
- **Routing**: React Router DOM v6
- **State**: TanStack Query + React Context
- **Forms**: React Hook Form + Zod

## Auth System
- Users authenticate with **username/password** (stored in localStorage)
- Default test user: username `demo`, password `demo`
- Admin panel at `/adminstaff` with username `admin`, password `admin`
- Admin can create/manage business users from the panel
- User store: `src/lib/userStore.ts`

## Project Structure
- `src/main.tsx` - App entry point
- `src/App.tsx` - Root component with providers and routing
- `src/pages/` - Page components (Index, AdminStaff, NotFound)
- `src/components/public/` - Homepage, LoginModal
- `src/components/dashboard/` - Business dashboard components
- `src/components/admin/` - Admin panel
- `src/contexts/` - Auth, Language, App contexts
- `src/lib/` - Supabase client, database functions, user store

## Company Profile & Customers
- Company Profile has: company info (mandatory), bank account details (mandatory), logo upload, branding colors
- Customer has: same fields as company (name, email, phone, address, city, country, reg number, VAT, bank details) but only name is mandatory
- Company profile data is persisted in localStorage per user (`doorly_company_{userId}`)
- When creating quotes/invoices, user can select existing customer to auto-fill all fields
- Invoice/quote preview shows both company and customer details, including bank payment details and company logo

## Branding
- Logo: `/public/doorly-logo.png` (full), `/public/doorly-logo-nobg.png` (transparent)
- Used across: navbar, footer, dashboard sidebar, admin panel, admin login, favicon, OG image
- All external CDN image references replaced with Unsplash stock photos

## Running
- `npm run dev` - Start dev server on port 5000
