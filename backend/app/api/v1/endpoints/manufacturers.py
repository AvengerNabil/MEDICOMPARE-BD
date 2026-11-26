from fastapi import APIRouter

router = APIRouter()

MOCK_MANUFACTURERS = [
    {
        "id": "mfr-square",
        "name": "Square Pharmaceuticals PLC",
        "short_name": "Square",
        "established_year": 1958,
        "dgda_license": "DGDA-DL-001",
        "headquarters": "Dhaka, Bangladesh",
        "is_who_gmp": True,
        "total_brands": 840,
    },
    {
        "id": "mfr-beximco",
        "name": "Beximco Pharmaceuticals Ltd",
        "short_name": "Beximco",
        "established_year": 1976,
        "dgda_license": "DGDA-DL-002",
        "headquarters": "Dhaka, Bangladesh",
        "is_who_gmp": True,
        "total_brands": 620,
    },
    {
        "id": "mfr-incepta",
        "name": "Incepta Pharmaceuticals Ltd",
        "short_name": "Incepta",
        "established_year": 1999,
        "dgda_license": "DGDA-DL-003",
        "headquarters": "Dhaka, Bangladesh",
        "is_who_gmp": True,
        "total_brands": 780,
    },
    {
        "id": "mfr-opsonin",
        "name": "Opsonin Pharma Ltd",
        "short_name": "Opsonin",
        "established_year": 1956,
        "dgda_license": "DGDA-DL-005",
        "headquarters": "Barishal, Bangladesh",
        "is_who_gmp": True,
        "total_brands": 510,
    },
]

@router.get("/")
def get_manufacturers():
    return MOCK_MANUFACTURERS
