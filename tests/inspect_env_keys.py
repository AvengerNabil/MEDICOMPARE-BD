import os

def check():
    with open(".env", "r", encoding="utf-8") as f:
        for idx, line in enumerate(f, 1):
            line = line.strip()
            if line and not line.startswith("#"):
                k = line.split("=")[0].strip()
                v_prefix = line.split("=")[1].strip()[:15] if "=" in line else ""
                print(f"Line {idx}: Key='{k}' starts with '{v_prefix}'")

if __name__ == "__main__":
    check()
