import os

with open(".env", "r", encoding="utf-8") as f:
    for idx, l in enumerate(f, 1):
        print(f"L{idx}: {l[:40]}")
