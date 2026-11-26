-- ==============================================================================
-- MediCompare BD — Production Supabase PostgreSQL Schema Migration
-- Migration: V001__baseline_medicompare_schema.sql
-- Target Project: https://nfrzwsqudmvrluysqjfo.supabase.co
-- Description: Creates normalized pharmaceutical catalog, full-text search,
--              trigram indexing, foreign key constraints, and Row Level Security.
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ------------------------------------------------------------------------------
-- 2. Create Table: manufacturers
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.manufacturers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    name_bn VARCHAR(255),
    short_name VARCHAR(100),
    dgda_license VARCHAR(100),
    headquarters VARCHAR(255),
    is_who_gmp BOOLEAN DEFAULT TRUE,
    total_brands INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 3. Create Table: generics
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.generics (
    id VARCHAR(64) PRIMARY KEY,
    inn_name VARCHAR(255) NOT NULL UNIQUE,
    inn_name_bn VARCHAR(255),
    therapeutic_class VARCHAR(255),
    therapeutic_class_bn VARCHAR(255),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 4. Create Table: ingredients (Active Pharmaceutical Ingredients - APIs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ingredients (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    cas_number VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 5. Create Table: medicines
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medicines (
    id VARCHAR(64) PRIMARY KEY,
    brand_name VARCHAR(255) NOT NULL,
    brand_name_bn VARCHAR(255),
    generic_id VARCHAR(64) NOT NULL REFERENCES public.generics(id) ON DELETE RESTRICT,
    manufacturer_id VARCHAR(64) NOT NULL REFERENCES public.manufacturers(id) ON DELETE RESTRICT,
    strength VARCHAR(100) NOT NULL,
    dosage_form VARCHAR(100) NOT NULL,
    dosage_form_bn VARCHAR(100),
    route VARCHAR(100) DEFAULT 'Oral',
    release_mechanism VARCHAR(100) DEFAULT 'Immediate Release',
    pack_size INTEGER DEFAULT 10,
    pack_unit VARCHAR(100),
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    mrp NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    price_type VARCHAR(50) DEFAULT 'OFFICIAL_MRP',
    registration_number VARCHAR(100) NOT NULL UNIQUE,
    verification_status VARCHAR(50) DEFAULT 'OFFICIAL_VERIFIED',
    is_prescription_required BOOLEAN DEFAULT TRUE,
    data_source VARCHAR(255) DEFAULT 'DGDA Official Registry 2024 / DGHS ValueSet',
    last_verified_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    indications_summary TEXT,
    safety_advice TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),

    -- Search vector generated column for English full-text search
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', coalesce(brand_name, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(brand_name_bn, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(strength, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(dosage_form, '')), 'C')
    ) STORED
);

-- ------------------------------------------------------------------------------
-- 6. Create Table: medicine_ingredients (Junction for single & combination drugs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medicine_ingredients (
    id BIGSERIAL PRIMARY KEY,
    medicine_id VARCHAR(64) NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
    ingredient_id VARCHAR(64) NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
    strength VARCHAR(100),
    CONSTRAINT uq_medicine_ingredient UNIQUE (medicine_id, ingredient_id)
);

-- ------------------------------------------------------------------------------
-- 7. Create Table: price_records (Historical Price Tracking & Auditing)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.price_records (
    id BIGSERIAL PRIMARY KEY,
    medicine_id VARCHAR(64) NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
    old_unit_price NUMERIC(10, 2),
    new_unit_price NUMERIC(10, 2) NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    source_citation VARCHAR(255)
);

-- ------------------------------------------------------------------------------
-- 8. Create Table: audit_logs (System & Administrative Mutation Logs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 9. Comprehensive Performance & Search Indexes
-- ------------------------------------------------------------------------------
-- Foreign key indexing for fast relational JOINs
CREATE INDEX IF NOT EXISTS idx_medicines_generic_id ON public.medicines(generic_id);
CREATE INDEX IF NOT EXISTS idx_medicines_manufacturer_id ON public.medicines(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_medicines_dosage_form ON public.medicines(lower(dosage_form));
CREATE INDEX IF NOT EXISTS idx_medicines_strength ON public.medicines(lower(strength));
CREATE INDEX IF NOT EXISTS idx_medicine_ingredients_med ON public.medicine_ingredients(medicine_id);
CREATE INDEX IF NOT EXISTS idx_medicine_ingredients_ing ON public.medicine_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_price_records_med ON public.price_records(medicine_id);

-- GIN Index for Full-Text Search Vector
CREATE INDEX IF NOT EXISTS idx_medicines_search_vector ON public.medicines USING GIN(search_vector);

-- Trigram GIN Indexes for Substring, Fuzzy, and Bangla/English Matching
CREATE INDEX IF NOT EXISTS idx_medicines_brand_trgm ON public.medicines USING GIN(brand_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_medicines_brand_bn_trgm ON public.medicines USING GIN(brand_name_bn gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_generics_inn_trgm ON public.generics USING GIN(inn_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_generics_inn_bn_trgm ON public.generics USING GIN(inn_name_bn gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_manufacturers_name_trgm ON public.manufacturers USING GIN(name gin_trgm_ops);

-- Composite Index for Bioequivalent Alternative Queries (Same generic + strength + form)
CREATE INDEX IF NOT EXISTS idx_medicines_bioequiv ON public.medicines(generic_id, lower(strength), lower(dosage_form), unit_price);

-- ------------------------------------------------------------------------------
-- 10. Security & Row Level Security (RLS) Configuration
-- ------------------------------------------------------------------------------
-- Enable RLS on all exposed tables
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public READ-ONLY Access Policies (Permit public discovery of pharmaceutical data)
CREATE POLICY "Public Read Access Manufacturers" 
    ON public.manufacturers FOR SELECT USING (true);

CREATE POLICY "Public Read Access Generics" 
    ON public.generics FOR SELECT USING (true);

CREATE POLICY "Public Read Access Ingredients" 
    ON public.ingredients FOR SELECT USING (true);

CREATE POLICY "Public Read Access Medicines" 
    ON public.medicines FOR SELECT USING (true);

CREATE POLICY "Public Read Access Medicine Ingredients" 
    ON public.medicine_ingredients FOR SELECT USING (true);

CREATE POLICY "Public Read Access Price Records" 
    ON public.price_records FOR SELECT USING (true);

-- Restrict Audit Logs to Authenticated Staff / Service Role Only
CREATE POLICY "Admin Service Role Audit Logs" 
    ON public.audit_logs FOR ALL 
    USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'authenticated');

-- Write Protections (Prevent public users from inserting, updating, or deleting catalog data)
-- Only service_role can mutate pharmaceutical catalog data
CREATE POLICY "Service Role Full Access Manufacturers" 
    ON public.manufacturers FOR ALL 
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service Role Full Access Generics" 
    ON public.generics FOR ALL 
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service Role Full Access Ingredients" 
    ON public.ingredients FOR ALL 
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service Role Full Access Medicines" 
    ON public.medicines FOR ALL 
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service Role Full Access Medicine Ingredients" 
    ON public.medicine_ingredients FOR ALL 
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service Role Full Access Price Records" 
    ON public.price_records FOR ALL 
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ------------------------------------------------------------------------------
-- 11. Helper Views for Rapid Bioequivalent Alternative Lookups
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.view_medicine_full AS
SELECT 
    m.id,
    m.brand_name,
    m.brand_name_bn,
    m.generic_id,
    g.inn_name AS generic_name,
    g.inn_name_bn AS generic_name_bn,
    g.therapeutic_class,
    g.therapeutic_class_bn,
    m.manufacturer_id,
    mfr.name AS manufacturer_name,
    mfr.name_bn AS manufacturer_name_bn,
    m.strength,
    m.dosage_form,
    m.dosage_form_bn,
    m.route,
    m.release_mechanism,
    m.pack_size,
    m.pack_unit,
    m.unit_price,
    m.mrp,
    m.price_type,
    m.registration_number,
    m.verification_status,
    m.is_prescription_required,
    m.data_source,
    m.last_verified_at,
    m.indications_summary,
    m.safety_advice
FROM public.medicines m
JOIN public.generics g ON m.generic_id = g.id
JOIN public.manufacturers mfr ON m.manufacturer_id = mfr.id;
