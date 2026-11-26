'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Activity, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { locale, t } = useLanguage();

  return (
    <footer className="border-t border-brand-border bg-brand-deepNavy text-slate-300 pt-14 pb-10 text-xs sm:text-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-700/80">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal text-white shadow-md">
                <Activity className="h-5 w-5" />
              </div>
              <div className="text-xl font-extrabold text-white tracking-tight">
                MediCompare <span className="text-brand-mint">BD</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              {locale === 'bn'
                ? 'মেডিকম্পেয়ার বিডি বাংলাদেশের ওষুধ ও স্বাস্থ্য অর্থনীতিতে স্বচ্ছতা আনয়নের লক্ষ্যে নির্মিত একটি নির্ভরযোগ্য প্ল্যাটফর্ম। সকল তথ্য ঔষধ প্রশাসন অধিদপ্তর (DGDA) ও স্বাস্থ্য অধিদপ্তর (DGHS)-এর অনুমোদিত নির্দেশিকা ভিত্তিক।'
                : 'MediCompare BD is Bangladesh’s premium pharmaceutical intelligence platform dedicated to cost transparency, verified generic matching, and citizen health literacy.'}
            </p>

            <div className="flex items-center space-x-2 text-xs text-brand-mint">
              <ShieldCheck className="h-4 w-4" />
              <span>{locale === 'bn' ? 'শতভাগ সরকারি লাইসেন্সকৃত তথ্যের নিশ্চয়তা' : '100% DGDA Aligned Data Protocol'}</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#hero" className="hover:text-brand-mint transition-colors">{t.nav.home}</a></li>
              <li><a href="#categories" className="hover:text-brand-mint transition-colors">{t.nav.generics}</a></li>
              <li><a href="#comparison" className="hover:text-brand-mint transition-colors">{t.nav.compare}</a></li>
              <li><a href="#calculator" className="hover:text-brand-mint transition-colors">{t.nav.calculator}</a></li>
              <li><a href="#manufacturers" className="hover:text-brand-mint transition-colors">{t.nav.manufacturers}</a></li>
              <li><a href="#faq" className="hover:text-brand-mint transition-colors">{t.nav.about}</a></li>
            </ul>
          </div>

          {/* Regulatory References */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              {t.footer.resources}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="https://dgda.gov.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-mint transition-colors flex items-center space-x-1"
                >
                  <span>{t.footer.dgdaRef}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://fhir.dghs.gov.bd/core/ValueSet-dgda-registered-drugs.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-mint transition-colors flex items-center space-x-1"
                >
                  <span>{t.footer.dghsRef}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li><span className="text-slate-500">WHO Essential Medicines (EDL Bangladesh)</span></li>
              <li><span className="text-slate-500">National Drug Policy 2016</span></li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Safety Disclaimer */}
        <div className="py-6 border-b border-slate-700/80 text-xs text-slate-400 leading-relaxed">
          <p className="font-semibold text-slate-300 mb-1">{t.footer.disclaimerTitle}:</p>
          <p>{t.footer.disclaimerText}</p>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            © {new Date().getFullYear()} {t.footer.copyright}
          </div>
          <div className="flex items-center space-x-1 text-slate-400">
            <span>Built with precision for Bangladesh healthcare</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 inline fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
