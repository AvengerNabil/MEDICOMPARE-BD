import os

def check():
    env_vars = {}
    path = ".env"
    if not os.path.exists(path):
        print("NO_ENV_FILE")
        return

    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env_vars[k.strip()] = v.strip().strip("\"'")

    db_url = env_vars.get("DATABASE_URL", "")
    anon_key = env_vars.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")

    db_ok = bool(db_url and "PASTE" not in db_url)
    anon_ok = bool(anon_key and "PASTE" not in anon_key)

    print(f"DB_CONFIGURED: {db_ok}")
    if db_ok and "@" in db_url:
        print(f"DB_HOST: {db_url.split('@')[1]}")
    print(f"ANON_CONFIGURED: {anon_ok}")

if __name__ == "__main__":
    check()
