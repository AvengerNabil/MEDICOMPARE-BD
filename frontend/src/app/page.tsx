'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Navbar } from '@/components/Navbar';
import { HeroSearch } from '@/components/HeroSearch';
import { MedicalSafetyNotice } from '@/components/MedicalSafetyNotice';
import { CategoryBrowse } from '@/components/CategoryBrowse';
import { ComparisonMatrix } from '@/components/ComparisonMatrix';
import { SavingsCalculator } from '@/components/SavingsCalculator';
import { ManufacturerDirectory } from '@/components/ManufacturerDirectory';
import { PrescriptionModal } from '@/components/PrescriptionModal';
import { MedicineDetailModal } from '@/components/MedicineDetailModal';
import { AdminDashboardModal } from '@/components/AdminDashboardModal';
import { FAQSection } from '@/components/FAQSection';
import { Footer } from '@/components/Footer';
import { MEDICINES } from '@/data/bangladeshMedicines';
import { Medicine } from '@/types/medicine';

export default function HomePage() {
  const { locale } = useLanguage();

  // Primary selected reference medicine (default to Nexum 20 or Napa 500)
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine>(
    MEDICINES.find((m) => m.id === 'med-nexum-20') || MEDICINES[0]
  );

  // Selected alternative medicine for savings calculator
  const [alternativeMedicine, setAlternativeMedicine] = useState<Medicine>(
    MEDICINES.find((m) => m.id === 'med-esonix-20') || MEDICINES[1]
  );

  // Deep detail modal state
  const [detailMedicine, setDetailMedicine] = useState<Medicine | null>(null);

  // Prescription OCR modal state
  const [isOcrOpen, setIsOcrOpen] = useState(false);

  // Admin Dashboard & Audit modal state
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Handle medicine selection from Hero Search or Category
  const handleSelectMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    // Auto-select a matching alternative if available
    const alt = MEDICINES.find(
      (m) =>
        m.genericId === medicine.genericId &&
        m.strength === medicine.strength &&
        m.dosageForm === medicine.dosageForm &&
        m.id !== medicine.id
    );
    if (alt) {
      setAlternativeMedicine(alt);
    }

    // Scroll smoothly to comparison section
    const compEl = document.getElementById('comparison');
    if (compEl) {
      compEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle selecting an alternative directly into calculator
  const handleSelectAlternative = (target: Medicine, alt: Medicine) => {
    setSelectedMedicine(target);
    setAlternativeMedicine(alt);
    const calcEl = document.getElementById('calculator');
    if (calcEl) {
      calcEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${locale === 'bn' ? 'font-bangla' : ''}`}>
      {/* Sticky Header */}
      <Navbar
        onOpenOcr={() => setIsOcrOpen(true)}
        onNavigateSection={handleNavigateSection}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero Search Section */}
        <HeroSearch 
          onSelectMedicine={handleSelectMedicine}
          onOpenAdminModal={() => setIsAdminModalOpen(true)}
        />

        {/* 2. Medical Safety Warning Banner */}
        <MedicalSafetyNotice />

        {/* 3. Browse by Therapeutic Category */}
        <CategoryBrowse onSelectCategoryMedicine={handleSelectMedicine} />

        {/* 4. Generic Matching & Price Comparison Matrix */}
        <ComparisonMatrix
          selectedMedicine={selectedMedicine}
          onSelectAlternative={handleSelectAlternative}
          onOpenDetails={(med) => setDetailMedicine(med)}
        />

        {/* 5. Potential Savings Calculator */}
        <SavingsCalculator
          targetMedicine={selectedMedicine}
          alternativeMedicine={alternativeMedicine}
        />

        {/* 6. Pharmaceutical Manufacturer Directory */}
        <ManufacturerDirectory
          onSelectManufacturer={handleSelectMedicine}
        />

        {/* 7. Frequently Asked Questions */}
        <FAQSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <PrescriptionModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onSelectDetectedMedicine={handleSelectMedicine}
      />

      <MedicineDetailModal
        medicine={detailMedicine}
        onClose={() => setDetailMedicine(null)}
        onCompareWithThis={handleSelectMedicine}
      />

      <AdminDashboardModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </div>
  );
}
