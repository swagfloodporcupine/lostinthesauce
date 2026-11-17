# VibeShift — full-stack starter

A first migration from the supplied standalone HTML prototype to a Next.js + Supabase application. See `docs/BUILD-PLAN.md` for setup, scope and next milestones.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Create a Supabase project and run `supabase/migrations/0001_initial_schema.sql` before testing authentication or vendor data. Do not deploy this starter as a completed marketplace: the remaining modules and security review are listed in the build plan.
