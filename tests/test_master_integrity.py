import os
import sys
import unittest
import sqlite3
import json

class TestMediCompareIntegrity(unittest.TestCase):

    def setUp(self):
        self.db_path = "medicompare.db"
        self.assertTrue(os.path.exists(self.db_path), "Database file must exist")
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
        self.cursor = self.conn.cursor()

    def tearDown(self):
        self.conn.close()

    def test_record_counts(self):
        self.cursor.execute("SELECT COUNT(*) FROM medicines")
        self.assertEqual(self.cursor.fetchone()[0], 21646)

        self.cursor.execute("SELECT COUNT(*) FROM generics")
        self.assertEqual(self.cursor.fetchone()[0], 1661)

        self.cursor.execute("SELECT COUNT(*) FROM manufacturers")
        self.assertEqual(self.cursor.fetchone()[0], 232)

        self.cursor.execute("SELECT COUNT(*) FROM ingredients")
        self.assertEqual(self.cursor.fetchone()[0], 1705)

        self.cursor.execute("SELECT COUNT(*) FROM medicine_ingredients")
        self.assertEqual(self.cursor.fetchone()[0], 26346)

    def test_referential_integrity(self):
        # 1. No orphan generics
        self.cursor.execute("""
            SELECT COUNT(*) FROM medicines m
            LEFT JOIN generics g ON m.generic_id = g.id
            WHERE g.id IS NULL
        """)
        self.assertEqual(self.cursor.fetchone()[0], 0, "No medicines should have missing generics")

        # 2. No orphan manufacturers
        self.cursor.execute("""
            SELECT COUNT(*) FROM medicines m
            LEFT JOIN manufacturers mfr ON m.manufacturer_id = mfr.id
            WHERE mfr.id IS NULL
        """)
        self.assertEqual(self.cursor.fetchone()[0], 0, "No medicines should have missing manufacturers")

    def test_popular_medicine_search(self):
        test_queries = ['Seclo', 'Losectil', 'Cef-3', 'Monas', 'Pantobex', 'Paracetamol']
        for q in test_queries:
            self.cursor.execute("""
                SELECT COUNT(*) FROM medicines m
                JOIN generics g ON m.generic_id = g.id
                JOIN manufacturers mfr ON m.manufacturer_id = mfr.id
                WHERE LOWER(m.brand_name) LIKE LOWER(?) OR LOWER(g.inn_name) LIKE LOWER(?)
            """, (f"%{q}%", f"%{q}%"))
            count = self.cursor.fetchone()[0]
            self.assertGreater(count, 0, f"Query '{q}' should return at least 1 real match")

    def test_bioequivalent_comparison(self):
        # Query Seclo 20mg capsule
        self.cursor.execute("""
            SELECT m.id, m.generic_id, m.strength, m.dosage_form
            FROM medicines m
            WHERE LOWER(m.brand_name) = 'seclo' AND m.strength = '20 mg'
            LIMIT 1
        """)
        target = self.cursor.fetchone()
        self.assertIsNotNone(target, "Seclo 20mg must exist in database")

        # Find exact bioequivalent alternatives
        self.cursor.execute("""
            SELECT m.brand_name, m.unit_price, mfr.name
            FROM medicines m
            JOIN manufacturers mfr ON m.manufacturer_id = mfr.id
            WHERE m.generic_id = ? AND LOWER(m.strength) = LOWER(?) AND LOWER(m.dosage_form) = LOWER(?)
            ORDER BY m.unit_price ASC
        """, (target['generic_id'], target['strength'], target['dosage_form']))
        matches = self.cursor.fetchall()
        self.assertGreaterEqual(len(matches), 10, "There should be at least 10 competing brands for Omeprazole 20mg")

if __name__ == '__main__':
    unittest.main()
