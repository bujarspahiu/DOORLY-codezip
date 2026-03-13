# Doorly

A SaaS platform for window and door professionals to manage their business operations.

## Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite (dev server on port 5000)
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express (API server on port 3001)
- **Database**: SQLite (better-sqlite3) — single file at `data/doorly.db`
- **Routing**: React Router DOM v6
- **State**: TanStack Query + React Context
- **Forms**: React Hook Form + Zod

## Architecture
- In development: Vite dev server (port 5000) proxies `/api` requests to Express (port 3001)
- In production (VPS): Express serves both static files from `dist/` and the API on one port
- `data/` directory is in `.gitignore` — code updates never touch the database
- Database auto-creates tables and seeds default users on first run
- CORS enabled only in development mode

## Database Tables
- `users` — All users (admin + business)
- `customers` — Per-user customer records
- `quotes` — Quotes and invoices (distinguished by `doc_type`)
- `quote_items` — Line items for each quote/invoice
- `price_configs` — Per-user pricing (materials, glass, services, accessories as JSON)
- `company_profiles` — Per-user company profile (as JSON)

## Auth System
- Users authenticate with **username/password** via `/api/auth/login`
- Default test user: username `demo`, password `demo`
- Admin panel at `/adminstaff` with username `admin`, password `admin`
- Admin can create/manage business users from the panel
- Session persistence: user ID stored in localStorage, validated against API on reload

## Project Structure
- `server.js` - Express API server + SQLite database
- `src/main.tsx` - App entry point
- `src/App.tsx` - Root component with providers and routing
- `src/pages/` - Page components (Index, AdminStaff, NotFound)
- `src/components/public/` - Homepage, LoginModal
- `src/components/dashboard/` - Business dashboard components
- `src/components/admin/` - Admin panel
- `src/contexts/` - Auth, Language, App contexts
- `src/lib/userStore.ts` - User API client (fetch-based)
- `src/lib/database.ts` - Business data API client (fetch-based)

## Calculator & Templates
- **Template Gallery**: Modal overlay shows all templates from master sheet images
  - Windows: 48 templates (`/templates/windows.png`, 8x6 grid)
  - Doors: 38 templates (`/templates/doors.png`, 8x5 grid)
  - Sliding Doors: 15 templates (`/templates/sliding-doors.png`, 3x5 grid)
  - CSS `background-position` crops individual templates from master sheets
  - "Custom / No Template" option available
- **Material Sub-Categories**: PVC (6 colors × 5 brands), Aluminum (5 finishes × 6 brands), Wood and Steel flat
  - Expandable sections appear beneath selected material
- **Services & Accessories**: +/- buttons with quantity counters
  - Quantities factor into price calculation and quote line items
- **CalcItem** includes `templateId` field for tracking selected template
- Template selection is required before adding items to the list

## Price Management
- Per-category pricing: Materials, Glass, Services, Accessories
- Each item has an `enabled` flag — toggled via eye icon to show/hide in the calculator without deleting
- Visibility state persists in the price_configs JSON in the database

## Quote & Invoice System
- Quote line items include template thumbnail images (cropped from master sheets)
- Calculator items transfer as itemized line items with template metadata
- Quotes can be converted to invoices via "Convert to Invoice" button
- Print opens a clean print window with just the document content
- VAT rate: 18% (hardcoded for Kosovo market)

## Company Profile & Customers
- Company Profile: company info, bank account details, logo upload, branding colors
- Dashboard notification to complete profile disappears once name, phone, address are filled
- Customer: same fields as company (only name is mandatory)
- When creating quotes/invoices, user can select existing customer to auto-fill all fields

## Branding
- Logo: `/public/doorly-logo.png` (full), `/public/doorly-logo-nobg.png` (transparent)
- Used across: navbar, footer, dashboard sidebar, admin panel, admin login, favicon, OG image

## VPS Deployment
- **Build**: `npm install && npm run build`
- **Start**: `npm start` (or `NODE_ENV=production node server.js`)
- **PM2**: `pm2 start ecosystem.config.cjs`
- **Nginx**: Copy `nginx.conf.example`, update `server_name`, enable SSL with certbot
- **Data**: `data/doorly.db` is auto-created on first run; back it up regularly
- **Env**: Copy `.env.example` to `.env` and configure PORT
- **Node**: Requires Node.js >= 18

## Running
- Development: `npm run dev` — starts Express API + Vite dev server
- Production: `npm run build && npm start` — builds frontend, then starts Express serving everything
