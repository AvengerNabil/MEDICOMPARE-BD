'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { TherapeuticCategory, Medicine } from '@/types/medicine';
import { THERAPEUTIC_CATEGORIES, MEDICINES } from '@/data/bangladeshMedicines';
import { formatNumberBn } from '@/lib/utils';
import { 
  Flame, 
  HeartPulse, 
  ShieldAlert, 
  Activity, 
  Wind, 
  Pill, 
  Brain, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface CategoryBrowseProps {
  onSelectCategoryMedicine: (medicine: Medicine) => void;
}

export const CategoryBrowse: React.FC<CategoryBrowseProps> = ({ onSelectCategoryMedicine }) => {
  const { locale, t } = useLanguage();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="h-5 w-5 text-amber-500" />;
      case 'HeartPulse': return <HeartPulse className="h-5 w-5 text-rose-500" />;
      case 'ShieldAlert': return <ShieldAlert className="h-5 w-5 text-indigo-500" />;
      case 'Activity': return <Activity className="h-5 w-5 text-emerald-500" />;
      case 'Wind': return <Wind className="h-5 w-5 text-cyan-500" />;
      case 'Pill': return <Pill className="h-5 w-5 text-teal-600" />;
      case 'Brain': return <Brain className="h-5 w-5 text-purple-500" />;
      default: return <Sparkles className="h-5 w-5 text-amber-400" />;
    }
  };

  const handleCategoryClick = (category: TherapeuticCategory) => {
    // Find representative drug in this category
    const found = MEDICINES.find(m => m.therapeuticClass.toLowerCase().includes(category.name.toLowerCase().split(' ')[0]));
    if (found) {
      onSelectCategoryMedicine(found);
    } else {
      onSelectCategoryMedicine(MEDICINES[0]);
    }
  };

  return (
    <section id="categories" className="py-12 bg-slate-50/60 border-y border-brand-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
              {t.categories.title}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-brand-muted max-w-2xl">
              {t.categories.subtitle}
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-xs font-semibold text-brand-teal flex items-center space-x-1 cursor-pointer hover:underline">
            <span>{t.categories.viewAll}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {THERAPEUTIC_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              className="group cursor-pointer rounded-2xl border border-brand-border bg-white p-5 shadow-subtle hover:border-brand-teal/40 hover:shadow-cardHover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 group-hover:scale-110 transition-transform">
                    {getIcon(cat.iconName)}
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {locale === 'bn' ? `${formatNumberBn(cat.brandCount)}টি ব্র্যান্ড` : `${cat.brandCount} brands`}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold text-brand-text group-hover:text-brand-teal transition-colors line-clamp-1">
                  {locale === 'bn' ? cat.nameBn : cat.name}
                </h3>
                <p className="mt-1.5 text-xs text-brand-muted line-clamp-2 leading-relaxed">
                  {locale === 'bn' ? cat.descriptionBn : cat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1">
                {cat.commonGenerics.slice(0, 2).map((gen) => (
                  <span key={gen} className="rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-medium text-teal-800">
                    {gen}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
