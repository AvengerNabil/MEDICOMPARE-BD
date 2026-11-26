# MediCompare BD — Master Deployment Guide
**Target Architecture:**
- **Frontend:** Next.js 14 on Vercel
- **Backend:** FastAPI on Render (or fully serverless Next.js API on Vercel)
- **Database:** Supabase PostgreSQL (`https://nfrzwsqudmvrluysqjfo.supabase.co`)

---

## 1. Supabase PostgreSQL Deployment (Phase 2 & 3)

### Step 1: Execute Schema DDL
1. Log into Supabase Dashboard: `https://app.supabase.com/project/nfrzwsqudmvrluysqjfo`
2. Open **SQL Editor** → **New query**.
3. Copy and run [`backend/migrations/V001__baseline_medicompare_schema.sql`](file:///d:/Nokib/backend/migrations/V001__baseline_medicompare_schema.sql).
4. Verify that tables `manufacturers`, `generics`, `ingredients`, `medicines`, `medicine_ingredients`, and `view_medicine_full` are created.

### Step 2: Populate Pharmaceutical Dataset (21,646 Records)
Option A (Direct Streaming Migration):
```bash
set DATABASE_URL="postgresql://postgres:[PASSWORD]@db.nfrzwsqudmvrluysqjfo.supabase.co:5432/postgres"
python scripts/stream_migration_to_supabase.py
```
Option B (SQL Transaction Execution):
Open [`backend/migrations/V002__populate_medicompare_data.sql`](file:///d:/Nokib/backend/migrations/V002__populate_medicompare_data.sql) in Supabase SQL editor or run via psql.

---

## 2. Vercel Frontend Deployment

1. Connect GitHub repo `https://github.com/AvengerNabil/MEDICOMPARE-BD` to Vercel.
2. Root Directory: `frontend`
3. Framework Preset: `Next.js`
4. Set Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://nfrzwsqudmvrluysqjfo.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `[Your Supabase anon key]`
   - `DATABASE_URL`: `postgresql://postgres:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`
5. Click **Deploy**.
