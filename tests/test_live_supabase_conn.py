import os
import psycopg2

def load_db_url():
    if not os.path.exists(".env"):
        return None
    with open(".env", "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line.startswith("DATABASE_URL="):
                val = line.split("=", 1)[1].strip().strip("\"'")
                return val
    return None

def test_conn():
    db_url = load_db_url()
    if not db_url:
        print("STATUS: NO_DATABASE_URL")
        return

    print("Attempting connection to Supabase PostgreSQL...")
    try:
        conn = psycopg2.connect(db_url, connect_timeout=10)
        cur = conn.cursor()
        cur.execute("SELECT version();")
        ver = cur.fetchone()[0]
        print("STATUS: SUCCESS")
        print("PostgreSQL Version:", ver[:60])
        
        # Check existing tables
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        tables = [r[0] for r in cur.fetchall()]
        print("Existing Public Tables:", tables)
        cur.close()
        conn.close()
    except Exception as e:
        print("STATUS: FAILED")
        print("Error details:", type(e).__name__, str(e)[:200])

if __name__ == "__main__":
    test_conn()
