import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.api.v1.endpoints.medicines import (
    search_medicines,
    get_database_stats,
    get_matching_alternatives
)

def run_db_search_verification():
    print("=== TESTING REAL DATABASE SEARCH QUERIES ===")
    stats = get_database_stats()
    print(f"Total Medicines in Database: {stats['current_medicine_count']}")
    assert stats['current_medicine_count'] == 21646, f"Expected 21646, got {stats['current_medicine_count']}"

    # Real medicines from different therapeutic classes & manufacturers
    test_queries = [
        "Seclo",        # Square (Omeprazole)
        "Losectil",     # Eskayef (Omeprazole)
        "Cef-3",        # Square (Cefixime)
        "Napa",         # Beximco (Paracetamol)
        "Nexum",        # Beximco (Esomeprazole)
        "Monas",        # Acme (Montelukast)
        "Pantobex",     # Beximco (Pantoprazole)
        "Azithromycin", # Generic INN
        "Paracetamol",  # Generic INN
        "Square",       # Manufacturer
        "Renata"        # Manufacturer
    ]

    for q in test_queries:
        res = search_medicines(q=q, limit=5)
        print(f"\n[QUERY: '{q}'] -> Found {res['total_matches']} records.")
        assert res['total_matches'] > 0, f"Query '{q}' returned 0 results!"
        for idx, m in enumerate(res['results'][:3]):
            print(f"  {idx+1}. {m['brandName']} ({m['strength']} {m['dosageForm']}) - {m['genericName']} [{m['manufacturer']}] Price: Tk {m['unitPrice']}")

    # Test exact composition bioequivalent alternatives
    print("\n=== TESTING BIOEQUIVALENT MATCHING ACROSS DB ===")
    seclo = search_medicines(q="Seclo", limit=1)['results'][0]
    alts = get_matching_alternatives(seclo['id'])
    print(f"Target: {seclo['brandName']} {seclo['strength']} {seclo['dosageForm']} ({seclo['genericName']})")
    print(f"Exact Matches found: {alts['total_exact_matches']}")
    print(f"Alternative Formulations found: {alts['alternative_formulations_count']}")
    assert alts['total_exact_matches'] > 0, "No exact matches found for Seclo!"
    for m in alts['exact_composition_matches'][:5]:
        print(f"  -> {m['brandName']} ({m['strength']} {m['dosageForm']}) by {m['manufacturer']} @ Tk {m['unitPrice']}/pc")

    print("\n[ALL REAL DATABASE TESTS PASSED WITH 100% SUCCESS]")

if __name__ == "__main__":
    run_db_search_verification()
