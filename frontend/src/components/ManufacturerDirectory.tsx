'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Manufacturer, Medicine } from '@/types/medicine';
import { MANUFACTURERS, MEDICINES } from '@/data/bangladeshMedicines';
import { formatNumberBn } from '@/lib/utils';
import { Building2, Award, ExternalLink, ShieldCheck, MapPin } from 'lucide-react';

interface ManufacturerDirectoryProps {
  onSelectManufacturer: (medicine: Medicine) => void;
}

export const ManufacturerDirectory: React.FC<ManufacturerDirectoryProps> = ({
  onSelectManufacturer,
}) => {
  const { locale, t } = useLanguage();

  const handleExplore = (mfr: Manufacturer) => {
    const match = MEDICINES.find((m) => m.manufacturerId === mfr.id);
    if (match) {
      onSelectManufacturer(match);
    }
  };

  return (
    <section id="manufacturers" className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center space-x-1.5 rounded-md bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">
            <Building2 className="h-3.5 w-3.5" />
            <span>{t.directory.title}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
            {t.directory.subtitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MANUFACTURERS.map((mfr) => (
            <div
              key={mfr.id}
              className="group rounded-3xl border border-brand-border bg-white p-6 shadow-subtle hover:border-brand-teal/40 hover:shadow-cardHover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-brand-navy font-black text-lg border border-slate-100 group-hover:bg-teal-50 group-hover:text-brand-teal transition-colors">
                    {mfr.shortName.charAt(0)}
                  </div>
                  {mfr.gmpCertified && (
                    <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                      <Award className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{t.directory.gmpCertified}</span>
                    </span>
                  )}
                </div>

                <h3 className="mt-4 text-lg font-bold text-brand-navy group-hover:text-brand-teal transition-colors">
                  {locale === 'bn' ? mfr.nameBn : mfr.name}
                </h3>

                <div className="mt-1 flex items-center space-x-1.5 text-xs text-brand-muted">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{locale === 'bn' ? mfr.headquartersBn : mfr.headquarters}</span>
                </div>

                <p className="mt-3 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {locale === 'bn' ? mfr.descriptionBn : mfr.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-brand-muted">
                  <span className="font-semibold text-brand-text">
                    {locale === 'bn' ? formatNumberBn(mfr.totalRegisteredBrands) : mfr.totalRegisteredBrands}
                  </span>{' '}
                  {locale === 'bn' ? 'নিবন্ধিত ব্র্যান্ড' : 'brands registered'}
                </div>

                <button
                  onClick={() => handleExplore(mfr)}
                  className="rounded-xl bg-slate-50 hover:bg-brand-teal hover:text-white px-3 py-1.5 text-xs font-semibold text-brand-text transition-colors flex items-center space-x-1"
                >
                  <span>{t.directory.exploreBrands}</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
