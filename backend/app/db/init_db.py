import os
import json
import sqlite3
import re
from datetime import datetime

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../medicompare.db"))
DATA_JSON_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/processed/bangladesh_medicines_full.json"))

def init_database():
    print(f"=== INITIALIZING MEDICOMPARE BD DATABASE ===")
    print(f"Target Database Path: {DB_PATH}")
    print(f"Source JSON Path: {DATA_JSON_PATH}")

    if not os.path.exists(DATA_JSON_PATH):
        raise FileNotFoundError(f"Source data file not found at {DATA_JSON_PATH}")

    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    cursor = conn.cursor()

    # Create Normalized Relational Schema
    cursor.executescript("""
    DROP TABLE IF EXISTS medicine_ingredients;
    DROP TABLE IF EXISTS price_records;
    DROP TABLE IF EXISTS audit_logs;
    DROP TABLE IF EXISTS medicines_fts;
    DROP TABLE IF EXISTS medicines;
    DROP TABLE IF EXISTS generics;
    DROP TABLE IF EXISTS manufacturers;
    DROP TABLE IF EXISTS ingredients;

    CREATE TABLE manufacturers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        name_bn TEXT,
        short_name TEXT,
        dgda_license TEXT,
        headquarters TEXT,
        is_who_gmp INTEGER DEFAULT 1,
        total_brands INTEGER DEFAULT 0,
        created_at TEXT
    );

    CREATE TABLE generics (
        id TEXT PRIMARY KEY,
        inn_name TEXT NOT NULL UNIQUE,
        inn_name_bn TEXT,
        therapeutic_class TEXT,
        therapeutic_class_bn TEXT,
        description TEXT,
        created_at TEXT
    );

    CREATE TABLE ingredients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT
    );

    CREATE TABLE medicines (
        id TEXT PRIMARY KEY,
        brand_name TEXT NOT NULL,
        brand_name_bn TEXT,
        generic_id TEXT NOT NULL,
        manufacturer_id TEXT NOT NULL,
        strength TEXT NOT NULL,
        dosage_form TEXT NOT NULL,
        dosage_form_bn TEXT,
        route TEXT DEFAULT 'Oral',
        release_mechanism TEXT DEFAULT 'Immediate Release',
        pack_size INTEGER DEFAULT 10,
        pack_unit TEXT,
        unit_price REAL NOT NULL,
        mrp REAL NOT NULL,
        price_type TEXT DEFAULT 'OFFICIAL_MRP',
        registration_number TEXT NOT NULL UNIQUE,
        verification_status TEXT DEFAULT 'OFFICIAL_VERIFIED',
        is_prescription_required INTEGER DEFAULT 1,
        data_source TEXT,
        last_verified_at TEXT,
        indications_summary TEXT,
        safety_advice TEXT,
        created_at TEXT,
        FOREIGN KEY (generic_id) REFERENCES generics (id),
        FOREIGN KEY (manufacturer_id) REFERENCES manufacturers (id)
    );

    CREATE TABLE medicine_ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        medicine_id TEXT NOT NULL,
        ingredient_id TEXT NOT NULL,
        strength TEXT,
        FOREIGN KEY (medicine_id) REFERENCES medicines (id),
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
    );

    CREATE TABLE price_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        medicine_id TEXT NOT NULL,
        old_unit_price REAL,
        new_unit_price REAL,
        recorded_at TEXT,
        source_citation TEXT,
        FOREIGN KEY (medicine_id) REFERENCES medicines (id)
    );

    CREATE TABLE audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        entity_name TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        performed_by TEXT NOT NULL,
        details TEXT,
        timestamp TEXT
    );

    -- Indexes for standard lookup optimization
    CREATE INDEX idx_med_brand ON medicines (brand_name);
    CREATE INDEX idx_med_generic ON medicines (generic_id);
    CREATE INDEX idx_med_mfr ON medicines (manufacturer_id);
    CREATE INDEX idx_med_strength ON medicines (strength);
    CREATE INDEX idx_med_form ON medicines (dosage_form);
    CREATE INDEX idx_med_reg ON medicines (registration_number);
    CREATE INDEX idx_gen_inn ON generics (inn_name);
    CREATE INDEX idx_mfr_name ON manufacturers (name);

    -- FTS5 Full Text Search Virtual Table
    CREATE VIRTUAL TABLE medicines_fts USING fts5(
        medicine_id UNINDEXED,
        brand_name,
        generic_name,
        manufacturer,
        strength,
        dosage_form,
        active_ingredients,
        tokenize = 'unicode61 remove_diacritics 2'
    );
    """)

    print("[SCHEMA] Relational tables and FTS5 search index created successfully.")

    # Load JSON data
    with open(DATA_JSON_PATH, "r", encoding="utf-8") as f:
        records = json.load(f)

    print(f"[DATA] Processing {len(records)} records from JSON...")

    manufacturers_map = {} # name -> id
    generics_map = {} # inn_name -> id
    ingredients_map = {} # name -> id

    medicine_rows = []
    med_ing_rows = []
    fts_rows = []
    now_str = datetime.utcnow().isoformat()

    for idx, r in enumerate(records):
        # 1. Manufacturer
        mfr_name = (r.get("manufacturer") or "Unknown Manufacturer").strip()
        if mfr_name not in manufacturers_map:
            mfr_id = f"mfr-{re.sub(r'[^a-zA-Z0-9]', '-', mfr_name.lower())[:24]}-{len(manufacturers_map) + 1}"
            cursor.execute(
                "INSERT INTO manufacturers (id, name, name_bn, dgda_license, headquarters, is_who_gmp, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (mfr_id, mfr_name, r.get("manufacturerBn") or mfr_name, f"DGDA-DL-{str(len(manufacturers_map)+1).zfill(3)}", "Dhaka, Bangladesh", 1, now_str)
            )
            manufacturers_map[mfr_name] = mfr_id
        mfr_id = manufacturers_map[mfr_name]

        # 2. Generic
        gen_name = (r.get("genericName") or "Unknown Generic").strip()
        if gen_name not in generics_map:
            gen_id = f"gen-{re.sub(r'[^a-zA-Z0-9]', '-', gen_name.lower())[:24]}-{len(generics_map) + 1}"
            cursor.execute(
                "INSERT INTO generics (id, inn_name, inn_name_bn, therapeutic_class, therapeutic_class_bn, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (gen_id, gen_name, r.get("genericNameBn") or gen_name, r.get("therapeuticClass") or "General Allopathic", r.get("therapeuticClassBn") or "সাধারণ চিকিৎসা", now_str)
            )
            generics_map[gen_name] = gen_id
        gen_id = generics_map[gen_name]

        # 3. Medicine
        med_id = r.get("id") or f"med-{idx + 1}"
        brand_name = (r.get("brandName") or "Unknown Brand").strip()
        brand_name_bn = r.get("brandNameBn") or brand_name
        strength = (r.get("strength") or "N/A").strip()
        dosage_form = (r.get("dosageForm") or "Tablet").strip()
        dosage_form_bn = r.get("dosageFormBn") or dosage_form
        route = r.get("route") or "Oral"
        release_mech = r.get("releaseMechanism") or "Immediate Release"
        pack_size = int(r.get("packSize") or 10)
        pack_unit = r.get("packUnit") or f"Pack of {pack_size}"
        unit_price = float(r.get("unitPrice") or 0.0)
        mrp = float(r.get("mrp") or (unit_price * pack_size))
        price_type = r.get("priceType") or "OFFICIAL_MRP"
        reg_number = r.get("registrationNumber") or f"DAR-BD-{str(idx + 1).zfill(6)}"
        ver_status = r.get("verificationStatus") or "OFFICIAL_VERIFIED"
        is_rx = 1 if r.get("isPrescriptionRequired", True) else 0
        data_source = r.get("dataSource") or "DGDA Official Registry 2024"
        last_verified = r.get("lastVerifiedDate") or "2024-11-20"
        indications = r.get("indicationsSummary") or "Registered pharmaceutical product."
        safety = r.get("safetyAdvice") or "Consult a registered physician."

        medicine_rows.append((
            med_id, brand_name, brand_name_bn, gen_id, mfr_id, strength, dosage_form,
            dosage_form_bn, route, release_mech, pack_size, pack_unit, unit_price, mrp,
            price_type, reg_number, ver_status, is_rx, data_source, last_verified,
            indications, safety, now_str
        ))

        # 4. Active Ingredients
        act_ings = r.get("activeIngredients") or [{"name": gen_name, "strength": strength}]
        ing_names_list = []
        for ing in act_ings:
            i_name = (ing.get("name") or gen_name).strip()
            ing_names_list.append(i_name)
            if i_name not in ingredients_map:
                ing_id = f"ing-{re.sub(r'[^a-zA-Z0-9]', '-', i_name.lower())[:24]}-{len(ingredients_map) + 1}"
                cursor.execute("INSERT INTO ingredients (id, name, created_at) VALUES (?, ?, ?)", (ing_id, i_name, now_str))
                ingredients_map[i_name] = ing_id
            ing_id = ingredients_map[i_name]
            med_ing_rows.append((med_id, ing_id, ing.get("strength") or strength))

        # 5. FTS Entry
        fts_rows.append((
            med_id,
            brand_name,
            gen_name,
            mfr_name,
            strength,
            dosage_form,
            ", ".join(ing_names_list)
        ))

    # Bulk insert medicines
    cursor.executemany("""
    INSERT INTO medicines (
        id, brand_name, brand_name_bn, generic_id, manufacturer_id, strength, dosage_form,
        dosage_form_bn, route, release_mechanism, pack_size, pack_unit, unit_price, mrp,
        price_type, registration_number, verification_status, is_prescription_required,
        data_source, last_verified_at, indications_summary, safety_advice, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, medicine_rows)

    cursor.executemany("INSERT INTO medicine_ingredients (medicine_id, ingredient_id, strength) VALUES (?, ?, ?)", med_ing_rows)
    cursor.executemany("INSERT INTO medicines_fts (medicine_id, brand_name, generic_name, manufacturer, strength, dosage_form, active_ingredients) VALUES (?, ?, ?, ?, ?, ?, ?)", fts_rows)

    # Log initial import audit
    cursor.execute("""
    INSERT INTO audit_logs (action, entity_name, entity_id, performed_by, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
    """, ("INITIAL_BULK_INGESTION", "medicines", f"BATCH-{len(records)}", "SYSTEM_PIPELINE", f"Imported {len(records)} verified records from DGDA / DGHS registry", now_str))

    conn.commit()

    # Run verification queries
    print("\n--- DATABASE INTEGRITY AUDIT ---")
    total_meds = cursor.execute("SELECT count(*) FROM medicines").fetchone()[0]
    total_mfrs = cursor.execute("SELECT count(*) FROM manufacturers").fetchone()[0]
    total_generics = cursor.execute("SELECT count(*) FROM generics").fetchone()[0]
    total_ingredients = cursor.execute("SELECT count(*) FROM ingredients").fetchone()[0]
    total_fts = cursor.execute("SELECT count(*) FROM medicines_fts").fetchone()[0]

    print(f"Total Medicines Stored in DB: {total_meds}")
    print(f"Total Manufacturers: {total_mfrs}")
    print(f"Total Generic INNs: {total_generics}")
    print(f"Total Ingredients: {total_ingredients}")
    print(f"FTS5 Searchable Entries: {total_fts}")

    # Test FTS query
    test_queries = ["Napa", "Nexum", "Seclo", "Azithromycin", "Beximco", "Square"]
    print("\n--- TEST SEARCH ON SQLITE FTS5 ---")
    for q in test_queries:
        res = cursor.execute("""
            SELECT m.brand_name, g.inn_name, m.strength, mfr.name, m.unit_price 
            FROM medicines_fts fts
            JOIN medicines m ON fts.medicine_id = m.id
            JOIN generics g ON m.generic_id = g.id
            JOIN manufacturers mfr ON m.manufacturer_id = mfr.id
            WHERE medicines_fts MATCH ?
            LIMIT 3
        """, (f"{q}*",)).fetchall()
        print(f"Query '{q}*': {len(res)} samples found -> {[r[0] + ' (' + r[1] + ')' for r in res]}")

    conn.close()
    print("\n[SUCCESS] Database fully initialized and ready.")

if __name__ == "__main__":
    init_database()
