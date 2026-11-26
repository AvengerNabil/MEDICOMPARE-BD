import os
import sys
import json
import sqlite3
import argparse

def generate_inserts(sqlite_path, output_sql_path):
    conn = sqlite3.connect(sqlite_path)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    print(f"Generating PostgreSQL transaction inserts from {sqlite_path}...")
    
    with open(output_sql_path, "w", encoding="utf-8") as out:
        out.write("-- ==============================================================================\n")
        out.write("-- MediCompare BD — Batch Data Migration into Supabase PostgreSQL\n")
        out.write(f"-- Exported: {sqlite_path}\n")
        out.write("-- ==============================================================================\n\n")
        out.write("BEGIN;\n\n")
        out.write("SET statement_timeout = 0;\n\n")

        # 1. Manufacturers
        c.execute("SELECT * FROM manufacturers")
        mfrs = c.fetchall()
        out.write(f"-- 1. Manufacturers ({len(mfrs)} records)\n")
        for r in mfrs:
            id_val = r['id'].replace("'", "''")
            name_val = r['name'].replace("'", "''")
            name_bn_val = ("'" + r['name_bn'].replace("'", "''") + "'") if r['name_bn'] else "NULL"
            short_name = ("'" + r['short_name'].replace("'", "''") + "'") if r['short_name'] else "NULL"
            dgda_license = ("'" + r['dgda_license'].replace("'", "''") + "'") if r['dgda_license'] else "NULL"
            headquarters = ("'" + r['headquarters'].replace("'", "''") + "'") if r['headquarters'] else "NULL"
            is_who_gmp = "TRUE" if r['is_who_gmp'] else "FALSE"
            total_brands = r['total_brands'] if r['total_brands'] is not None else 0
            created_at = ("'" + r['created_at'] + "'") if r['created_at'] else "NOW()"

            out.write(f"INSERT INTO public.manufacturers (id, name, name_bn, short_name, dgda_license, headquarters, is_who_gmp, total_brands, created_at) "
                      f"VALUES ('{id_val}', '{name_val}', {name_bn_val}, {short_name}, {dgda_license}, {headquarters}, {is_who_gmp}, {total_brands}, {created_at}) "
                      f"ON CONFLICT (id) DO NOTHING;\n")

        # 2. Generics
        c.execute("SELECT * FROM generics")
        gens = c.fetchall()
        out.write(f"\n-- 2. Generics ({len(gens)} records)\n")
        for r in gens:
            id_val = r['id'].replace("'", "''")
            inn_name = r['inn_name'].replace("'", "''")
            inn_name_bn = ("'" + r['inn_name_bn'].replace("'", "''") + "'") if r['inn_name_bn'] else "NULL"
            ther_class = ("'" + r['therapeutic_class'].replace("'", "''") + "'") if r['therapeutic_class'] else "NULL"
            ther_class_bn = ("'" + r['therapeutic_class_bn'].replace("'", "''") + "'") if r['therapeutic_class_bn'] else "NULL"
            desc = ("'" + r['description'].replace("'", "''") + "'") if r['description'] else "NULL"
            created_at = ("'" + r['created_at'] + "'") if r['created_at'] else "NOW()"

            out.write(f"INSERT INTO public.generics (id, inn_name, inn_name_bn, therapeutic_class, therapeutic_class_bn, description, created_at) "
                      f"VALUES ('{id_val}', '{inn_name}', {inn_name_bn}, {ther_class}, {ther_class_bn}, {desc}, {created_at}) "
                      f"ON CONFLICT (id) DO NOTHING;\n")

        # 3. Ingredients
        c.execute("SELECT * FROM ingredients")
        ings = c.fetchall()
        out.write(f"\n-- 3. Ingredients ({len(ings)} records)\n")
        for r in ings:
            id_val = r['id'].replace("'", "''")
            name_val = r['name'].replace("'", "''")
            created_at = ("'" + r['created_at'] + "'") if r['created_at'] else "NOW()"

            out.write(f"INSERT INTO public.ingredients (id, name, created_at) "
                      f"VALUES ('{id_val}', '{name_val}', {created_at}) "
                      f"ON CONFLICT (id) DO NOTHING;\n")

        # 4. Medicines
        c.execute("SELECT * FROM medicines")
        meds = c.fetchall()
        out.write(f"\n-- 4. Medicines ({len(meds)} records)\n")
        for r in meds:
            id_val = r['id'].replace("'", "''")
            brand = r['brand_name'].replace("'", "''")
            brand_bn = ("'" + r['brand_name_bn'].replace("'", "''") + "'") if r['brand_name_bn'] else "NULL"
            gen_id = r['generic_id'].replace("'", "''")
            mfr_id = r['manufacturer_id'].replace("'", "''")
            strength = r['strength'].replace("'", "''")
            form = r['dosage_form'].replace("'", "''")
            form_bn = ("'" + r['dosage_form_bn'].replace("'", "''") + "'") if r['dosage_form_bn'] else "NULL"
            route = ("'" + r['route'].replace("'", "''") + "'") if r['route'] else "'Oral'"
            release = ("'" + r['release_mechanism'].replace("'", "''") + "'") if r['release_mechanism'] else "'Immediate Release'"
            pack_size = r['pack_size'] if r['pack_size'] is not None else 10
            pack_unit = ("'" + r['pack_unit'].replace("'", "''") + "'") if r['pack_unit'] else "NULL"
            unit_price = r['unit_price'] if r['unit_price'] is not None else 0.0
            mrp = r['mrp'] if r['mrp'] is not None else 0.0
            price_type = ("'" + r['price_type'].replace("'", "''") + "'") if r['price_type'] else "'OFFICIAL_MRP'"
            reg_num = r['registration_number'].replace("'", "''")
            ver_status = ("'" + r['verification_status'].replace("'", "''") + "'") if r['verification_status'] else "'OFFICIAL_VERIFIED'"
            is_rx = "TRUE" if r['is_prescription_required'] else "FALSE"
            data_src = ("'" + r['data_source'].replace("'", "''") + "'") if r['data_source'] else "NULL"
            last_ver = ("'" + r['last_verified_at'] + "'") if r['last_verified_at'] else "NOW()"
            indications = ("'" + r['indications_summary'].replace("'", "''") + "'") if r['indications_summary'] else "NULL"
            safety = ("'" + r['safety_advice'].replace("'", "''") + "'") if r['safety_advice'] else "NULL"
            created_at = ("'" + r['created_at'] + "'") if r['created_at'] else "NOW()"

            out.write(f"INSERT INTO public.medicines (id, brand_name, brand_name_bn, generic_id, manufacturer_id, strength, dosage_form, dosage_form_bn, route, release_mechanism, pack_size, pack_unit, unit_price, mrp, price_type, registration_number, verification_status, is_prescription_required, data_source, last_verified_at, indications_summary, safety_advice, created_at) "
                      f"VALUES ('{id_val}', '{brand}', {brand_bn}, '{gen_id}', '{mfr_id}', '{strength}', '{form}', {form_bn}, {route}, {release}, {pack_size}, {pack_unit}, {unit_price}, {mrp}, {price_type}, '{reg_num}', {ver_status}, {is_rx}, {data_src}, {last_ver}, {indications}, {safety}, {created_at}) "
                      f"ON CONFLICT (id) DO NOTHING;\n")

        # 5. Medicine Ingredients
        c.execute("SELECT * FROM medicine_ingredients")
        med_ings = c.fetchall()
        out.write(f"\n-- 5. Medicine Ingredients Junction ({len(med_ings)} records)\n")
        for r in med_ings:
            med_id = r['medicine_id'].replace("'", "''")
            ing_id = r['ingredient_id'].replace("'", "''")
            strength = ("'" + r['strength'].replace("'", "''") + "'") if r['strength'] else "NULL"

            out.write(f"INSERT INTO public.medicine_ingredients (medicine_id, ingredient_id, strength) "
                      f"VALUES ('{med_id}', '{ing_id}', {strength}) "
                      f"ON CONFLICT (medicine_id, ingredient_id) DO NOTHING;\n")

        out.write("\nCOMMIT;\n")

    print(f"PostgreSQL migration script generated: {output_sql_path}")

if __name__ == "__main__":
    generate_inserts("medicompare.db", "backend/migrations/V002__populate_medicompare_data.sql")
