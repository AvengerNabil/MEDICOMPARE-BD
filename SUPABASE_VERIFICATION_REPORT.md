# SUPABASE PRODUCTION DATABASE VERIFICATION REPORT
**Platform:** MediCompare BD (Bangladesh Medicine Intelligence & Price Comparison Platform)  
**Audit Type:** Read-Only Database & Environment Audit  
**Date:** November 26, 2026  
**Auditor:** Senior Database Architect & Cybersecurity Engineer  

---

## 1. Executive Summary

A comprehensive read-only audit of the database infrastructure, environment configurations, API integrations, and data sources was conducted for MediCompare BD.

### Overall Production Readiness Verdict:
> ⛔ **BLOCKED / NOT READY FOR IMMEDIATE SUPABASE DEPLOYMENT**  
> **Status:** The application currently operates on a local, fully functional SQLite relational database (`medicompare.db` with 21,646 medicines). **No active remote Supabase PostgreSQL project is connected or provisioned in the environment.**

While the data models, relations, and schemas are fully structured and clean, the cloud Supabase credentials (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `DATABASE_URL` with a Supabase pooler/direct connection string) are undefined in all environment files.

---

## 2. Detailed Findings Against Audit Checklist

### 1. Backend Supabase Connection
- **Result:** ❌ **Disconnected / Unconfigured**
- **Details:** 
  - `backend/app/core/config.py` defines `DATABASE_URL` with a local default (`sqlite:///./medicompare_dev.db`).
  - `.env.example` lists placeholders (`SUPABASE_URL=`, `SUPABASE_ANON_KEY=`, `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medicompare_bd`), but neither `.env` nor `.env.production` exists with real Supabase credentials.
  - The backend FastAPI application currently queries the local `medicompare.db` file.

### 2. Frontend Backend API Integration
- **Result:** ⚠️ **Hybrid Architecture**
- **Details:**
  - The frontend has direct internal Next.js API routes (`/api/medicines/search`, `/api/medicines/alternatives`, `/api/medicines/[id]`) that query the relational database using Node v24's embedded SQLite driver.
  - The frontend can also point to FastAPI via `NEXT_PUBLIC_API_URL` (`http://localhost:8000/api/v1`), but neither Next.js nor FastAPI connects to an external Supabase instance yet.

### 3. Storage Location of Medicine Records (Supabase vs. Local Files)
- **Result:** 📁 **Local Files / Local Relational DB**
- **Details:**
  - **Relational Database File:** `medicompare.db` (and `backend/medicompare.db`) contains the complete indexed dataset.
  - **Raw and Processed Sources:** `data/raw/medicine.csv` and `data/processed/bangladesh_medicines_full.json`.
  - **Supabase Cloud Tables:** Currently unpopulated because no Supabase project connection string or API keys have been provided.

### 4. Actual Medicine Record Counts
Inspected directly from the relational tables:
- **Unique Medicine Formulations:** `21,646`
- **Active Pharmaceutical Ingredients (APIs):** `1,705`
- **Generic Classifications:** `1,661`
- **Licensed Pharmaceutical Manufacturers:** `232`
- **Medicine-Ingredient Mapping Rows:** `26,346`
- **Full-Text Search Index Rows (`medicines_fts`):** `21,646`

### 5. Existing Database Tables and Relationships
The relational schema is properly normalized into standard 3NF with the following structure:
- `manufacturers` (id, name, dgda_license, headquarters, is_who_gmp, total_brands)
- `generics` (id, inn_name, therapeutic_class, description)
- `ingredients` (id, name)
- `medicines` (id, brand_name, generic_id, manufacturer_id, strength, dosage_form, route, release_mechanism, pack_size, unit_price, mrp, registration_number, verification_status, indications_summary, safety_advice)
- `medicine_ingredients` (medicine_id, ingredient_id, strength)
- `medicines_fts` (Virtual FTS5 table indexing brand names, generics, and manufacturers)

### 6. Relational Integrity & Linkage Audit
- **Unlinked Generic References:** `0` (100% of medicines link to a valid generic record).
- **Unlinked Manufacturer References:** `0` (100% of medicines link to a valid licensed manufacturer).
- **Price Completeness:** 21,568 medicines have verified unit prices and MRPs; only 78 institutional/hospital-supply records have unlisted retail prices.

### 7. Evaluation of Demo/Mock Data
- **Result:** 🟢 **Clean Real Dataset in Relational DB; In-Memory Arrays Kept Only as Fallback**
- The live database contains **0 demo records** and **21,646 genuine DGDA-registered medicines**.
- The frontend was updated so that [HeroSearch.tsx](file:///d:/Nokib/frontend/src/components/HeroSearch.tsx) and [ComparisonMatrix.tsx](file:///d:/Nokib/frontend/src/components/ComparisonMatrix.tsx) dynamically query the database API routes first. The 25 hardcoded demo items in `bangladeshMedicines.ts` serve only as a failover in case of complete network loss.

### 8. Database Migrations
- **Result:** ❌ **No Supabase / Alembic Migrations Active**
- **Details:**
  - Neither `alembic` nor Supabase CLI migration scripts (`supabase/migrations/`) are tracked in the repository.
  - The SQLite database was instantiated via a custom Python data ingest script ([init_db.py](file:///d:/Nokib/backend/app/db/init_db.py)).
  - To transition to Supabase, a formal SQL DDL migration file must be executed on Supabase.

### 9. Row Level Security (RLS) Policies
- **Result:** ⚠️ **Pending Supabase Schema Creation**
- **Details:**
  - Since PostgreSQL / Supabase has not yet been provisioned, no RLS policies are currently in effect on Supabase.
  - Recommended Production RLS Strategy:
    - **`medicines`**, **`generics`**, **`manufacturers`**, **`ingredients`**: `FOR SELECT USING (true)` (Public read-only).
    - **Write/Update/Delete operations**: Restricted exclusively to authenticated admin service roles (`auth.jwt() ->> 'role' = 'service_role'`).

### 10. Production Environment Variables Audit
- **Result:** ❌ **Incomplete for Supabase Deployment**
- **Missing Required Production Keys:**
  ```env
  # Supabase Cloud PostgreSQL Connection
  DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
  DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

  # Supabase Public API Configuration
  NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]

  # Supabase Service Role Key (Backend Only - NEVER expose to frontend)
  SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
  ```

---

## 3. Deployment Readiness & Actionable Blockers

### Current Status:
The application is **locally production-ready** (running smoothly with full 21,646 records on the local engine), but **cloud Supabase deployment is blocked** until the following items are provided.

### Blockers Checklist:
1. **Supabase Project Credentials Missing**:
   - Provide the project `SUPABASE_URL` and `SUPABASE_ANON_KEY` (or direct PostgreSQL `DATABASE_URL`).
2. **PostgreSQL Migration DDL**:
   - A PostgreSQL-compatible schema creation script (`supabase_schema.sql`) needs to be run in Supabase SQL Editor or via CLI to create the tables, indexes, and pg_trgm extension.
3. **Data Ingestion into Supabase**:
   - Once the Supabase connection string is supplied, the 21,646 records from `data/processed/bangladesh_medicines_full.json` or `medicompare.db` can be bulk-uploaded into Supabase PostgreSQL.
4. **RLS & Security Rules**:
   - Enable Row Level Security and add public SELECT policies on all pharmaceutical catalog tables.
