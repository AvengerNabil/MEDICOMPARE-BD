'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Medicine } from '@/types/medicine';
import { formatBDT } from '@/lib/utils';
import { 
  X, 
  ShieldCheck, 
  Building, 
  Pill, 
  Layers, 
  Calendar, 
  FileCheck, 
  Scale,
  AlertCircle
} from 'lucide-react';

interface MedicineDetailModalProps {
  medicine: Medicine | null;
  onClose: () => void;
  onCompareWithThis: (medicine: Medicine) => void;
}

export const MedicineDetailModal: React.FC<MedicineDetailModalProps> = ({
  medicine,
  onClose,
  onCompareWithThis,
}) => {
  const { locale, t } = useLanguage();

  if (!medicine) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl border border-brand-border bg-white p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-brand-border">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-md bg-brand-teal/10 px-2 py-0.5 text-xs font-bold text-brand-teal uppercase">
                {medicine.therapeuticClass}
              </span>
              {medicine.isPrescriptionRequired ? (
                <span className="rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                  {t.common.rxOnly}
                </span>
              ) : (
                <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                  {t.common.otc}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-brand-navy mt-1.5">
              {locale === 'bn' ? medicine.brandNameBn : medicine.brandName}
            </h2>
            <p className="text-sm font-semibold text-brand-muted">
              {medicine.genericName} • {medicine.strength}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Details Content */}
        <div className="overflow-y-auto py-5 space-y-6 text-xs sm:text-sm">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
              <div className="text-[11px] text-brand-muted">Unit MRP</div>
              <div className="text-base font-extrabold text-brand-navy mt-0.5">
                {formatBDT(medicine.unitPrice)}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
              <div className="text-[11px] text-brand-muted">Pack MRP</div>
              <div className="text-base font-bold text-brand-navy mt-0.5">
                {formatBDT(medicine.mrp)}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
              <div className="text-[11px] text-brand-muted">Dosage Form</div>
              <div className="text-base font-bold text-brand-navy mt-0.5">
                {medicine.dosageForm}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
              <div className="text-[11px] text-brand-muted">Release Type</div>
              <div className="text-xs font-bold text-brand-teal mt-1">
                {medicine.releaseMechanism}
              </div>
            </div>
          </div>

          {/* Active Ingredients Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-2">
              Active Pharmaceutical Ingredients (API)
            </h4>
            <div className="rounded-2xl border border-brand-border overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-brand-border font-semibold text-slate-600">
                  <tr>
                    <th className="p-3">Ingredient</th>
                    <th className="p-3 text-right">Strength</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medicine.activeIngredients.map((ing, i) => (
                    <tr key={i}>
                      <td className="p-3 font-semibold text-brand-text">{ing.name}</td>
                      <td className="p-3 text-right text-slate-600">{ing.strength}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Manufacturer & Registration Provenance */}
          <div className="rounded-2xl border border-brand-border bg-slate-50/50 p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
              Regulatory Provenance & Manufacturer
            </h4>
            <div className="flex items-center space-x-2 text-brand-text">
              <Building className="h-4 w-4 text-brand-teal" />
              <span className="font-semibold">{medicine.manufacturer}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600 text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>DGDA DAR License: {medicine.registrationNumber} ({medicine.verificationStatus})</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-500 text-xs">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>Last price verified on {medicine.lastVerifiedDate} via {medicine.dataSource}</span>
            </div>
          </div>

          {/* Clinical Indication Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-1.5">
              Standard Indications Summary
            </h4>
            <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-2xl border border-brand-border">
              {locale === 'bn' ? medicine.indicationsSummaryBn : medicine.indicationsSummary}
            </p>
          </div>

          {/* Safety & Precautions */}
          <div className="rounded-2xl bg-amber-50/80 p-4 border border-amber-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center space-x-1.5 mb-1">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span>Safety Advice & Precautions</span>
            </h4>
            <p className="text-amber-900/90 leading-relaxed text-xs">
              {locale === 'bn' ? medicine.safetyAdviceBn : medicine.safetyAdvice}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-brand-border flex items-center justify-between">
          <button
            onClick={onClose}
            className="rounded-xl border border-brand-border px-4 py-2 text-xs font-semibold text-brand-text hover:bg-slate-50"
          >
            {t.common.close}
          </button>

          <button
            onClick={() => {
              onCompareWithThis(medicine);
              onClose();
            }}
            className="rounded-xl bg-brand-teal px-5 py-2 text-xs font-semibold text-white shadow-card hover:bg-brand-tealHover transition-all flex items-center space-x-1.5"
          >
            <Scale className="h-3.5 w-3.5" />
            <span>Compare Brands with {medicine.brandName}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
