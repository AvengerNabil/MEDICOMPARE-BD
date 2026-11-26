import os
import sys
import sqlite3
import psycopg2
from psycopg2.extras import execute_batch
import time

def migrate_to_supabase(sqlite_path, postgres_url):
    print("=== STARTING DIRECT STREAMING MIGRATION TO SUPABASE ===")
    print(f"Source SQLite: {sqlite_path}")

    # Connect SQLite
    s_conn = sqlite3.connect(sqlite_path)
    s_conn.row_factory = sqlite3.Row
    s_cur = s_conn.cursor()

    # Connect PostgreSQL
    print("Connecting to Supabase PostgreSQL...")
    p_conn = psycopg2.connect(postgres_url)
    p_cur = p_conn.cursor()

    start_time = time.time()

    try:
        # 1. Manufacturers
        s_cur.execute("SELECT * FROM manufacturers")
        mfr_rows = [dict(r) for r in s_cur.fetchall()]
        for r in mfr_rows:
            r['is_who_gmp'] = bool(r.get('is_who_gmp', 1))
        print(f"Migrating {len(mfr_rows)} manufacturers...")
        mfr_sql = """
            INSERT INTO public.manufacturers (id, name, name_bn, short_name, dgda_license, headquarters, is_who_gmp, total_brands, created_at)
            VALUES (%(id)s, %(name)s, %(name_bn)s, %(short_name)s, %(dgda_license)s, %(headquarters)s, %(is_who_gmp)s, %(total_brands)s, %(created_at)s)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                dgda_license = EXCLUDED.dgda_license,
                total_brands = EXCLUDED.total_brands;
        """
        execute_batch(p_cur, mfr_sql, mfr_rows, page_size=500)
        p_conn.commit()
        print(f"✓ Manufacturers migrated successfully.")

        # 2. Generics
        s_cur.execute("SELECT * FROM generics")
        gen_rows = [dict(r) for r in s_cur.fetchall()]
        print(f"Migrating {len(gen_rows)} generics...")
        gen_sql = """
            INSERT INTO public.generics (id, inn_name, inn_name_bn, therapeutic_class, therapeutic_class_bn, description, created_at)
            VALUES (%(id)s, %(inn_name)s, %(inn_name_bn)s, %(therapeutic_class)s, %(therapeutic_class_bn)s, %(description)s, %(created_at)s)
            ON CONFLICT (id) DO UPDATE SET
                inn_name = EXCLUDED.inn_name,
                therapeutic_class = EXCLUDED.therapeutic_class;
        """
        execute_batch(p_cur, gen_sql, gen_rows, page_size=500)
        p_conn.commit()
        print(f"✓ Generics migrated successfully.")

        # 3. Ingredients
        s_cur.execute("SELECT * FROM ingredients")
        ing_rows = [dict(r) for r in s_cur.fetchall()]
        print(f"Migrating {len(ing_rows)} ingredients...")
        ing_sql = """
            INSERT INTO public.ingredients (id, name, created_at)
            VALUES (%(id)s, %(name)s, %(created_at)s)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name;
        """
        execute_batch(p_cur, ing_sql, ing_rows, page_size=500)
        p_conn.commit()
        print(f"✓ Ingredients migrated successfully.")

        # 4. Medicines (Batch streaming)
        s_cur.execute("SELECT * FROM medicines")
        total_meds = 0
        batch_size = 1000
        med_sql = """
            INSERT INTO public.medicines (
                id, brand_name, brand_name_bn, generic_id, manufacturer_id, strength, dosage_form,
                dosage_form_bn, route, release_mechanism, pack_size, pack_unit, unit_price, mrp,
                price_type, registration_number, verification_status, is_prescription_required,
                data_source, last_verified_at, indications_summary, safety_advice, created_at
            ) VALUES (
                %(id)s, %(brand_name)s, %(brand_name_bn)s, %(generic_id)s, %(manufacturer_id)s, %(strength)s, %(dosage_form)s,
                %(dosage_form_bn)s, %(route)s, %(release_mechanism)s, %(pack_size)s, %(pack_unit)s, %(unit_price)s, %(mrp)s,
                %(price_type)s, %(registration_number)s, %(verification_status)s, %(is_prescription_required)s,
                %(data_source)s, %(last_verified_at)s, %(indications_summary)s, %(safety_advice)s, %(created_at)s
            ) ON CONFLICT (id) DO UPDATE SET
                unit_price = EXCLUDED.unit_price,
                mrp = EXCLUDED.mrp,
                last_verified_at = EXCLUDED.last_verified_at;
        """

        while True:
            batch = [dict(r) for r in s_cur.fetchmany(batch_size)]
            if not batch:
                break
            # Ensure boolean conversion
            for item in batch:
                item['is_prescription_required'] = bool(item.get('is_prescription_required', 1))
            execute_batch(p_cur, med_sql, batch, page_size=500)
            p_conn.commit()
            total_meds += len(batch)
            print(f"  Streamed {total_meds} / 21646 medicines...")

        print(f"✓ Total {total_meds} medicines migrated successfully.")

        # 5. Medicine Ingredients Junction
        s_cur.execute("SELECT * FROM medicine_ingredients")
        total_junction = 0
        junc_sql = """
            INSERT INTO public.medicine_ingredients (medicine_id, ingredient_id, strength)
            VALUES (%(medicine_id)s, %(ingredient_id)s, %(strength)s)
            ON CONFLICT (medicine_id, ingredient_id) DO NOTHING;
        """
        while True:
            batch = [dict(r) for r in s_cur.fetchmany(batch_size)]
            if not batch:
                break
            execute_batch(p_cur, junc_sql, batch, page_size=500)
            p_conn.commit()
            total_junction += len(batch)

        print(f"✓ Total {total_junction} medicine-ingredient mappings migrated successfully.")

        duration = time.time() - start_time
        print(f"\n=== MIGRATION COMPLETED IN {duration:.2f}s ===")

    except Exception as e:
        p_conn.rollback()
        print(f"MIGRATION ERROR: {e}")
        raise e
    finally:
        p_cur.close()
        p_conn.close()
        s_conn.close()

if __name__ == "__main__":
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL environment variable is required to execute streaming migration.")
        print("Usage: python scripts/stream_migration_to_supabase.py")
        sys.exit(1)
    migrate_to_supabase("medicompare.db", db_url)
