# VibeShift full-stack conversion

## Included in this foundation milestone
- Next.js App Router + TypeScript application.
- Existing visual direction carried across: near-black `#0b0a0f`, surface `#16151f`, warm off-white `#f4efe6`, blue `#2f80ff`, mint `#2ee6a8`, rounded controls and nightlife-inspired styling.
- Supabase SSR/browser clients, email/password sign-up and sign-in, protected account route.
- Published-vendor query on the homepage and a vendor card component.
- Initial schema for profiles, listings, media, events, quote requests, bookings, conversations, messages, reviews and availability, with initial RLS policies.
- Original single-file prototype retained at `public/prototype-reference.html` for feature parity and visual reference. It is not the production data layer.

## Local setup
1. Install Node.js 20.9+ and npm.
2. Create a Supabase project.
3. Copy `.env.example` to `.env.local` and enter the Supabase project URL and publishable/anon key.
4. Run `supabase/migrations/0001_initial_schema.sql` in Supabase SQL Editor.
5. Run `npm install`, then `npm run dev`.
6. Configure Supabase Auth Site URL and email redirect URLs for local and production environments.

## Not production-ready yet
Payments, escrow, payouts, contracts/e-signatures, tax invoices, notifications, WhatsApp delivery, portfolio upload processing, admin moderation and vendor verification are not implemented. RLS needs security testing and refinement before launch. POPIA notices, privacy policy, terms, tax treatment and payment settlement structure require South African professional review. Never expose a service-role key in a browser bundle.

## Next implementation sequence
1. Vendor onboarding, profile editor, portfolio uploads and availability.
2. Full directory search/filtering and vendor detail pages.
3. Planner event workspace with multi-vendor requests and quote comparison.
4. Shared conversations and booking state machine with server-side authorization.
5. Agreement versioning, invoice generation and audit trail.
6. Payment provider integration after the settlement/refund model is decided.
7. Admin review queue, moderation, reporting and operational controls.

## Prototype parity notes
The original HTML contains a DJ-first directory, demo listings, browser-local accounts, inbox, booking flow, calendars, availability, shortlists, invoice/contract printouts and a WebGL background. These should be migrated module-by-module into database-backed pages and server actions. Do not reuse localStorage for authentication, private messages, payment state or real bookings.

The public directory reads only the `public_vendor_profiles` view for supplier display names and avatars; it does not need public access to private profile fields such as phone numbers.
