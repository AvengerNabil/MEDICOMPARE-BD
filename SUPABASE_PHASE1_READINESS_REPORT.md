# SUPABASE PHASE 1 — READINESS & CONNECTION AUDIT REPORT
**Project:** MediCompare BD (Bangladesh Medicine Intelligence & Price Comparison Platform)  
**Target Supabase Project URL:** `https://nfrzwsqudmvrluysqjfo.supabase.co`  
**GitHub Repository:** `https://github.com/AvengerNabil/MEDICOMPARE-BD`  
**Audit Scope:** Read-Only Audit of Architecture, Database Schemas, Dependencies, Security, and PostgreSQL Migration Readiness  
**Date:** November 26, 2026  
**Auditor:** Senior Database Architect, PostgreSQL Engineer & Supabase Specialist  

---

## 1. Executive Summary

This read-only audit evaluated the current MediCompare BD codebase, database assets, and architectural components to establish whether the project is ready for migration to Supabase PostgreSQL (`https://nfrzwsqudmvrluysqjfo.supabase.co`) and eventual deployment on Vercel (Frontend) and Render (Backend).

### Primary Conclusions:
1. **Supabase Connection Status:** ❌ **NOT CONNECTED**. The project contains the target URL in specifications, but zero environment files or client configurations currently connect to `https://nfrzwsqudmvrluysqjfo.supabase.co`.
2. **Current Active Database Engine:** 📁 **Dual SQLite Architecture**.
   - An identical 22.6 MB SQLite database file exists at `d:/Nokib/medicompare.db` and `d:/Nokib/backend/medicompare.db`.
   - Both the Next.js frontend (via `node:sqlite` in `/api/medicines/*`) and the Python FastAPI backend (in `backend/app/api/v1/endpoints/medicines.py`) query these local SQLite files directly.
3. **Data Quality & Relational Readiness:** 🟢 **EXCELLENT / 100% CLEAN**.
   - **21,646** validated DGDA-registered medicines, **1,661** generics, **232** manufacturers, and **1,705** ingredients are fully linked with zero dangling foreign keys.
4. **Phase 2 Migration Feasibility:** 🟢 **READY FOR MIGRATION**. The database schema is strictly normalized and directly maps to PostgreSQL DDL with minor dialect adjustments (e.g., FTS5 to PostgreSQL Full-Text Search / `pg_trgm`, `INTEGER` booleans to native PostgreSQL `BOOLEAN`, and `TEXT` timestamps to `TIMESTAMPTZ`).

---

## 2. Existing Application Architecture

```
                          ┌────────────────────────────────────────┐
                          │         MediCompare BD Client          │
                          │   Next.js 14 (App Router) + React 18   │
                          └───────────────────┬────────────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         ┌─────────────────────────┐                     ┌─────────────────────────┐
         │ Next.js Internal Routes │                     │ FastAPI Python Backend  │
         │  /api/medicines/search  │                     │   /api/v1/medicines     │
         │  /api/medicines/alts    │                     │   /api/v1/comparison    │
         │  (uses node:sqlite)     │                     │ (uses sqlite3 / FTS5)   │
         └────────────┬────────────┘                     └────────────┬────────────┘
                      │                                               │
                      ▼                                               ▼
         ┌─────────────────────────┐                     ┌─────────────────────────┐
         │   D:\Nokib\             │                     │   D:\Nokib\backend\     │
         │   medicompare.db        │                     │   medicompare.db        │
         │   (22.6 MB, 21.6k rows) │                     │   (22.6 MB, 21.6k rows) │
         └─────────────────────────┘                     └─────────────────────────┘
```

### Key Architectural Observations:
- **Independent SQLite Access**: The frontend and backend currently access local SQLite files independently.
  - Next.js server routes use Node v24's built-in `node:sqlite` directly against `medicompare.db`.
  - FastAPI backend endpoints use Python's `sqlite3` library against `backend/medicompare.db`.
- **Target Architecture for Deployment (Phase 2 & 3)**:
  - Migrate all tables and records to **Supabase PostgreSQL** (`https://nfrzwsqudmvrluysqjfo.supabase.co`).
  - Next.js frontend deployed to **Vercel**, connecting directly to Supabase via `@supabase/supabase-js` or pooled connection strings.
  - FastAPI backend deployed to **Render**, connecting via `SQLAlchemy` + `psycopg2-binary` to the Supabase PostgreSQL transaction pooler.

---

## 3. Current SQLite Database Details

### File Verification:
- `D:\Nokib\medicompare.db` (Size: 22,646,784 bytes, Modified: 2026-11-26 21:07:23)
- `D:\Nokib\backend\medicompare.db` (Size: 22,646,784 bytes, Modified: 2026-11-26 21:07:23)

### Verified Row Counts & Entity Distribution:
| Entity / Table | Row Count | Primary Key | Description |
| :--- | :---: | :---: | :--- |
| `medicines` | **21,646** | `TEXT` (`med-bd-XXXXX`) | Official DGDA registered medicines |
| `generics` | **1,661** | `TEXT` (`gen-XXXXX`) | INN generic active molecules |
| `manufacturers` | **232** | `TEXT` (`mfr-XXXXX`) | Licensed pharmaceutical manufacturing companies |
| `ingredients` | **1,705** | `TEXT` (`ing-XXXXX`) | Raw Active Pharmaceutical Ingredients (APIs) |
| `medicine_ingredients` | **26,346** | Composite | Junction table mapping medicines to ingredients |
| `medicines_fts` | **21,646** | Rowid | SQLite FTS5 Full-Text Search virtual table |
| `price_records` | **0** | `TEXT` | Historical price tracking schema (ready for logging) |
| `audit_logs` | **1** | `INTEGER` | Data ingestion audit checkpoint |

---

## 4. Existing Supabase Configuration Status

| Component | Repository Status | Findings |
| :--- | :---: | :--- |
| **Supabase URL** | ⚠️ Placeholder Only | Stored in `.env.example` as `SUPABASE_URL=`; no active `.env` file |
| **Supabase Anon Key** | ❌ Missing | Stored in `.env.example` as `SUPABASE_ANON_KEY=`; no value provided |
| **PostgreSQL Connection** | ❌ Missing | Stored in `.env.example` as `DATABASE_URL=postgresql://localhost:5432/...` |
| **Supabase Client Library** | ❌ Missing in Frontend | `frontend/package.json` does NOT include `@supabase/supabase-js` |
| **PostgreSQL Drivers (Backend)** | 🟢 Present | `backend/requirements.txt` contains `psycopg2-binary>=2.9.10` and `sqlalchemy>=2.0.36` |
| **Migration Tooling** | ⚠️ Partial | `backend/requirements.txt` contains `alembic>=1.13.3`, but no `alembic/` folder or Supabase CLI migrations exist |

---

## 5. Database Schema & Relationships Analysis

### 5.1 Tables and Foreign Keys
```
+--------------------+           +------------------------+
|   manufacturers    |           |        generics        |
+--------------------+           +------------------------+
| id (PK)            |<----+     | id (PK)                |<----+
| name (UNIQUE)      |     |     | inn_name (UNIQUE)      |     |
| dgda_license       |     |     | therapeutic_class      |     |
+--------------------+     |     +------------------------+     |
                           |                                    |
                           |     +------------------------+     |
                           |     |       medicines        |     |
                           |     +------------------------+     |
                           |     | id (PK)                |     |
                           +-----| manufacturer_id (FK)   |     |
                                 | generic_id (FK)        +-----+
                                 | brand_name             |
                                 | strength               |
                                 | dosage_form            |
                                 | unit_price             |
                                 | mrp                    |
                                 | registration_number    |
                                 +------------------------+
                                             |
                                             | 1:N
                                             v
                                 +------------------------+
                                 |  medicine_ingredients  |
                                 +------------------------+
                                 | medicine_id (FK)       |
                                 | ingredient_id (FK)     +-----+
                                 | strength               |     |
                                 +------------------------+     |
                                                                v
                                                   +------------------------+
                                                   |      ingredients       |
                                                   +------------------------+
                                                   | id (PK)                |
                                                   | name (UNIQUE)          |
                                                   +------------------------+
```

### 5.2 Referential Integrity Verification Results
- **Unlinked Generics in Medicines:** `0` (Zero orphan records).
- **Unlinked Manufacturers in Medicines:** `0` (Zero orphan records).
- **Unlinked Ingredients in Junction Table:** `0` (Zero orphan records).
- **Price Validity:** 21,568 medicines contain verified retail unit prices; 78 institutional hospital medicines contain valid null/0 prices.

---

## 6. Migration Compatibility Analysis (SQLite → PostgreSQL)

| Feature | Existing SQLite Implementation | Required PostgreSQL / Supabase Equivalent | Complexity |
| :--- | :--- | :--- | :---: |
| **Primary Keys** | `TEXT` with pre-generated UUID/slugs (e.g. `med-bd-1958`) | `VARCHAR(64)` or `TEXT` Primary Key (preserves existing IDs perfectly) | Low |
| **Data Types** | `TEXT`, `INTEGER`, `REAL` | `VARCHAR`, `TEXT`, `BOOLEAN`, `NUMERIC(10,2)`, `TIMESTAMPTZ` | Low |
| **Booleans** | `INTEGER DEFAULT 1 / 0` | Native `BOOLEAN DEFAULT TRUE / FALSE` | Low |
| **Search Engine** | Virtual FTS5 table (`medicines_fts`) | PostgreSQL `tsvector` + GIN index, and `pg_trgm` GIN index | Medium |
| **Relationships** | SQLite Foreign Key Constraints | PostgreSQL `REFERENCES ... ON DELETE RESTRICT` | Low |
| **Auto-Increment** | Not used (explicit string IDs used) | Not required for catalog tables; standard sequences for logs | None |

### Compatibility Assessment:
No data loss risk exists. Converting strings to PostgreSQL types and preserving the existing `med-bd-*`, `gen-*`, `mfr-*`, and `ing-*` ID schemes avoids breaking frontend routes and cached client states.

---

## 7. Security and RLS Readiness Assessment

1. **Service-Role Key Exposure Risk:**
   - **Audit Result:** 🟢 **CLEAN**. No Supabase service-role keys or admin secrets exist in the frontend code or public repositories.
2. **Environment Variable Segregation:**
   - Client-accessible variables must strictly use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - `SUPABASE_SERVICE_ROLE_KEY` and direct `DATABASE_URL` passwords must be stored exclusively on the server (Vercel Backend / Render Environment).
3. **Row Level Security (RLS) Policy Requirements for Supabase:**
   - **Catalog Tables (`medicines`, `generics`, `manufacturers`, `ingredients`, `medicine_ingredients`)**:
     - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
     - Public Access Policy: `CREATE POLICY "Public Read Access" ON medicines FOR SELECT USING (true);`
     - Admin Write Policy: Restricted to `service_role` or authenticated admin users (`auth.jwt() ->> 'role' = 'service_role'`).
   - **Audit & Admin Tables (`price_records`, `audit_logs`)**:
     - Restricted to authenticated administrative sessions only.

---

## 8. Missing Dependencies and Required Configurations

To execute Phase 2, the following assets are required:

### 8.1 Required Supabase Credentials from Project `https://nfrzwsqudmvrluysqjfo.supabase.co`
*(These must be added to `.env` or deployment dashboards, never pasted into unencrypted chats)*:
1. `SUPABASE_URL`: `https://nfrzwsqudmvrluysqjfo.supabase.co`
2. `SUPABASE_ANON_KEY`: (Available under Supabase Dashboard → Settings → API)
3. `SUPABASE_SERVICE_ROLE_KEY`: (Available under Supabase Dashboard → Settings → API)
4. `DATABASE_URL`: Direct or Transaction Pooler connection string (Port 6543 / 5432)

### 8.2 Missing Package Dependencies:
- **Frontend (`frontend/package.json`)**:
  - `@supabase/supabase-js` (needed for client-side or server-component data fetching).
- **Backend (`backend/requirements.txt`)**:
  - `psycopg2-binary` is already present.

---

## 9. Potential Risks & Mitigation Strategies

| Risk Identified | Impact | Recommended Mitigation |
| :--- | :---: | :--- |
| **API Response Latency** | Direct queries from Vercel to Supabase outside the same region can add 100-200ms latency. | Deploy Supabase project in `ap-southeast-1` (Singapore) to ensure minimum latency to Bangladesh/South Asia. Use Supabase connection pooling (Supavisor). |
| **Search Engine Differences** | SQLite FTS5 syntax differs from PostgreSQL `to_tsquery`. | Implement PostgreSQL `pg_trgm` extension and generated `tsvector` columns for full-text search matching. |
| **Build Breaks during Migration** | If Next.js switches API routes before Supabase is populated, search will fail. | Keep SQLite local fallback intact during the transition until Supabase is verified. |

---

## 10. Exact Next Steps for Phase 2

Once approved, Phase 2 will execute the following sequenced steps:

1. **Step 2.1 — Schema Generation**:
   - Generate `supabase/schema.sql` containing standard PostgreSQL DDL for all 7 tables, foreign keys, `pg_trgm` extensions, and GIN indexes.
2. **Step 2.2 — RLS Policy Definition**:
   - Include declarative RLS security policies in `supabase/schema.sql` (public SELECT, service-role write).
3. **Step 2.3 — Automated Data Migration Script**:
   - Create a Python migration script (`scripts/migrate_sqlite_to_supabase.py`) to stream the 21,646 medicine records from `medicompare.db` into Supabase PostgreSQL in optimized batches (1,000 rows/batch).
4. **Step 2.4 — Verification & Parity Test**:
   - Execute read-only count and search validation queries against Supabase to guarantee 100% record parity (21,646 medicines).
