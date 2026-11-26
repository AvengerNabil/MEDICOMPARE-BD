'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const { locale, t } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      qEn: 'Are generic medicines in Bangladesh equivalent in clinical efficacy to branded innovator drugs?',
      qBn: 'বাংলাদেশে কি জেনেরিক ওষুধ ব্র্যান্ডেড বা উদ্ভাবিত ওষুধের সমমানের কার্যকর?',
      aEn: 'Yes. All pharmaceutical formulations registered under the Directorate General of Drug Administration (DGDA) must adhere to rigorous pharmacopeia standards (BP/USP) and WHO-GMP manufacturing compliance. When two brands share identical active pharmaceutical ingredients (API), exact strength, and compatible delivery mechanisms, their therapeutic response is expected to be bioequivalent. However, consultation with a physician is always mandatory before changing any prescription.',
      aBn: 'হ্যাঁ। বাংলাদেশ ঔষধ প্রশাসন অধিদপ্তর (DGDA)-এর নিবন্ধিত প্রতিটি ওষুধই ব্রিটিশ ফার্মাকোপিয়া (BP) অথবা ইউএস ফার্মাকোপিয়া (USP) এবং বিশ্ব স্বাস্থ্য সংস্থার জিএমপি মানদণ্ড মেনে প্রস্তুত করা হয়। সমমানের সক্রিয় উপাদান ও শক্তি সম্পন্ন ওষুধ সমান কার্যকারিতা নিশ্চিত করে। তবে চিকিৎসকের পরামর্শ ব্যতিরেকে ব্যবস্থাপত্রের ওষুধ পরিবর্তন করা অনুচিত।',
    },
    {
      qEn: 'Why do prices differ between different pharmaceutical brands for the exact same medicine?',
      qBn: 'একই উপাদান হওয়া সত্ত্বেও বিভিন্ন কোম্পানির ওষুধের দামের মধ্যে পার্থক্য কেন হয়?',
      aEn: 'Price variance in Bangladesh arises from manufacturer marketing investments, imported active ingredient sourcing, packaging aesthetics, raw material grade, and distribution economies of scale. Essential life-saving molecules are subject to official DGDA Maximum Retail Price (MRP) ceilings, while other formulations operate within manufacturer-submitted indicative price brackets.',
      aBn: 'কাঁচামাল আমদানির উৎস, উন্নত প্যাকেজিং, বিপণন ব্যয় এবং কারখানা পরিচালনার প্রযুক্তিগত খরচের পার্থক্যের কারণে দামের ভিন্নতা দেখা যায়। তবে অত্যাবশ্যকীয় কিছু ওষুধের সর্বোচ্চ খুচরা মূল্য (MRP) সরকার কর্তৃক নির্ধারিত থাকে।',
    },
    {
      qEn: 'How does MediCompare verify the accuracy of prices and medicine registrations?',
      qBn: 'মেডিকম্পেয়ার কীভাবে ওষুধের নিবন্ধন ও মূল্যের নির্ভুলতা নিশ্চিত করে?',
      aEn: 'MediCompare BD cross-references national Directorate General of Drug Administration (DGDA) gazettes, DGHS FHIR registered drug terminologies, and official price publications directly audited from certified pharmaceutical manufacturers. No unverified or crowd-sourced pricing is published without administrative validation.',
      aBn: 'মেডিকম্পেয়ার বিডি সরাসরি ঔষধ প্রশাসন অধিদপ্তর (DGDA)-এর গেজেট, স্বাস্থ্য অধিদপ্তরের ডিজিএইচএস কোর এফএইচআইআর ডাটাবেজ এবং অনুমোদিত ওষুধ প্রস্তুতকারক প্রতিষ্ঠানের অফিশিয়াল মূল্যতালিকা সমন্বয় করে তথ্য প্রকাশ করে। কোনো অসত্য বা অপ্রমাণিত তথ্য এখানে প্রদর্শিত হয় না।',
    },
    {
      qEn: 'Can I substitute my prescription directly based on information from MediCompare?',
      qBn: 'মেডিকম্পেয়ারের তথ্যের ওপর ভিত্তি করে আমি কি সরাসরি প্রেসক্রিপশনের ওষুধ পরিবর্তন করতে পারি?',
      aEn: 'No. MediCompare BD is strictly an informational and price transparency intelligence platform. While we provide precise chemical composition and pricing comparisons, certain patients have specific tolerances, excipient allergies, or clinical conditions that require their attending physician’s explicit written approval before any brand substitution.',
      aBn: 'না। মেডিকম্পেয়ার বিডি কেবলমাত্র তথ্য ও মূল্যের স্বচ্ছতা বিষয়ক একটি প্ল্যাটফর্ম। ওষুধের উপাদান বা ব্র্যান্ড পরিবর্তনের ক্ষেত্রে রোগীর শারীরিক অবস্থা ও বিশেষ সংবেদনশীলতা বিবেচনায় চিকিৎসকের প্রত্যক্ষ অনুমোদন গ্রহণ করা অপরিহার্য।',
    },
  ];

  return (
    <section id="faq" className="py-12 sm:py-16 bg-slate-50/70 border-t border-brand-border">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-1.5 rounded-md bg-teal-100 px-2.5 py-1 text-xs font-bold text-brand-teal uppercase tracking-wider mb-2">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>{t.faq.title}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
            {t.faq.subtitle}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-brand-border bg-white overflow-hidden transition-all shadow-subtle"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm sm:text-base font-bold text-brand-text hover:text-brand-teal transition-colors"
                >
                  <span>{locale === 'bn' ? faq.qBn : faq.qEn}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-brand-teal' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-fadeIn">
                    {locale === 'bn' ? faq.aBn : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
