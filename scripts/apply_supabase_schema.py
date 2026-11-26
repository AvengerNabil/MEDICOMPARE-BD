import os
import psycopg2

def apply_schema():
    db_url = "postgresql://postgres.nfrzwsqudmvrluysqjfo:UT4-34cjrDAqesz@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
    schema_file = "backend/migrations/V001__baseline_medicompare_schema.sql"

    print("Connecting to Supabase PostgreSQL...")
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cur = conn.cursor()

    print(f"Reading {schema_file}...")
    with open(schema_file, "r", encoding="utf-8") as f:
        sql = f.read()

    print("Executing V001 baseline schema...")
    cur.execute(sql)
    print("✓ V001 Schema executed successfully!")

    # Verify tables
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name;
    """)
    tables = [r[0] for r in cur.fetchall()]
    print("\nVerified Public Tables in Supabase:")
    for t in tables:
        print(f"  - {t}")

    cur.close()
    conn.close()

if __name__ == "__main__":
    apply_schema()
