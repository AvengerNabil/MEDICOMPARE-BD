import os
import json
from fastapi import APIRouter, HTTPException, Query, Response
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

router = APIRouter()

PROCESSED_JSON_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../../../data/processed/bangladesh_medicines_full.json")
)
REPORT_JSON_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../../../data/reports/import_summary_report.json")
)
REPORT_CSV_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../../../data/reports/import_summary_report.csv")
)

# Load full processed dataset in memory
ALL_MEDICINES: List[Dict[str, Any]] = []

def load_data():
    global ALL_MEDICINES
    if os.path.exists(PROCESSED_JSON_PATH):
        try:
            with open(PROCESSED_JSON_PATH, "r", encoding="utf-8") as f:
                ALL_MEDICINES = json.load(f)
            print(f"[API] Loaded {len(ALL_MEDICINES)} registered Bangladesh medicines.")
        except Exception as e:
            print(f"[API] Error loading full medicines dataset: {e}")
    else:
        print(f"[API] Warning: {PROCESSED_JSON_PATH} not found.")

load_data()

class ActiveIngredientSchema(BaseModel):
    name: str
    banglaName: Optional[str] = None
    strength: str

class MedicineSchema(BaseModel):
    id: str
    brandName: str
    brandNameBn: Optional[str] = None
    genericName: str
    genericNameBn: Optional[str] = None
    genericId: str
    strength: str
    dosageForm: str
    dosageFormBn: Optional[str] = None
    route: str
    releaseMechanism: str
    manufacturer: str
    manufacturerBn: Optional[str] = None
    manufacturerId: str
    unitPrice: float
    mrp: float
    packSize: int
    packUnit: str
    priceType: str
    isPrescriptionRequired: bool
    registrationNumber: str
    verificationStatus: str
    dataSource: str
    lastVerifiedDate: str
    therapeuticClass: str
    therapeuticClassBn: Optional[str] = None
    activeIngredients: List[ActiveIngredientSchema]
    indicationsSummary: str
    indicationsSummaryBn: Optional[str] = None
    safetyAdvice: str
    safetyAdviceBn: Optional[str] = None

@router.get("/stats/overview")
def get_database_stats():
    """Returns database size, verification distribution, and expansion metrics."""
    if os.path.exists(REPORT_JSON_PATH):
        with open(REPORT_JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    
    unique_brands = len(set(m["brandName"].lower() for m in ALL_MEDICINES))
    unique_generics = len(set(m["genericName"].lower() for m in ALL_MEDICINES))
    unique_mfrs = len(set(m["manufacturer"].lower() for m in ALL_MEDICINES))
    verified = sum(1 for m in ALL_MEDICINES if m["verificationStatus"] == "OFFICIAL_VERIFIED")
    
    return {
        "previous_medicine_count": 25,
        "current_medicine_count": len(ALL_MEDICINES),
        "newly_imported_records": len(ALL_MEDICINES) - 25,
        "unique_brands_count": unique_brands,
        "unique_generic_compositions_count": unique_generics,
        "unique_manufacturers_count": unique_mfrs,
        "officially_verified_count": verified,
        "secondary_verified_count": len(ALL_MEDICINES) - verified,
        "pending_review_count": 0,
        "sources": ["DGDA Bangladesh", "DGHS Core FHIR Registered Drugs ValueSet"]
    }

@router.get("/reports/download")
def download_import_report(format: str = Query("json", description="json or csv")):
    """Allows downloading the official import report in JSON or CSV format."""
    if format == "csv":
        if os.path.exists(REPORT_CSV_PATH):
            with open(REPORT_CSV_PATH, "r", encoding="utf-8") as f:
                content = f.read()
            return Response(
                content=content,
                media_type="text/csv",
                headers={"Content-Disposition": "attachment; filename=medicompare_import_report.csv"}
            )
        raise HTTPException(status_code=404, detail="CSV report not found")
    else:
        if os.path.exists(REPORT_JSON_PATH):
            with open(REPORT_JSON_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        raise HTTPException(status_code=404, detail="JSON report not found")

@router.get("/search")
def search_medicines(
    q: str = Query("", description="Search term for brand, generic, or manufacturer"),
    type: str = Query("all", description="all, brand, generic, mfr, ingredient"),
    dosage_form: Optional[str] = None,
    offset: int = 0,
    limit: int = 20
):
    query = q.lower().strip() if isinstance(q, str) else ""
    type_str = type if isinstance(type, str) else "all"
    filtered = ALL_MEDICINES

    if dosage_form and isinstance(dosage_form, str):
        filtered = [m for m in filtered if m["dosageForm"].lower() == dosage_form.lower()]

    if not query:
        return {
            "total_matches": len(filtered),
            "offset": offset,
            "limit": limit,
            "results": filtered[offset:offset+limit]
        }

    matches = []
    for med in filtered:
        b_name = med["brandName"].lower()
        g_name = med["genericName"].lower()
        m_name = med["manufacturer"].lower()

        is_match = False
        if type == "brand":
            is_match = query in b_name
        elif type == "generic":
            is_match = query in g_name
        elif type == "mfr":
            is_match = query in m_name
        elif type == "ingredient":
            is_match = any(query in ing["name"].lower() for ing in med.get("activeIngredients", []))
        else: # "all"
            is_match = (
                query in b_name or
                query in g_name or
                query in m_name or
                any(query in ing["name"].lower() for ing in med.get("activeIngredients", []))
            )

        if is_match:
            matches.append(med)

    return {
        "total_matches": len(matches),
        "offset": offset,
        "limit": limit,
        "results": matches[offset:offset+limit]
    }

@router.get("/{medicine_id}")
def get_medicine_by_id(medicine_id: str):
    for med in ALL_MEDICINES:
        if med["id"] == medicine_id:
            return med
    raise HTTPException(status_code=404, detail="Medicine not found in DGDA registered registry")

@router.get("/{medicine_id}/alternatives")
def get_matching_alternatives(medicine_id: str):
    target = None
    for med in ALL_MEDICINES:
        if med["id"] == medicine_id:
            target = med
            break

    if not target:
        raise HTTPException(status_code=404, detail="Reference medicine not found")

    target_generic = target["genericName"].lower().strip()
    target_strength = target["strength"].lower().strip()
    target_form = target["dosageForm"].lower().strip()

    # Exact matches: same generic, same strength, same dosage form
    exact_matches = []
    # Formulation differences: same generic, different strength or form
    other_formulations = []

    for m in ALL_MEDICINES:
        if m["id"] == target["id"]:
            continue
        m_gen = m["genericName"].lower().strip()
        if m_gen == target_generic:
            m_str = m["strength"].lower().strip()
            m_form = m["dosageForm"].lower().strip()
            if m_str == target_strength and m_form == target_form:
                exact_matches.append(m)
            else:
                other_formulations.append(m)

    return {
        "reference_medicine": target,
        "exact_composition_matches": exact_matches[:25],
        "total_exact_matches": len(exact_matches),
        "alternative_formulations_count": len(other_formulations),
        "alternative_formulations_sample": other_formulations[:10],
        "medical_safety_notice": "Exact composition matches share identical Active Pharmaceutical Ingredients (API), strength, and dosage form. Any substitution must be evaluated and approved by a registered doctor."
    }
