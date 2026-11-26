# MediCompare BD 🇧🇩
> **Bangladesh's Premium Pharmaceutical Intelligence & Medicine Price Comparison Platform**  
> *“Compare Medicines. Understand Better. Save Smarter.”*  
> *“ওষুধ চিনুন, দাম তুলনা করুন, সচেতন সিদ্ধান্ত নিন।”*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![DGDA Aligned](https://img.shields.io/badge/DGDA-21%2C646%2B%20Medicines-102A43?style=for-the-badge&logo=medico)](https://dgda.gov.bd)

---

## 🌟 Overview

**MediCompare BD** is an award-winning health-tech platform designed specifically for Bangladesh to solve medicine cost opacity and patient drug literacy. It enables citizens, healthcare professionals, and researchers to verify prescribed medicines, discover bioequivalent generic brands, calculate potential prescription cost savings, and access authentic regulatory data synchronized with the **Directorate General of Drug Administration (DGDA)** and **DGHS FHIR Registered Drugs ValueSet**.

---

## 🚀 Key Features

- **🔍 Multi-Term Partial & Fuzzy Search**:
  - Instant lookups across **21,646+ genuine medicines** by brand name, generic INN, manufacturer, or active ingredients in both **English and বাংলা (Bengali)**.
  - Live dosage form filtering (Tablet, Capsule, Syrup, Suspension, Injection, Eye Drops).
- **⚖️ Generic Matching & Bioequivalence Differentiation**:
  - **Exact Composition Matches**: Strictly compares active pharmaceutical ingredients (API), exact strength, and dosage form.
  - **Alternative Strengths & Formulations**: Clear clinical separation for differing strengths or release mechanisms, accompanied by physician consultation notices.
- **💰 Smart Savings Calculator**:
  - Real-time potential savings projection: $(\text{Unit Price}_{\text{ref}} - \text{Unit Price}_{\text{alt}}) \times (\text{Daily Dose} \times \text{Days})$.
  - Visual monthly and annualized cost impact breakdowns in Bangladeshi Taka (৳).
- **📋 Prescription OCR Assistant**:
  - Optical character recognition simulation for prescription images with candidate drug identification and mandatory patient verification.
- **🏢 Pharmaceutical Manufacturers Directory**:
  - Profiles for 232+ DGDA-licensed WHO-GMP pharmaceutical manufacturers in Bangladesh (Square, Beximco, Incepta, Renata, Opsonin, Eskayef, ACI, Healthcare, Aristopharma, etc.).
- **📊 Admin Database Audit & Growth Dashboard**:
  - Real-time visualization of database metrics, verification statuses, duplicate candidate prevention logs, and downloadable audit reports (**JSON** and **CSV**).
- **🌐 Bilingual by Design**:
  - Native typography tuned for Bengali (**Hind Siliguri**) and English (**Inter / Manrope**).

---

## 📊 Database Metrics & Provenance

The platform dataset is strictly compiled from authorized DGDA and DGHS records without artificial or fabricated entries:

| Metric | Pre-Expansion Baseline | Current Platform Scale |
| :--- | :--- | :--- |
| **Total Valid Medicines** | 25 | **21,646** |
| **Unique Commercial Brands** | 18 | **13,929** |
| **Unique Generic INNs** | 6 | **1,661** |
| **Active Pharmaceutical Ingredients (APIs)** | 8 | **1,685** |
| **Licensed Pharmaceutical Companies** | 9 | **232** |
| **Officially Verified Records (MRP & DAR)** | 25 | **21,568** |
| **Secondary Verified Records** | 0 | **78** |
| **Duplicates Filtered by Multi-Factor Key** | 0 | **66** |
| **Data Sources** | Sample | **DGDA Allopathic Drug Registry & DGHS FHIR ValueSet** |

---

## 🏗️ Architecture & Technology Stack

```
medicompare-bd/
├── frontend/                       # Next.js 14 App Router, TypeScript, Tailwind CSS
│   ├── src/
│   │   ├── app/                    # Pages, layouts, globals.css (Inter & Hind Siliguri)
│   │   ├── components/             # Navbar, HeroSearch, ComparisonMatrix, SavingsCalculator, AdminDashboard
│   │   ├── context/                # LanguageProvider (EN / BN state)
│   │   ├── data/                   # Verified medicine datasets & statistics
│   │   ├── lib/                    # i18n dictionaries & formatting utilities
│   │   └── types/                  # TypeScript pharmaceutical models
├── backend/                        # Python FastAPI (/api/v1/)
│   ├── app/
│   │   ├── api/v1/endpoints/       # medicines, comparison, manufacturers
│   │   ├── core/config.py          # CORS, authentication & server settings
│   │   ├── models/entities.py      # SQLAlchemy normalized entities
│   │   └── main.py                 # FastAPI application root
├── data/
│   ├── raw/                        # Original DGDA CSV sources
│   ├── processed/                  # Normalized JSON pharmaceutical records
│   ├── reports/                    # Import summary audit reports (JSON / CSV)
│   └── validation/                 # Duplicate prevention & quarantined logs
└── tests/
    ├── test_backend.py             # Python unit testing suite
    └── verify_frontend.mjs         # Live frontend integration test suite
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v18.0.0+ (Node 24 tested)
- **Python**: v3.11+
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/AvengerNabil/MEDICOMPARE-BD.git
cd MEDICOMPARE-BD
```

### 2. Frontend Setup & Launch
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

To run the optimized production build:
```bash
npm run build
npm run start
```

### 3. Backend Setup (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Interactive API documentation will be available at [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs).

### 4. Running Verification Test Suites
```bash
# Frontend integration & assertion verification
node tests/verify_frontend.mjs

# Backend pharmaceutical matching & calculation test
python tests/test_backend.py
```

---

## ⚖️ Medical Safety Disclaimer
*MediCompare BD is an informational price transparency and drug literacy intelligence platform. It does NOT provide clinical prescriptions, medical diagnoses, or automated drug substitutions. Formulations, release mechanisms, and individual patient bioequivalence must always be evaluated and approved by a registered medical practitioner before altering any prescribed medication.*

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

Developed with precision for Bangladesh healthcare transparency.
