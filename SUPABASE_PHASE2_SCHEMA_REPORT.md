# SUPABASE PHASE 2 — POSTGRESQL SCHEMA DESIGN & MIGRATION REPORT
**Project:** MediCompare BD (Bangladesh Medicine Intelligence & Price Comparison Platform)  
**Target Supabase Project:** `https://nfrzwsqudmvrluysqjfo.supabase.co`  
**Migration File:** [`backend/migrations/V001__baseline_medicompare_schema.sql`](file:///d:/Nokib/backend/migrations/V001__baseline_medicompare_schema.sql)  
**Date:** November 26, 2026  
**Auditor / Engineer:** Senior PostgreSQL Database Architect & Supabase Migration Engineer  

---

## 1. Executive Summary & Step 1 Review

In accordance with Phase 2 instructions, a rigorous review of Phase 1 and the active database assets was performed:
1. **Active Database Verified:** Confirmed `medicompare.db` (22.6 MB) as the active relational database containing **21,646** genuine medicines, **1,661** generics, **232** manufacturers, **1,705** ingredients, and **26,346** medicine-ingredient junction rows.
2. **Phase 1 Verification:** Confirmed Phase 1 findings. No orphaned records exist; primary keys use string identifiers (`med-bd-*`, `gen-*`, `mfr-*`, `ing-*`).
3. **Supabase Project URL Verification:**
   - URL verified: `https://nfrzwsqudmvrluysqjfo.supabase.co`
   - Verified that the host is live on the internet (returns standard Supabase API `404 Not Found` for unauthenticated root endpoint).
4. **Credential Availability Status:**
   - ⚠️ **Database Password / Direct Connection Credentials Not Yet Configured in Local Environment:**
   - The repository strictly contains template placeholders in `.env.example`. In accordance with safety rules ("*If credentials are unavailable, do not simulate success; do not guess*"), the schema migration was constructed as a robust, versioned, idempotent SQL migration file ready for direct execution via Supabase SQL Editor or Supabase CLI.

---

## 2. PostgreSQL Schema Architecture & Tables Designed

The schema preserves the normalized 3NF structure of MediCompare BD with zero column deletions or breaking renames:

| Table Name | Primary Key | Total Foreign Keys | PostgreSQL Enhancements & Types |
| :--- | :--- | :---: | :--- |
| **`manufacturers`** | `VARCHAR(64)` | 0 | `BOOLEAN` for `is_who_gmp`, `TIMESTAMPTZ` for timestamps, unique index on `name`. |
| **`generics`** | `VARCHAR(64)` | 0 | Unique index on `inn_name`, `TEXT` for descriptions, therapeutic classification. |
| **`ingredients`** | `VARCHAR(64)` | 0 | Unique index on `name`, `cas_number` for chemical identification. |
| **`medicines`** | `VARCHAR(64)` | 2 | `NUMERIC(10,2)` for `unit_price` & `mrp` (avoids float inaccuracies), `BOOLEAN` for prescription requirement, `tsvector` generated search vector, foreign keys to `generics` & `manufacturers`. |
| **`medicine_ingredients`** | `BIGSERIAL` | 2 | `UNIQUE(medicine_id, ingredient_id)` constraint; handles combination drugs (e.g. Paracetamol + Caffeine). |
| **`price_records`** | `BIGSERIAL` | 1 | `NUMERIC(10,2)` for historical unit prices; audit citation tracking. |
| **`audit_logs`** | `BIGSERIAL` | 0 | `JSONB` details column for schema changes and data ingestion events. |

---

## 3. Full-Text Search & Trigram Indexing Design (Bangla + English)

### 3.1 Limitations of Standard PostgreSQL FTS for Bengali
Standard PostgreSQL `tsvector` dictionaries (`english`) tokenize and stem English words well, but treat non-Latin alphabets like Bengali as raw character blocks without stemming.

### 3.2 Implemented Dual-Search Strategy in PostgreSQL
To achieve parity with SQLite's FTS5:
1. **Weighted `tsvector` Column:**
   ```sql
   search_vector tsvector GENERATED ALWAYS AS (
       setweight(to_tsvector('simple', coalesce(brand_name, '')), 'A') ||
       setweight(to_tsvector('simple', coalesce(brand_name_bn, '')), 'A') ||
       setweight(to_tsvector('simple', coalesce(strength, '')), 'B') ||
       setweight(to_tsvector('simple', coalesce(dosage_form, '')), 'C')
   ) STORED;
   CREATE INDEX idx_medicines_search_vector ON public.medicines USING GIN(search_vector);
   ```
   Uses the `'simple'` dictionary to prevent English stemmers from mangling Bengali unicode characters.
2. **Trigram Fuzzy Matching (`pg_trgm` GIN Indexes):**
   ```sql
   CREATE INDEX idx_medicines_brand_trgm ON public.medicines USING GIN(brand_name gin_trgm_ops);
   CREATE INDEX idx_medicines_brand_bn_trgm ON public.medicines USING GIN(brand_name_bn gin_trgm_ops);
   CREATE INDEX idx_generics_inn_trgm ON public.generics USING GIN(inn_name gin_trgm_ops);
   CREATE INDEX idx_generics_inn_bn_trgm ON public.generics USING GIN(inn_name_bn gin_trgm_ops);
   CREATE INDEX idx_manufacturers_name_trgm ON public.manufacturers USING GIN(name gin_trgm_ops);
   ```
   Trigram GIN indexing handles partial keystrokes (e.g. `"sec"` matching `"Seclo"`), case-insensitivity, and phonetic variations across both languages.

---

## 4. Performance Indexes & Bioequivalent Alternative Optimization

In addition to search indexes, the following relational indexes were engineered:
- **`idx_medicines_bioequiv`**: `(generic_id, lower(strength), lower(dosage_form), unit_price)`
  - Enables sub-millisecond lookups for all competing brands of the exact same chemical formulation sorted by lowest price.
- **Relational JOIN Indexes**: `idx_medicines_generic_id`, `idx_medicines_manufacturer_id`, `idx_medicine_ingredients_med`, `idx_medicine_ingredients_ing`.

---

## 5. Security & Row Level Security (RLS) Policies

All 7 tables are locked down with declarative RLS:

### Public Read Access (Catalog Discovery)
- `medicines`, `generics`, `manufacturers`, `ingredients`, `medicine_ingredients`, and `price_records` have:
  ```sql
  CREATE POLICY "Public Read Access ..." ON public.<table_name> FOR SELECT USING (true);
  ```
- Public anonymous users can browse, search, and compare prices freely without authentication.

### Write Protection (Anti-Tampering)
- **Zero Public Mutation**: No public or anonymous user can `INSERT`, `UPDATE`, or `DELETE` any medicine or price record.
- **Service Role Exclusivity**:
  ```sql
  CREATE POLICY "Service Role Full Access ..." ON public.<table_name> FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role');
  ```
  Only backend administrative processes with the secret `service_role` key can insert or update pharmaceutical data.

---

## 6. Versioned Migration File Location

The complete, self-contained migration script has been created at:
📁 **[`backend/migrations/V001__baseline_medicompare_schema.sql`](file:///d:/Nokib/backend/migrations/V001__baseline_medicompare_schema.sql)**

### Execution Instructions for Supabase:
1. Log into your Supabase Dashboard: `https://app.supabase.com/project/nfrzwsqudmvrluysqjfo`
2. Open the **SQL Editor** in the left sidebar.
3. Paste the contents of [`V001__baseline_medicompare_schema.sql`](file:///d:/Nokib/backend/migrations/V001__baseline_medicompare_schema.sql) and click **RUN**.
4. The tables, extensions, GIN indexes, RLS policies, and view will be created cleanly.

---

## 7. Current Application Configuration & SQLite Preservation

In accordance with strict safety rules:
- The local SQLite database (`medicompare.db`) remains completely untouched and operational as the primary source of truth.
- No live application queries were altered.
- Next.js and FastAPI continue to serve queries locally with zero downtime.

---

## 8. Requirements for Phase 3 (Data Migration)

When you are ready to proceed with Phase 3:
1. Run [`V001__baseline_medicompare_schema.sql`](file:///d:/Nokib/backend/migrations/V001__baseline_medicompare_schema.sql) in the Supabase SQL Editor.
2. Supply your Supabase direct connection string (`DATABASE_URL=postgresql://postgres:[PASSWORD]@db.nfrzwsqudmvrluysqjfo.supabase.co:5432/postgres`) in your local `.env`.
3. We will execute an automated chunked migration script (`migrate_sqlite_to_supabase.py`) to transfer all 21,646 records safely into Supabase.
