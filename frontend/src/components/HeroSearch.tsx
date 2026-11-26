'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Medicine } from '@/types/medicine';
import { MEDICINES, DATABASE_STATS } from '@/data/bangladeshMedicines';
import { formatBDT, formatNumberBn } from '@/lib/utils';
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  TrendingDown, 
  Building, 
  Info,
  X,
  Filter,
  Pill,
  Database,
  Loader2
} from 'lucide-react';

interface HeroSearchProps {
  onSelectMedicine: (medicine: Medicine) => void;
  onOpenAdminModal?: () => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({ 
  onSelectMedicine,
  onOpenAdminModal
}) => {
  const { locale, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'brand' | 'generic' | 'mfr'>('all');
  const [dosageFilter, setDosageFilter] = useState<string>('all');
  const [suggestions, setSuggestions] = useState<Medicine[]>([]);
  const [totalMatchesCount, setTotalMatchesCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Quick popular search triggers
  const popularKeywords = [
    { label: 'Seclo 20', query: 'Seclo' },
    { label: 'Losectil 20', query: 'Losectil' },
    { label: 'Napa 500mg', query: 'Napa' },
    { label: 'Nexum 20', query: 'Nexum' },
    { label: 'Cef-3 200mg', query: 'Cef-3' },
    { label: 'Monas 10', query: 'Monas' },
    { label: 'Pantobex 20', query: 'Pantobex' },
    { label: 'Azithromycin', query: 'Azithromycin' },
    { label: 'Paracetamol', query: 'Paracetamol' },
  ];

  // Dynamic Live Search directly from full database API
  useEffect(() => {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      setSuggestions([]);
      setTotalMatchesCount(0);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const url = `/api/medicines/search?q=${encodeURIComponent(cleanQuery)}&type=${filterType}&dosage=${dosageFilter}&limit=12`;
        const res = await fetch(url, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.results || []);
          setTotalMatchesCount(data.total_matches || 0);
          setIsOpen(true);
        } else {
          fallbackLocalSearch(cleanQuery);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          fallbackLocalSearch(cleanQuery);
        }
      } finally {
        setIsLoading(false);
      }
    }, 180); // Fast 180ms debounce

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, filterType, dosageFilter]);

  // Fallback to local array in case network is disconnected
  const fallbackLocalSearch = (cleanQuery: string) => {
    const terms = cleanQuery.toLowerCase().split(/\s+/).filter(Boolean);
    const matches = MEDICINES.filter((med) => {
      if (dosageFilter !== 'all' && med.dosageForm.toLowerCase() !== dosageFilter.toLowerCase()) {
        return false;
      }
      const b = med.brandName.toLowerCase();
      const g = med.genericName.toLowerCase();
      const m = med.manufacturer.toLowerCase();
      const s = med.strength.toLowerCase();
      return terms.every(t => b.includes(t) || g.includes(t) || m.includes(t) || s.includes(t));
    });
    setTotalMatchesCount(matches.length);
    setSuggestions(matches.slice(0, 10));
    setIsOpen(true);
  };

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        handleSelect(suggestions[highlightIndex]);
      } else if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (medicine: Medicine) => {
    onSelectMedicine(medicine);
    setQuery(medicine.brandName);
    setIsOpen(false);
  };

  return (
    <section id="hero" className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-20">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-mintLight/40 via-transparent to-transparent pointer-events-none -z-10" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Trust & Scale Badge */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="inline-flex items-center space-x-2 rounded-full border border-brand-teal/20 bg-brand-teal/5 px-4 py-1.5 text-xs font-semibold text-brand-teal shadow-subtle">
            <ShieldCheck className="h-4 w-4" />
            <span>
              {locale === 'bn' 
                ? `ঔষধ প্রশাসন অধিদপ্তর (DGDA) নিবন্ধিত ${formatNumberBn(DATABASE_STATS.currentMedicineCount)}+ ওষুধ অন্তর্ভুক্ত`
                : `${DATABASE_STATS.currentMedicineCount.toLocaleString()}+ DGDA Registered Medicines Indexed`}
            </span>
          </div>

          {onOpenAdminModal && (
            <button
              onClick={onOpenAdminModal}
              className="hidden sm:inline-flex items-center space-x-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-brand-teal hover:text-brand-teal shadow-subtle transition-all"
              title="View verification report & audit metrics"
            >
              <Database className="h-3.5 w-3.5 text-brand-teal" />
              <span>{locale === 'bn' ? 'ডাটা অডিট' : 'Audit Report'}</span>
            </button>
          )}
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-navy leading-[1.15]">
          <span className="text-brand-teal underline decoration-brand-mint decoration-wavy decoration-2 underline-offset-8">
            {t.hero.titleHighlight}
          </span>{' '}
          {t.hero.titleRest}
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-base sm:text-lg lg:text-xl text-brand-muted max-w-3xl mx-auto leading-relaxed">
          {t.hero.subtitle}
        </p>

        {/* Search Experience Container */}
        <div ref={containerRef} className="mt-8 max-w-3xl mx-auto relative text-left">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setFilterType('all')}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  filterType === 'all'
                    ? 'bg-brand-navy text-white shadow-subtle'
                    : 'bg-white text-brand-muted hover:text-brand-text border border-brand-border'
                }`}
              >
                {locale === 'bn' ? 'সবকিছু' : 'All'}
              </button>
              <button
                onClick={() => setFilterType('brand')}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  filterType === 'brand'
                    ? 'bg-brand-teal text-white shadow-subtle'
                    : 'bg-white text-brand-muted hover:text-brand-text border border-brand-border'
                }`}
              >
                {t.hero.byBrand}
              </button>
              <button
                onClick={() => setFilterType('generic')}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  filterType === 'generic'
                    ? 'bg-brand-teal text-white shadow-subtle'
                    : 'bg-white text-brand-muted hover:text-brand-text border border-brand-border'
                }`}
              >
                {t.hero.byGeneric}
              </button>
              <button
                onClick={() => setFilterType('mfr')}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  filterType === 'mfr'
                    ? 'bg-brand-teal text-white shadow-subtle'
                    : 'bg-white text-brand-muted hover:text-brand-text border border-brand-border'
                }`}
              >
                {locale === 'bn' ? 'কোম্পানি' : 'Manufacturer'}
              </button>
            </div>

            {/* Dosage Form Dropdown Filter */}
            <div className="flex items-center space-x-1 text-xs text-brand-muted">
              <Filter className="h-3.5 w-3.5 text-brand-teal" />
              <select
                value={dosageFilter}
                onChange={(e) => setDosageFilter(e.target.value)}
                className="rounded-lg border border-brand-border bg-white px-2.5 py-1 text-xs font-semibold text-brand-text shadow-subtle focus:border-brand-teal focus:outline-none"
              >
                <option value="all">{locale === 'bn' ? 'সকল ডোজ ফর্ম' : 'All Forms'}</option>
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Suspension">Suspension</option>
                <option value="Injection">Injection</option>
                <option value="Eye Drops">Eye Drops</option>
              </select>
            </div>
          </div>

          {/* Search Box Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-brand-teal">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-brand-teal" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (query.trim() && suggestions.length > 0) setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder={t.hero.searchPlaceholder}
              className="w-full rounded-2xl border-2 border-brand-border bg-white pl-12 pr-32 py-4 text-base font-medium text-brand-text placeholder-slate-400 shadow-card hover:border-brand-teal/40 focus:border-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/10 transition-all"
            />

            {/* Clear Input Button */}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  setIsOpen(false);
                }}
                className="absolute right-28 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => {
                if (suggestions.length > 0) handleSelect(suggestions[0]);
              }}
              className="absolute right-2.5 top-2.5 bottom-2.5 rounded-xl bg-brand-navy px-5 text-sm font-semibold text-white shadow-sm hover:bg-brand-deepNavy transition-all active:scale-95 flex items-center space-x-1.5"
            >
              <span>{t.hero.searchBtn}</span>
              <ArrowRight className="h-4 w-4 text-brand-mint" />
            </button>
          </div>

          {/* Live Search Suggestions Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-40 rounded-2xl border border-brand-border bg-white shadow-elevated overflow-hidden divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
              {/* Dropdown Header with Total Count */}
              <div className="bg-slate-50 px-4 py-2 text-xs font-semibold text-brand-muted flex items-center justify-between border-b border-slate-100">
                <span className="flex items-center space-x-1.5">
                  <Database className="h-3.5 w-3.5 text-brand-teal" />
                  <span>
                    {locale === 'bn' 
                      ? `${formatNumberBn(totalMatchesCount)}টি ওষুধ পাওয়া গেছে` 
                      : `Found ${totalMatchesCount.toLocaleString()} matches across database`}
                  </span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {locale === 'bn' ? `শীর্ষ ${suggestions.length}টি প্রদর্শিত` : `Showing top ${suggestions.length}`}
                </span>
              </div>

              {suggestions.length > 0 ? (
                suggestions.map((med, idx) => {
                  const isHighlighted = idx === highlightIndex;
                  return (
                    <div
                      key={med.id}
                      onClick={() => handleSelect(med)}
                      onMouseEnter={() => setHighlightIndex(idx)}
                      className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${
                        isHighlighted ? 'bg-teal-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-teal/10 text-brand-teal shrink-0">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-bold text-brand-text text-sm">
                              {med.brandName}
                            </span>
                            <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[11px] font-semibold text-slate-700">
                              {med.strength}
                            </span>
                            <span className="rounded bg-teal-100/60 px-1.5 py-0.2 text-[10px] font-medium text-teal-800">
                              {med.dosageForm}
                            </span>
                          </div>
                          <div className="mt-0.5 text-xs text-brand-muted flex flex-wrap items-center gap-1.5">
                            <span className="font-medium text-slate-700">{med.genericName}</span>
                            <span>•</span>
                            <span className="text-slate-500">{med.manufacturer}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-3">
                        <div className="text-sm font-bold text-brand-navy">
                          {formatBDT(med.unitPrice)}
                          <span className="text-[10px] font-normal text-slate-500"> /pc</span>
                        </div>
                        <div className="text-[10px] text-brand-teal font-medium flex items-center justify-end space-x-1">
                          <ShieldCheck className="h-3 w-3" />
                          <span>{med.priceType === 'OFFICIAL_MRP' ? 'DGDA MRP' : 'Verified'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-sm text-brand-muted">
                  <Info className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                  <p className="font-semibold text-brand-text">{t.common.noResultsTitle}</p>
                  <p className="text-xs mt-1 text-slate-500">{t.common.noResultsDesc}</p>
                </div>
              )}
            </div>
          )}

          {/* Quick Keywords Chips */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 text-xs">
            <span className="text-brand-muted font-medium mr-1">{t.hero.popularSearches}</span>
            {popularKeywords.map((item) => (
              <button
                key={item.query}
                onClick={() => {
                  setQuery(item.query);
                }}
                className="rounded-full bg-slate-100 px-2.5 py-1 text-brand-text font-medium hover:bg-brand-mintLight/80 hover:text-brand-teal transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Real Metrics Highlights */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-subtle flex items-center space-x-3.5 text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-brand-teal">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-black text-brand-navy font-sans">
                {locale === 'bn' ? formatNumberBn(DATABASE_STATS.currentMedicineCount) + '+' : `${DATABASE_STATS.currentMedicineCount.toLocaleString()}+`}
              </div>
              <div className="text-xs text-brand-muted">
                {locale === 'bn' ? 'যাচাইকৃত নিবন্ধিত ওষুধ' : 'Verified DGDA Medicines'}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-subtle flex items-center space-x-3.5 text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-black text-brand-navy font-sans">
                {locale === 'bn' ? formatNumberBn(DATABASE_STATS.uniqueManufacturersCount) + '+' : `${DATABASE_STATS.uniqueManufacturersCount}+`}
              </div>
              <div className="text-xs text-brand-muted">
                {locale === 'bn' ? 'লাইসেন্সপ্রাপ্ত ওষুধ প্রস্তুতকারক' : 'Licensed Manufacturers'}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-subtle flex items-center space-x-3.5 text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-black text-brand-navy font-sans">
                {locale === 'bn' ? formatNumberBn(DATABASE_STATS.uniqueGenericsCount) + '+' : `${DATABASE_STATS.uniqueGenericsCount.toLocaleString()}+`}
              </div>
              <div className="text-xs text-brand-muted">
                {locale === 'bn' ? 'জেনেরিক ও ফর্মুলেশন গ্রুপ' : 'Generic Formulations'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
