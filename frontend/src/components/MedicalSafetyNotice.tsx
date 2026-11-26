'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { AlertCircle, ShieldAlert, HeartHandshake } from 'lucide-react';

export const MedicalSafetyNotice: React.FC = () => {
  const { t, locale } = useLanguage();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/90 p-4 sm:p-5 shadow-sm">
        <div className="flex items-start space-x-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <ShieldAlert className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-amber-200/60 px-2 py-0.5 text-[11px] font-bold text-amber-900 uppercase tracking-wide">
                {t.safetyBanner.badge}
              </span>
              <h3 className="text-sm font-bold text-amber-950">
                {t.safetyBanner.title}
              </h3>
            </div>

            <p className="mt-1 text-xs sm:text-sm text-amber-900/90 leading-relaxed">
              {t.safetyBanner.text}
            </p>

            <div className="mt-2.5 flex items-center space-x-2 text-xs font-semibold text-amber-900">
              <HeartHandshake className="h-4 w-4 text-amber-700" />
              <span>
                {locale === 'bn'
                  ? 'রোগীর নিরাপত্তা সর্বাগ্রে: শুধুমাত্র লাইসেন্সধারী ডাক্তারের লিখিত পরামর্শ ছাড়া প্রেসক্রিপশনের ওষুধ পরিবর্তন করবেন না।'
                  : 'Patient Safety First: Strictly consult a licensed doctor before substituting any prescription regimen.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
