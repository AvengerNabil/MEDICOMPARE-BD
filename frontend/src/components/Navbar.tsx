'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { DATABASE_STATS } from '@/data/bangladeshMedicines';
import { formatNumberBn } from '@/lib/utils';
import {
  ShieldCheck,
  Menu,
  X,
  FileText,
  Languages,
  Activity,
  Search,
  Scale,
  Building2,
  Calculator,
  Database,
  BarChart3
} from 'lucide-react';

interface NavbarProps {
  onOpenOcr: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenAdminModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenOcr,
  onNavigateSection,
  onOpenAdminModal
}) => {
  const { locale, toggleLocale, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    onNavigateSection(sectionId);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-border/80 bg-brand-surface/90 backdrop-blur-md transition-all">
      {/* Top micro-bar for regulatory attribution & live database scale */}
      <div className="bg-brand-deepNavy px-4 py-1.5 text-xs text-slate-300 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-mint animate-pulse" />
            <span className="font-medium text-slate-200">
              {locale === 'bn'
                ? `ঔষধ প্রশাসন অধিদপ্তর (DGDA) ও স্বাস্থ্য অধিদপ্তর নির্দেশিকা • ${formatNumberBn(DATABASE_STATS.currentMedicineCount)}+ ওষুধ অন্তর্ভুক্ত`
                : `Aligned with DGDA & DGHS FHIR Drug Registry • ${DATABASE_STATS.currentMedicineCount.toLocaleString()}+ Registered Medicines`}
            </span>
          </div>
          <div className="hidden items-center space-x-4 md:flex text-slate-400">
            <button
              onClick={onOpenAdminModal}
              className="text-xs text-brand-mint hover:underline flex items-center space-x-1"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>{locale === 'bn' ? 'ডাটাবেজ গ্রোথ অডিট' : 'Database Audit & Reports'}</span>
            </button>
            <span>•</span>
            <span className="text-slate-300">{locale === 'bn' ? 'বাংলাদেশ' : 'Dhaka, Bangladesh'}</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('hero')}
          className="flex cursor-pointer items-center space-x-3 group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-teal to-brand-navy shadow-md shadow-brand-teal/20 transition-transform group-hover:scale-105">
            <Activity className="h-6 w-6 text-brand-mint" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-extrabold tracking-tight text-brand-navy font-sans">
                MediCompare
              </span>
              <span className="rounded-md bg-brand-teal/10 px-1.5 py-0.5 text-xs font-bold text-brand-teal uppercase tracking-wider">
                BD
              </span>
            </div>
            <span className="text-[11px] font-medium text-brand-muted">
              {locale === 'bn' ? 'স্মার্ট ওষুধ তথ্য ও মূল্য তুলনা' : 'Medicine Intelligence Platform'}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center space-x-1 lg:flex">
          <button
            onClick={() => handleNavClick('hero')}
            className="rounded-lg px-3 py-2 text-sm font-medium text-brand-text hover:bg-slate-100/80 transition-colors"
          >
            {t.nav.home}
          </button>
          <button
            onClick={() => handleNavClick('categories')}
            className="rounded-lg px-3 py-2 text-sm font-medium text-brand-text hover:bg-slate-100/80 transition-colors"
          >
            {t.nav.generics}
          </button>
          <button
            onClick={() => handleNavClick('comparison')}
            className="rounded-lg px-3 py-2 text-sm font-medium text-brand-text hover:bg-slate-100/80 transition-colors"
          >
            {t.nav.compare}
          </button>
          <button
            onClick={() => handleNavClick('calculator')}
            className="rounded-lg px-3 py-2 text-sm font-medium text-brand-text hover:bg-slate-100/80 transition-colors"
          >
            {t.nav.calculator}
          </button>
          <button
            onClick={() => handleNavClick('manufacturers')}
            className="rounded-lg px-3 py-2 text-sm font-medium text-brand-text hover:bg-slate-100/80 transition-colors"
          >
            {t.nav.manufacturers}
          </button>
          <button
            onClick={onOpenAdminModal}
            className="rounded-lg px-3 py-2 text-sm font-bold text-brand-teal hover:bg-teal-50 transition-colors flex items-center space-x-1"
          >
            <Database className="h-4 w-4" />
            <span>{locale === 'bn' ? 'অডিট রিপোর্ট' : 'DB Audit'}</span>
          </button>
          <button
            onClick={() => handleNavClick('faq')}
            className="rounded-lg px-3 py-2 text-sm font-medium text-brand-text hover:bg-slate-100/80 transition-colors"
          >
            {t.nav.about}
          </button>
        </nav>

        {/* Action Controls & Language Switcher */}
        <div className="flex items-center space-x-3">
          {/* Language Toggle Pill */}
          <button
            onClick={toggleLocale}
            className="flex items-center space-x-1.5 rounded-full border border-brand-border bg-slate-50 px-3 py-1.5 text-xs font-semibold text-brand-text shadow-subtle hover:bg-slate-100 transition-all active:scale-95"
            title={locale === 'en' ? 'বাংলায় দেখুন' : 'Switch to English'}
          >
            <Languages className="h-3.5 w-3.5 text-brand-teal" />
            <span className={locale === 'bn' ? 'font-bold text-brand-teal' : 'text-slate-500'}>
              {locale === 'en' ? 'বাংলা' : 'EN'}
            </span>
          </button>

          {/* OCR Upload Button */}
          <button
            onClick={onOpenOcr}
            className="hidden sm:inline-flex items-center space-x-2 rounded-xl bg-brand-teal px-4 py-2 text-xs font-semibold text-white shadow-card hover:bg-brand-tealHover transition-all active:scale-95"
          >
            <FileText className="h-4 w-4" />
            <span>{t.nav.scanPrescription}</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-brand-text hover:bg-slate-100 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-brand-border bg-white px-4 pt-2 pb-6 shadow-xl lg:hidden">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => handleNavClick('hero')}
              className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-brand-text hover:bg-slate-50"
            >
              <Search className="h-4 w-4 text-brand-teal" />
              <span>{t.nav.home}</span>
            </button>
            <button
              onClick={() => handleNavClick('categories')}
              className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-brand-text hover:bg-slate-50"
            >
              <Activity className="h-4 w-4 text-brand-teal" />
              <span>{t.nav.generics}</span>
            </button>
            <button
              onClick={() => handleNavClick('comparison')}
              className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-brand-text hover:bg-slate-50"
            >
              <Scale className="h-4 w-4 text-brand-teal" />
              <span>{t.nav.compare}</span>
            </button>
            <button
              onClick={() => handleNavClick('calculator')}
              className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-brand-text hover:bg-slate-50"
            >
              <Calculator className="h-4 w-4 text-brand-teal" />
              <span>{t.nav.calculator}</span>
            </button>
            <button
              onClick={() => handleNavClick('manufacturers')}
              className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-brand-text hover:bg-slate-50"
            >
              <Building2 className="h-4 w-4 text-brand-teal" />
              <span>{t.nav.manufacturers}</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdminModal();
              }}
              className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-left text-sm font-bold text-brand-teal hover:bg-teal-50"
            >
              <Database className="h-4 w-4 text-brand-teal" />
              <span>{locale === 'bn' ? 'ডাটাবেজ গ্রোথ অডিট রিপোর্ট' : 'Database Growth & Audit Report'}</span>
            </button>
            <button
              onClick={() => handleNavClick('faq')}
              className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-brand-text hover:bg-slate-50"
            >
              <ShieldCheck className="h-4 w-4 text-brand-teal" />
              <span>{t.nav.about}</span>
            </button>

            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenOcr();
                }}
                className="flex w-full items-center justify-center space-x-2 rounded-xl bg-brand-teal py-3 text-sm font-semibold text-white shadow-card active:scale-95"
              >
                <FileText className="h-4 w-4" />
                <span>{t.nav.scanPrescription}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
