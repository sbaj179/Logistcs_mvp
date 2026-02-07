# Logistics Operating System (LOS)

Operational control core for logistics execution: immutable events, structured cases, document evidence, and idle loss visibility.

## Stack
- Next.js 16 App Router with Turbopack
- TypeScript
- Supabase-ready auth/database integration
- CSS Modules (no Tailwind)

## Getting Started
```bash
npm install
npm run dev
```

## Supabase Demo Setup
1. Create a Supabase project and run the schema at `src/db/schema.sql`.
2. Create `.env.local` with:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_DEMO_TENANT_ID`

The app resolves the tenant from `tenant_users` after a verified email login. Demo-only RLS policies are permissive; tighten them for production.

### Auth Notes
- Signup uses email + password and requires email verification before app access.
- The Supabase trigger creates a tenant and `tenant_users` membership on signup.
