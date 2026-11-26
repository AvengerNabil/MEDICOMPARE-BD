import os
import sys
import json
import sqlite3
import argparse
from datetime import datetime

def extract_tables(sqlite_path, output_dir="data/migration_payloads"):
    os.makedirs(output_dir, exist_ok=True)
    conn = sqlite3.connect(sqlite_path)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    tables = ['manufacturers', 'generics', 'ingredients', 'medicines', 'medicine_ingredients']
    stats = {}

    print(f"=== EXTRACTING DATA FROM {sqlite_path} ===")
    for table in tables:
        c.execute(f"SELECT * FROM {table}")
        rows = [dict(r) for r in c.fetchall()]
        stats[table] = len(rows)
        out_file = os.path.join(output_dir, f"{table}.json")
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(rows, f, ensure_ascii=False, indent=2)
        print(f"Exported {table}: {len(rows)} records -> {out_file}")

    print("\nSummary of extracted entities:")
    for k, v in stats.items():
        print(f"  {k}: {v}")

    return stats

def main():
    parser = argparse.ArgumentParser(description="Extract SQLite tables for Supabase PostgreSQL migration")
    parser.add_argument("--sqlite", default="medicompare.db", help="Path to SQLite database")
    parser.add_argument("--out", default="data/migration_payloads", help="Output directory")
    args = parser.parse_args()

    extract_tables(args.sqlite, args.out)

if __name__ == "__main__":
    main()
