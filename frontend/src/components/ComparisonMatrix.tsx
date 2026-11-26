'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Medicine } from '@/types/medicine';
import { MEDICINES } from '@/data/bangladeshMedicines';
import { formatBDT, formatNumberBn } from '@/lib/utils';
import { 
  Scale, 
  ShieldCheck, 
  TrendingDown, 
  Eye, 
  Calculator,
  FileCheck2,
  AlertTriangle,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Info,
  Loader2
} from 'lucide-react';

interface ComparisonMatrixProps {
  selectedMedicine: Medicine;
  onSelectAlternative: (target: Medicine, alternative: Medicine) => void;
  onOpenDetails: (medicine: Medicine) => void;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  selectedMedicine,
  onSelectAlternative,
  onOpenDetails,
}) => {
  const { locale, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'exact' | 'formulations'>('exact');
  const [sortOrder, setSortOrder] = useState<'priceAsc' | 'priceDesc' | 'name'>('priceAsc');
  const [mfrFilter, setMfrFilter] = useState<string>('all');
  const [subSearch, setSubSearch] = useState<string>('');

  // Dynamic API state for real database matches
  const [apiExactMatches, setApiExactMatches] = useState<Medicine[]>([]);
  const [apiAlternatives, setApiAlternatives] = useState<Medicine[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);

  const targetGeneric = selectedMedicine.genericName.toLowerCase().trim();
  const targetStrength = selectedMedicine.strength.toLowerCase().trim();
  const targetForm = selectedMedicine.dosageForm.toLowerCase().trim();

  // Fetch real database alternatives dynamically whenever selectedMedicine changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingApi(true);

    fetch(`/api/medicines/alternatives?id=${encodeURIComponent(selectedMedicine.id)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch alternatives');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data.exactMatches)) {
            setApiExactMatches(data.exactMatches);
          }
          if (Array.isArray(data.alternativeFormulations)) {
            setApiAlternatives(data.alternativeFormulations);
          }
          setIsLoadingApi(false);
        }
      })
      .catch((err) => {
        console.warn('Fallback to local array for comparison matrix:', err);
        if (isMounted) {
          setIsLoadingApi(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMedicine.id]);

  // 1. Exact Bioequivalent Composition Matches (Merge API results with local fallback)
  const exactMatches = useMemo(() => {
    if (apiExactMatches.length > 0) {
      return apiExactMatches;
    }
    return MEDICINES.filter((m) => {
      const g = m.genericName.toLowerCase().trim();
      const s = m.strength.toLowerCase().trim();
      const f = m.dosageForm.toLowerCase().trim();
      return g === targetGeneric && s === targetStrength && f === targetForm;
    });
  }, [apiExactMatches, targetGeneric, targetStrength, targetForm]);

  // 2. Alternative Formulations (Same generic, different strength or form)
  const alternativeFormulations = useMemo(() => {
    if (apiAlternatives.length > 0) {
      return apiAlternatives;
    }
    return MEDICINES.filter((m) => {
      const g = m.genericName.toLowerCase().trim();
      const s = m.strength.toLowerCase().trim();
      const f = m.dosageForm.toLowerCase().trim();
      return g === targetGeneric && (s !== targetStrength || f !== targetForm);
    });
  }, [apiAlternatives, targetGeneric, targetStrength, targetForm]);

  // Filter & Sort active list
  const activeList = activeTab === 'exact' ? exactMatches : alternativeFormulations;

  const filteredBrands = useMemo(() => {
    let list = [...activeList];
    if (mfrFilter !== 'all') {
      list = list.filter((m) => m.manufacturer.toLowerCase().includes(mfrFilter.toLowerCase()));
    }
    if (subSearch.trim()) {
      const q = subSearch.toLowerCase().trim();
      list = list.filter((m) => 
        m.brandName.toLowerCase().includes(q) ||
        m.manufacturer.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => {
      if (sortOrder === 'priceAsc') return a.unitPrice - b.unitPrice;
      if (sortOrder === 'priceDesc') return b.unitPrice - a.unitPrice;
      return a.brandName.localeCompare(b.brandName);
    });
  }, [activeList, mfrFilter, subSearch, sortOrder]);

  // Lowest unit price among exact matches
  const lowestPrice = useMemo(() => {
    if (exactMatches.length === 0) return selectedMedicine.unitPrice;
    return Math.min(...exactMatches.map((m) => m.unitPrice));
  }, [exactMatches, selectedMedicine.unitPrice]);

  return (
    <section id="comparison" className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center space-x-1.5 rounded-md bg-brand-teal/10 px-2.5 py-1 text-xs font-bold text-brand-teal uppercase tracking-wider mb-2">
              <Scale className="h-3.5 w-3.5" />
              <span>{t.comparison.title}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
              {t.comparison.subtitle}
            </h2>
          </div>

          {/* Sort Controls */}
          <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-2">
            <span className="text-xs text-brand-muted font-medium">{t.comparison.sortBy}:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs font-semibold text-brand-text shadow-subtle focus:border-brand-teal focus:outline-none"
            >
              <option value="priceAsc">{t.comparison.sortPriceAsc}</option>
              <option value="priceDesc">{t.comparison.sortPriceDesc}</option>
              <option value="name">{t.comparison.sortName}</option>
            </select>
          </div>
        </div>

        {/* Selected Reference Medicine Banner */}
        <div className="rounded-2xl border-2 border-brand-teal/30 bg-teal-50/40 p-4 sm:p-5 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-teal text-white shadow-md">
              <FileCheck2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-brand-teal uppercase tracking-wide">
                  {t.comparison.selectedDrug}
                </span>
                <span className="rounded bg-brand-navy px-2 py-0.5 text-[11px] font-bold text-white">
                  {selectedMedicine.brandName}
                </span>
                <span className="rounded bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 border border-brand-border">
                  {selectedMedicine.strength}
                </span>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  {t.comparison.exactMatchTag}
                </span>
              </div>
              <div className="mt-1 text-sm font-semibold text-brand-text">
                {selectedMedicine.genericName} • {selectedMedicine.manufacturer}
              </div>
              <div className="mt-0.5 text-xs text-brand-muted flex flex-wrap items-center gap-2">
                <span>DGDA DAR: {selectedMedicine.registrationNumber}</span>
                <span>•</span>
                <span className="text-brand-teal font-medium">Release: {selectedMedicine.releaseMechanism}</span>
                <span>•</span>
                <span className="text-slate-500">Dosage Form: {selectedMedicine.dosageForm}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-white px-4 py-2.5 rounded-xl border border-brand-border self-stretch md:self-auto justify-between md:justify-end shadow-subtle">
            <div>
              <div className="text-[11px] text-brand-muted">{t.comparison.colUnitCost}</div>
              <div className="text-lg font-extrabold text-brand-navy">
                {formatBDT(selectedMedicine.unitPrice)}
                <span className="text-xs font-normal text-slate-500"> /pc</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <div className="text-[11px] text-brand-muted">{t.comparison.colPackPrice}</div>
              <div className="text-sm font-bold text-brand-navy">
                {formatBDT(selectedMedicine.mrp)}
                <span className="text-[10px] font-normal text-slate-500"> ({selectedMedicine.packSize} pcs)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Exact Composition vs Different Formulations */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('exact')}
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'exact'
                  ? 'bg-white text-brand-teal shadow-subtle'
                  : 'text-slate-600 hover:text-brand-text'
              }`}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>
                {locale === 'bn' ? 'হুবহু সমমানের বিকল্প' : 'Exact Bioequivalent Matches'} ({exactMatches.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('formulations')}
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'formulations'
                  ? 'bg-white text-amber-700 shadow-subtle'
                  : 'text-slate-600 hover:text-brand-text'
              }`}
            >
              <Layers className="h-4 w-4 text-amber-600" />
              <span>
                {locale === 'bn' ? 'ভিন্ন শক্তি ও ফর্মুলেশন' : 'Alternative Strengths & Forms'} ({alternativeFormulations.length})
              </span>
            </button>
          </div>

          {/* Quick Sub-Filter Search within Comparison Matrix */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={subSearch}
              onChange={(e) => setSubSearch(e.target.value)}
              placeholder={locale === 'bn' ? 'কোম্পানি বা ব্র্যান্ড ফিল্টার...' : 'Filter by brand or manufacturer...'}
              className="rounded-xl border border-brand-border bg-white pl-8 pr-3 py-1.5 text-xs text-brand-text placeholder-slate-400 shadow-subtle focus:border-brand-teal focus:outline-none w-full sm:w-64"
            />
          </div>
        </div>

        {/* Informational Guidance Notice depending on active tab */}
        {activeTab === 'exact' ? (
          <div className="mb-4 rounded-xl bg-emerald-50/70 p-3 border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              {locale === 'bn'
                ? 'এই ব্র্যান্ডগুলো হুবহু একই সক্রিয় রাসায়নিক উপাদান (API), শক্তি এবং ডোজ ফর্ম বহন করে। চিকিৎসকের পরামর্শে এগুলোর মধ্য থেকে সাশ্রয়ী ব্র্যান্ড বেছে নিতে পারেন।'
                : 'These brands contain the exact same Active Pharmaceutical Ingredient (API), strength, and dosage form. You can compare official MRPs to evaluate potential cost savings.'}
            </span>
          </div>
        ) : (
          <div className="mb-4 rounded-xl bg-amber-50 p-3 border border-amber-200 text-xs text-amber-900 flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              {locale === 'bn'
                ? 'সতর্কতা: এই ব্র্যান্ডগুলোর সক্রিয় উপাদান একই হলেও শক্তি (যেমন ২০ মি.গ্রা. বনাম ৪০ মি.গ্রা.) অথবা ডোজ ফর্ম (যেমন ট্যাবলেট বনাম সিরাপ) ভিন্ন। চিকিৎসকের অনুমোদন ছাড়া ডোজ পরিবর্তন করা সম্পূর্ণ নিষিদ্ধ।'
                : 'Clinical Notice: These medicines share the active generic molecule but differ in strength (e.g. 20mg vs 40mg) or formulation (Tablet vs Syrup). Never alter prescribed dosages without a physician.'}
            </span>
          </div>
        )}

        {/* Comparison Table for Desktop */}
        <div className="hidden lg:block overflow-hidden rounded-2xl border border-brand-border bg-white shadow-card">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border bg-slate-50/80 text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                <th className="py-3.5 px-4">{t.comparison.colBrand}</th>
                <th className="py-3.5 px-4">{t.comparison.colGeneric}</th>
                <th className="py-3.5 px-4">{t.comparison.colStrength}</th>
                <th className="py-3.5 px-4">{t.comparison.colMfr}</th>
                <th className="py-3.5 px-4 text-right">{t.comparison.colUnitCost}</th>
                <th className="py-3.5 px-4 text-right">{t.comparison.colPackPrice}</th>
                <th className="py-3.5 px-4 text-center">{t.comparison.colDiff}</th>
                <th className="py-3.5 px-4 text-right">{t.comparison.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredBrands.length > 0 ? (
                filteredBrands.map((med) => {
                  const isSelected = med.id === selectedMedicine.id;
                  const isLowest = med.unitPrice === lowestPrice && activeTab === 'exact';
                  const diffPercent = Math.round(
                    ((med.unitPrice - selectedMedicine.unitPrice) / selectedMedicine.unitPrice) * 100
                  );

                  return (
                    <tr
                      key={med.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-teal-50/50 font-semibold' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-brand-text">
                            {med.brandName}
                          </span>
                          {isLowest && (
                            <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              <TrendingDown className="h-3 w-3" />
                              <span>{t.comparison.lowestPrice}</span>
                            </span>
                          )}
                          {isSelected && (
                            <span className="rounded bg-brand-navy px-1.5 py-0.5 text-[10px] font-semibold text-white">
                              {t.comparison.exactSame}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-brand-teal font-medium flex items-center space-x-1 mt-0.5">
                          <ShieldCheck className="h-3 w-3" />
                          <span>{med.registrationNumber}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-brand-text font-medium">
                        {med.genericName}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div className="font-semibold text-brand-navy">{med.strength}</div>
                        <div className="text-[11px] text-slate-400">{med.dosageForm}</div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-brand-text">
                        <div className="font-medium">{med.manufacturer}</div>
                        <div className="text-[10px] text-slate-400">DGDA Licensed</div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-brand-navy text-sm">
                        {formatBDT(med.unitPrice)}
                      </td>

                      <td className="py-3.5 px-4 text-right text-xs text-slate-600">
                        <div>{formatBDT(med.mrp)}</div>
                        <div className="text-[10px] text-slate-400">({med.packSize} pcs)</div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isSelected ? (
                          <span className="text-xs font-semibold text-slate-400">Reference</span>
                        ) : activeTab === 'exact' ? (
                          diffPercent < 0 ? (
                            <span className="inline-block rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-700">
                              {Math.abs(diffPercent)}% {t.comparison.diffCheaper}
                            </span>
                          ) : diffPercent > 0 ? (
                            <span className="inline-block rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-xs font-bold text-rose-700">
                              +{diffPercent}% {t.comparison.diffHigher}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 font-medium">Same price</span>
                          )
                        ) : (
                          <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            Different Strength
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onSelectAlternative(selectedMedicine, med)}
                            className="rounded-lg bg-brand-teal/10 hover:bg-brand-teal hover:text-white px-2.5 py-1.5 text-xs font-semibold text-brand-teal transition-all flex items-center space-x-1"
                            title="Calculate savings with this medicine"
                          >
                            <Calculator className="h-3.5 w-3.5" />
                            <span>Calc</span>
                          </button>
                          <button
                            onClick={() => onOpenDetails(med)}
                            className="rounded-lg border border-brand-border bg-white hover:bg-slate-100 p-1.5 text-slate-600 transition-colors"
                            title="Inspect full pharmaceutical record"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-brand-muted">
                    No matching medicines found for the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
          {filteredBrands.map((med) => {
            const isSelected = med.id === selectedMedicine.id;
            const isLowest = med.unitPrice === lowestPrice && activeTab === 'exact';
            const diffPercent = Math.round(
              ((med.unitPrice - selectedMedicine.unitPrice) / selectedMedicine.unitPrice) * 100
            );

            return (
              <div
                key={med.id}
                className={`rounded-2xl border p-4 shadow-subtle flex flex-col justify-between ${
                  isSelected ? 'border-brand-teal bg-teal-50/40' : 'border-brand-border bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-text text-base">
                      {med.brandName}
                    </span>
                    {isLowest && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {t.comparison.lowestPrice}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 text-xs text-brand-muted">
                    {med.genericName} • {med.strength} ({med.dosageForm})
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {med.manufacturer}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400">{t.comparison.colUnitCost}</div>
                      <div className="text-base font-extrabold text-brand-navy">
                        {formatBDT(med.unitPrice)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">{t.comparison.colDiff}</div>
                      {isSelected ? (
                        <span className="text-xs font-semibold text-brand-teal">Reference</span>
                      ) : activeTab === 'exact' ? (
                        diffPercent < 0 ? (
                          <span className="text-xs font-bold text-emerald-600">
                            {Math.abs(diffPercent)}% {t.comparison.diffCheaper}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-rose-600">
                            +{diffPercent}% {t.comparison.diffHigher}
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] text-amber-700 font-bold">
                          Diff Strength
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center space-x-2">
                  <button
                    onClick={() => onSelectAlternative(selectedMedicine, med)}
                    className="flex-1 rounded-xl bg-brand-teal py-2 text-xs font-semibold text-white shadow-sm flex items-center justify-center space-x-1.5"
                  >
                    <Calculator className="h-3.5 w-3.5" />
                    <span>Calculate Savings</span>
                  </button>
                  <button
                    onClick={() => onOpenDetails(med)}
                    className="rounded-xl border border-brand-border bg-white p-2 text-slate-600 hover:bg-slate-100"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
