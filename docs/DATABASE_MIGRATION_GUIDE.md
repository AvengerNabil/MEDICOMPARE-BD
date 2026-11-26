# MediCompare BD — Database Migration Guide (SQLite to Supabase PostgreSQL)

This document provides a comprehensive runbook for migrating the local SQLite medicine database into Supabase PostgreSQL.

---

## 1. Pre-Migration Verification
- **Authoritative SQLite DB:** `medicompare.db`
- **Backup Location:** `backend/backup/medicompare_pre_migration_backup.db`
- **SHA-256 Checksum:** `573214bc9ead0f26d4ed66bcec9dad1b67b9f6efc6fb1c87d28a309e4e95c483` (Verified match).

---

## 2. Step-by-Step Execution

### Step 1: Execute Schema DDL
Execute [`backend/migrations/V001__baseline_medicompare_schema.sql`](file:///d:/Nokib/backend/migrations/V001__baseline_medicompare_schema.sql) in the Supabase SQL editor.

### Step 2: Stream Records
Run the Python streaming migrator:
```bash
python scripts/stream_migration_to_supabase.py
```
This transfers:
- 232 Manufacturers
- 1,661 Generics
- 1,705 Active Pharmaceutical Ingredients
- 21,646 Medicines
- 26,346 Medicine-Ingredient Links

### Step 3: Run Post-Migration Parity Verification
Run the parity check query in Supabase SQL editor:
```sql
SELECT 
    (SELECT COUNT(*) FROM public.manufacturers) as total_mfr,
    (SELECT COUNT(*) FROM public.generics) as total_generics,
    (SELECT COUNT(*) FROM public.ingredients) as total_ingredients,
    (SELECT COUNT(*) FROM public.medicines) as total_medicines,
    (SELECT COUNT(*) FROM public.medicine_ingredients) as total_mappings;
```
Expected output:
- `total_mfr`: 232
- `total_generics`: 1,661
- `total_ingredients`: 1,705
- `total_medicines`: 21,646
- `total_mappings`: 26,346
