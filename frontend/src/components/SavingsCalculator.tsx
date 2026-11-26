'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Medicine } from '@/types/medicine';
import { MEDICINES } from '@/data/bangladeshMedicines';
import { formatBDT, formatNumberBn } from '@/lib/utils';
import { 
  Calculator, 
  TrendingDown, 
  Calendar, 
  ArrowRight, 
  Info, 
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';

interface SavingsCalculatorProps {
  targetMedicine: Medicine;
  alternativeMedicine: Medicine;
}

export const SavingsCalculator: React.FC<SavingsCalculatorProps> = ({
  targetMedicine: initialTarget,
  alternativeMedicine: initialAlt,
}) => {
  const { locale, t } = useLanguage();
  const [targetMed, setTargetMed] = useState<Medicine>(initialTarget);
  const [altMed, setAltMed] = useState<Medicine>(initialAlt);
  const [dailyDose, setDailyDose] = useState<number>(2); // 2 units per day
  const [durationDays, setDurationDays] = useState<number>(30); // 30 days default

  useEffect(() => {
    setTargetMed(initialTarget);
  }, [initialTarget]);

  useEffect(() => {
    setAltMed(initialAlt);
  }, [initialAlt]);

  // All matching alternatives
  const availableAlternatives = MEDICINES.filter(
    (m) =>
      m.genericId === targetMed.genericId &&
      m.strength === targetMed.strength &&
      m.dosageForm === targetMed.dosageForm
  );

  const totalQuantity = dailyDose * durationDays;
  const originalTotalCost = targetMed.unitPrice * totalQuantity;
  const alternativeTotalCost = altMed.unitPrice * totalQuantity;
  const potentialSavings = Math.max(0, originalTotalCost - alternativeTotalCost);
  const savingsPercent = originalTotalCost > 0 ? Math.round((potentialSavings / originalTotalCost) * 100) : 0;

  // Monthly and Annualized projections
  const monthlySavings = Math.max(0, (targetMed.unitPrice - altMed.unitPrice) * dailyDose * 30);
  const yearlySavings = monthlySavings * 12;

  return (
    <section id="calculator" className="py-12 sm:py-16 bg-slate-50/70 border-t border-brand-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center space-x-1.5 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
            <Calculator className="h-3.5 w-3.5" />
            <span>{t.calculator.title}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
            {t.calculator.subtitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-7 rounded-3xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-6">
            {/* Step 1: Target Medicine Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                1. {t.calculator.originalMedicine}
              </label>
              <select
                value={targetMed.id}
                onChange={(e) => {
                  const found = MEDICINES.find((m) => m.id === e.target.value);
                  if (found) {
                    setTargetMed(found);
                    const altMatch = MEDICINES.find(
                      (m) =>
                        m.genericId === found.genericId &&
                        m.strength === found.strength &&
                        m.id !== found.id
                    );
                    if (altMatch) setAltMed(altMatch);
                  }
                }}
                className="w-full rounded-xl border border-brand-border bg-white p-3 text-sm font-semibold text-brand-text shadow-subtle focus:border-brand-teal focus:outline-none"
              >
                {MEDICINES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.brandName} ({m.genericName} {m.strength}) — {m.manufacturer} [{formatBDT(m.unitPrice)}/pc]
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Alternative Medicine Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                2. {t.calculator.alternativeMedicine}
              </label>
              <select
                value={altMed.id}
                onChange={(e) => {
                  const found = MEDICINES.find((m) => m.id === e.target.value);
                  if (found) setAltMed(found);
                }}
                className="w-full rounded-xl border border-brand-border bg-white p-3 text-sm font-semibold text-brand-text shadow-subtle focus:border-brand-teal focus:outline-none"
              >
                {availableAlternatives.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.brandName} — {m.manufacturer} [{formatBDT(m.unitPrice)}/pc]
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Daily Dose Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                  3. {t.calculator.dailyDoseLabel}
                </label>
                <span className="rounded bg-teal-50 px-2 py-0.5 text-xs font-bold text-brand-teal">
                  {dailyDose} {dailyDose > 1 ? 'tablets/day' : 'tablet/day'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={dailyDose}
                onChange={(e) => setDailyDose(Number(e.target.value))}
                className="w-full accent-brand-teal cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>1 pc/day (Once daily)</span>
                <span>2 pcs/day (BD)</span>
                <span>3 pcs/day (TDS)</span>
                <span>4+ pcs/day</span>
              </div>
            </div>

            {/* Step 4: Duration Pill Buttons */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                4. {t.calculator.durationLabel}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDurationDays(7)}
                  className={`rounded-xl border p-2.5 text-xs font-bold transition-all ${
                    durationDays === 7
                      ? 'border-brand-teal bg-teal-50 text-brand-teal shadow-subtle'
                      : 'border-brand-border bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.calculator.duration7Days}
                </button>
                <button
                  type="button"
                  onClick={() => setDurationDays(30)}
                  className={`rounded-xl border p-2.5 text-xs font-bold transition-all ${
                    durationDays === 30
                      ? 'border-brand-teal bg-teal-50 text-brand-teal shadow-subtle'
                      : 'border-brand-border bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.calculator.duration30Days}
                </button>
                <button
                  type="button"
                  onClick={() => setDurationDays(90)}
                  className={`rounded-xl border p-2.5 text-xs font-bold transition-all ${
                    durationDays === 90
                      ? 'border-brand-teal bg-teal-50 text-brand-teal shadow-subtle'
                      : 'border-brand-border bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.calculator.duration90Days}
                </button>
              </div>
            </div>

            {/* Disclaimer & Formula Footnote */}
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/60 text-xs text-brand-muted flex items-start space-x-2.5">
              <Info className="h-4 w-4 text-brand-teal shrink-0 mt-0.5" />
              <span>{t.calculator.formulaNote}</span>
            </div>
          </div>

          {/* Results Projection Card */}
          <div className="lg:col-span-5 rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/70 p-6 sm:p-8 shadow-elevated">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                {t.calculator.projectedSavings}
              </span>
              {savingsPercent > 0 && (
                <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                  {savingsPercent}% {t.calculator.savingsPercent}
                </span>
              )}
            </div>

            {/* Large Savings Amount */}
            <div className="mt-4">
              <div className="text-4xl sm:text-5xl font-extrabold text-brand-navy tracking-tight font-sans">
                {formatBDT(potentialSavings)}
              </div>
              <div className="mt-1 text-xs text-emerald-700 font-medium">
                {locale === 'bn'
                  ? `${formatNumberBn(durationDays)} দিনে মোট সম্ভাব্য সাশ্রয়`
                  : `Projected savings over ${durationDays} days treatment`}
              </div>
            </div>

            {/* Breakdown Bars */}
            <div className="mt-8 space-y-4 pt-6 border-t border-emerald-200/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-muted font-medium">
                  {t.calculator.estimatedOriginalCost} ({targetMed.brandName}):
                </span>
                <span className="font-bold text-brand-text">
                  {formatBDT(originalTotalCost)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-muted font-medium">
                  {t.calculator.estimatedAlternativeCost} ({altMed.brandName}):
                </span>
                <span className="font-bold text-emerald-700">
                  {formatBDT(alternativeTotalCost)}
                </span>
              </div>
            </div>

            {/* Long-Term Impact Projections */}
            <div className="mt-8 grid grid-cols-2 gap-3 pt-6 border-t border-emerald-200/80 text-center">
              <div className="rounded-2xl bg-white p-3.5 border border-emerald-100 shadow-subtle">
                <div className="text-[11px] text-brand-muted">{t.calculator.monthlyImpact}</div>
                <div className="text-lg font-extrabold text-emerald-700 mt-0.5">
                  {formatBDT(monthlySavings)}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-3.5 border border-emerald-100 shadow-subtle">
                <div className="text-[11px] text-brand-muted">{t.calculator.yearlyImpact}</div>
                <div className="text-lg font-extrabold text-emerald-800 mt-0.5">
                  {formatBDT(yearlySavings)}
                </div>
              </div>
            </div>

            {/* Compliance confirmation checkmark */}
            <div className="mt-6 flex items-center space-x-2 text-xs text-slate-500 justify-center">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Verified DGDA Registered Pricing</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
