# VibeShift — CLAUDE.md

VibeShift is a South African events marketplace. Next.js 16 App Router + TypeScript + Tailwind CSS 4 + React 19. Supabase (PostgreSQL + Auth + SSR) via `@supabase/ssr`. Dark-mode DM Sans aesthetic.

## Commands
- `npm run dev` — start dev server (Turbopack)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run start` — serve production build

## Key directories
- `app/` — App Router routes: `/` (homepage marketplace), `/directory` (+ `/[category]`), `/dashboard` (vendor + client dashboards), `/vendors/[slug]`, `/join`, `/login`, `/auth`, `/account`, `/events`
- `components/` — client components (dashboard-shell, vendor-dashboard, client-dashboard, vendor-profile-dialog, vendor-listing-card, category-bar, directory-filters, booking-agreement-panel, vendor-media-kit, site-header, event-crew-builder)
- `lib/` — shared logic: `demo-session.ts` (HMAC cookie session), `mock-listings.ts` (12 sample vendors), `directory-types.ts` (categories, `formatZar`), `crew-store.ts`, `vendor-documents.ts`, `supabase/` (client, server)
- `supabase/migrations/` — `0001_initial_schema.sql` (authoritative DDL)
- `app/motion.css`, `app/marketplace.css`, `app/editorial.css`, `app/responsive-3d.css` — styling layers

## Key rules
- Project root is `C:\Users\samue\Downloads\vibeshift-fullstack\vibeshift-fullstack`. The default shell cwd is `C:\claudepro2` — always pass the explicit path to Glob/Grep/Read/Write tools.
- Prefer fast CLI replacements over standard Unix tools in shell commands: `rg` (search), `fd` (find files), `sd` (find & replace), `bun` (run scripts/deps). They live in WinGet package dirs; see the PowerShell profile to add them to PATH.
- Supabase identity is bridged from the demo cookie session (`vs_session`) to real auth users via the service-role key (`admin.createUser`, idempotent). The service-role client bypasses RLS — enforce participant authorization in code.
- Currency is South African Rands; use `formatZar()` from `lib/directory-types` for display.
- Vendor listing categories are typed in `lib/directory-types.ts` (`listingCategories`) and mirrored in the `vendor_category` DB enum; keep them in sync.
