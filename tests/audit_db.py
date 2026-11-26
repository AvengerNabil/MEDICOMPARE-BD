import sqlite3
import json

def audit():
    conn = sqlite3.connect('medicompare.db')
    c = conn.cursor()

    c.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [r[0] for r in c.fetchall()]
    print('DATABASE TABLES:', tables)

    counts = {}
    for t in tables:
        if not t.startswith('sqlite_') and not 'fts' in t:
            c.execute(f"SELECT COUNT(*) FROM {t}")
            counts[t] = c.fetchone()[0]
    print('RECORD COUNTS:', json.dumps(counts, indent=2))

    # Linkage integrity
    c.execute("""
        SELECT COUNT(*) 
        FROM medicines m
        LEFT JOIN generics g ON m.generic_id = g.id
        WHERE g.id IS NULL
    """)
    unlinked_generics = c.fetchone()[0]

    c.execute("""
        SELECT COUNT(*) 
        FROM medicines m
        LEFT JOIN manufacturers mfr ON m.manufacturer_id = mfr.id
        WHERE mfr.id IS NULL
    """)
    unlinked_mfr = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM medicines WHERE unit_price IS NULL OR unit_price <= 0")
    invalid_prices = c.fetchone()[0]

    print('INTEGRITY CHECKS:')
    print(f'  - Unlinked Generics: {unlinked_generics}')
    print(f'  - Unlinked Manufacturers: {unlinked_mfr}')
    print(f'  - Invalid or zero unit prices: {invalid_prices}')

    # Sample table schemas
    schemas = {}
    for t in ['medicines', 'generics', 'manufacturers', 'ingredients']:
        if t in tables:
            c.execute(f"PRAGMA table_info({t});")
            schemas[t] = [f"{r[1]} ({r[2]})" for r in c.fetchall()]
    print('TABLE SCHEMAS:')
    print(json.dumps(schemas, indent=2))

if __name__ == '__main__':
    audit()
