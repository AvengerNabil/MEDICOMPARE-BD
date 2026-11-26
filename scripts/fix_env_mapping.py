import os

def fix_env():
    path = ".env"
    if not os.path.exists(path):
        print("No .env found")
        return

    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    postgres_val = None
    url_val = "https://nfrzwsqudmvrluysqjfo.supabase.co"
    anon_val = "sb_publishable_4ACVzyLPSy8xKQxt2BgW0g_ARaNqy6G"

    for line in lines:
        stripped = line.strip()
        if "postgresql://" in stripped:
            if "=" in stripped:
                postgres_val = stripped.split("=", 1)[1].strip().strip("\"'")
            else:
                postgres_val = stripped

    if not postgres_val:
        print("Error: Could not find postgresql:// in .env")
        return

    # Check if .env.example had anon key
    if os.path.exists(".env.example"):
        with open(".env.example", "r", encoding="utf-8") as f:
            for l in f:
                if l.strip().startswith("SUPABASE_ANON_KEY="):
                    val = l.strip().split("=", 1)[1].strip().strip("\"'")
                    if val and "sb_publishable" in val:
                        anon_val = val

    new_content = f"""# ==============================================================================
# MediCompare BD — Production Supabase Environment
# Target Supabase Project: https://nfrzwsqudmvrluysqjfo.supabase.co
# ==============================================================================

# Supabase Public API Settings
NEXT_PUBLIC_SUPABASE_URL="{url_val}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="{anon_val}"

# Supabase PostgreSQL Connection String
DATABASE_URL="{postgres_val}"

# Server Settings
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_NAME="MediCompare BD"
NEXT_PUBLIC_DEFAULT_LOCALE=en
"""

    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print("SUCCESS: .env rewritten cleanly with correct key mapping.")

if __name__ == "__main__":
    fix_env()
