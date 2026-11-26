import os

with open(".env", "r", encoding="utf-8") as f:
    for line in f:
        if line.startswith("DATABASE_URL="):
            val = line.split("=", 1)[1].strip()
            # print masked
            print("Length of DB URL:", len(val))
            print("Starts with:", val[:30])
            print("Ends with:", val[-30:])
