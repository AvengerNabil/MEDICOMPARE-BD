import sys
import os

# Add root directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.api.v1.endpoints.medicines import (
    ALL_MEDICINES,
    search_medicines,
    get_matching_alternatives,
    get_database_stats
)
from backend.app.api.v1.endpoints.comparison import calculate_savings, SavingsRequest

def test_expanded_dataset_metrics():
    assert len(ALL_MEDICINES) >= 10000, f"Expected at least 10,000 medicines, found {len(ALL_MEDICINES)}"
    stats = get_database_stats()
    assert stats["current_medicine_count"] >= 10000
    assert stats["unique_brands_count"] >= 5000
    assert stats["unique_manufacturers_count"] >= 100
    assert stats["officially_verified_count"] >= 10000

def test_search_medicines_by_brand():
    results = search_medicines(q="Napa", type="brand", limit=10)
    assert results["total_matches"] > 0
    assert any("napa" in m["brandName"].lower() for m in results["results"])

def test_search_medicines_by_generic():
    results = search_medicines(q="Paracetamol", type="generic", limit=10)
    assert results["total_matches"] >= 100

def test_matching_alternatives():
    search_res = search_medicines(q="Paracetamol", limit=1)
    target = search_res["results"][0]
    match_result = get_matching_alternatives(target["id"])
    assert "reference_medicine" in match_result
    assert "exact_composition_matches" in match_result
    assert "medical_safety_notice" in match_result

def test_savings_calculation():
    req = SavingsRequest(
        original_unit_price=7.0,
        alternative_unit_price=6.0,
        daily_dosage=2,
        duration_days=30
    )
    res = calculate_savings(req)
    assert res.total_quantity == 60
    assert res.original_total_cost == 420.0
    assert res.alternative_total_cost == 360.0
    assert res.potential_savings == 60.0
    assert res.savings_percentage == 14.3
    assert res.monthly_impact == 60.0
    assert res.yearly_impact == 720.0

if __name__ == "__main__":
    test_expanded_dataset_metrics()
    test_search_medicines_by_brand()
    test_search_medicines_by_generic()
    test_matching_alternatives()
    test_savings_calculation()
    print("[ALL EXPANDED BACKEND UNIT TESTS PASSED WITH 100% SUCCESS]")
