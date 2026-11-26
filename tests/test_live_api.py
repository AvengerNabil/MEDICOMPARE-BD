import urllib.request
import json
import sys

def main():
    queries = ['Seclo', 'Losectil', 'Cef-3', 'Monas', 'Pantobex', 'Paracetamol', 'Azithromycin', 'Omeprazole']
    print('=== TESTING NEXT.JS /api/medicines/search ENDPOINT ===')
    for q in queries:
        url = f'http://localhost:3000/api/medicines/search?q={q}'
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            total = data.get('total_matches', 0)
            medicines = data.get('results', [])
            sample_names = [f"{m['brandName']} ({m['strength']}, {m['manufacturer']})" for m in medicines[:2]]
            print(f"[QUERY: {q:<12}] Total Matches: {total:<4} | Sample: {sample_names}")

    print('\n=== TESTING NEXT.JS /api/medicines/alternatives ENDPOINT ===')
    search_url = 'http://localhost:3000/api/medicines/search?q=Seclo'
    with urllib.request.urlopen(search_url) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        first_med = data['results'][2] # Pick 20mg capsule
        med_id = first_med['id']
        print(f"Reference med: {first_med['brandName']} {first_med['strength']} ({first_med['dosageForm']}) - ID: {med_id}")

    alt_url = f'http://localhost:3000/api/medicines/alternatives?id={med_id}'
    with urllib.request.urlopen(alt_url) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        exact = data.get('exactMatches', [])
        alts = data.get('alternativeFormulations', [])
        print(f"Exact bioequivalent matches found: {len(exact)}")
        print(f"Alternative formulations found: {len(alts)}")
        print("Sample exact bioequivalents from competing manufacturers:")
        for m in exact[:5]:
            print(f"  - {m['brandName']} ({m['genericName']} {m['strength']}) by {m['manufacturer']} @ BDT {m['unitPrice']}")

if __name__ == '__main__':
    main()
