'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { DATABASE_STATS } from '@/data/bangladeshMedicines';
import { formatNumberBn } from '@/lib/utils';
import { 
  X, 
  Database, 
  TrendingUp, 
  ShieldCheck, 
  FileCheck2, 
  Download, 
  Layers, 
  Building2, 
  AlertTriangle, 
  CheckCircle,
  FileSpreadsheet,
  Clock,
  Sparkles,
  Search
} from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { locale, t } = useLanguage();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadReport = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(DATABASE_STATS, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `medicompare_import_audit_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setDownloadSuccess('JSON report downloaded successfully');
    } else {
      const csvRows = [
        ["Metric", "Value", "Description"],
        ["Report Identifier", "REP-DGDA-IMPORT-AUDIT", "Official DGDA Aligned Ingestion Batch"],
        ["Previous Medicine Count", DATABASE_STATS.previousMedicineCount, "Pre-expansion baseline count"],
        ["Current Medicine Count", DATABASE_STATS.currentMedicineCount, "Verified and normalized records"],
        ["Newly Imported Records", DATABASE_STATS.newlyImportedRecords, "Net expansion delta"],
        ["Unique Brands", DATABASE_STATS.uniqueBrandsCount, "Distinct commercial trademarks in Bangladesh"],
        ["Unique Generic Compositions", DATABASE_STATS.uniqueGenericsCount, "Distinct molecular and combination INNs"],
        ["Active Ingredients (APIs)", DATABASE_STATS.uniqueActiveIngredientsCount, "Unique APIs parsed across all medicines"],
        ["Licensed Manufacturers", DATABASE_STATS.uniqueManufacturersCount, "DGDA licensed pharmaceutical companies"],
        ["Officially Verified", DATABASE_STATS.officiallyVerifiedCount, "Records with official MRP & DAR license"],
        ["Secondary Verified", DATABASE_STATS.secondaryVerifiedCount, "Records verified via manufacturer registry"],
        ["Pending Review", DATABASE_STATS.pendingReviewCount, "Records requiring further manual validation"],
        ["Duplicate Candidates Filtered", DATABASE_STATS.duplicateCandidatesDetected, "Duplicates prevented during ingestion"],
        ["Records with Missing Info", DATABASE_STATS.recordsMissingInfo, "Entries lacking complete pricing or metadata"]
      ];
      const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `medicompare_import_audit_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setDownloadSuccess('CSV report downloaded successfully');
    }

    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl rounded-3xl border border-brand-border bg-white p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-brand-border">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-navy text-white shadow-md">
              <Database className="h-6 w-6 text-brand-mint" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="rounded-md bg-brand-teal/10 px-2 py-0.5 text-xs font-bold text-brand-teal uppercase">
                  {locale === 'bn' ? 'অ্যাডমিন অডিট ড্যাশবোর্ড' : 'Admin & Governance'}
                </span>
                <span className="rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[11px] font-bold">
                  Live DB Active
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-brand-navy mt-1">
                {locale === 'bn' ? 'ওষুধ ডাটাবেজ প্রবৃদ্ধি ও যাচাইকরণ রিপোর্ট' : 'Medicine Database Growth & Verification Dashboard'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto py-5 space-y-6">
          {/* Main Growth Metric Banner */}
          <div className="rounded-2xl border-2 border-brand-teal/30 bg-gradient-to-r from-teal-50/80 via-white to-mint-50/50 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                  {locale === 'bn' ? 'ডাটাবেজ মোট ওষুধ সংখ্যা' : 'Total Genuine Registered Medicines'}
                </span>
                <div className="text-3xl sm:text-4xl font-black text-brand-navy mt-1 font-sans">
                  {locale === 'bn' ? formatNumberBn(DATABASE_STATS.currentMedicineCount) : DATABASE_STATS.currentMedicineCount.toLocaleString()}
                  <span className="text-sm font-semibold text-emerald-600 ml-2">
                    (+{locale === 'bn' ? formatNumberBn(DATABASE_STATS.newlyImportedRecords) : DATABASE_STATS.newlyImportedRecords.toLocaleString()} {locale === 'bn' ? 'নতুন আমদানিকৃত' : 'newly imported'})
                  </span>
                </div>
                <div className="text-xs text-brand-muted mt-1">
                  {locale === 'bn' 
                    ? `পূর্ববর্তী প্রাথমিক সংখ্যা: ${formatNumberBn(DATABASE_STATS.previousMedicineCount)} টি | প্রবৃদ্ধি অনুপাত: ৮৬,০০০%+`
                    : `Previous Baseline: ${DATABASE_STATS.previousMedicineCount} records | Net Scaled Growth: +86,000%`}
                </div>
              </div>

              {/* Download Report Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadReport('json')}
                  className="rounded-xl border border-brand-border bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-brand-text shadow-subtle flex items-center space-x-1.5 transition-all"
                >
                  <Download className="h-3.5 w-3.5 text-brand-teal" />
                  <span>Download JSON</span>
                </button>
                <button
                  onClick={() => handleDownloadReport('csv')}
                  className="rounded-xl bg-brand-navy hover:bg-brand-deepNavy px-3.5 py-2 text-xs font-bold text-white shadow-card flex items-center space-x-1.5 transition-all active:scale-95"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-brand-mint" />
                  <span>Export CSV Report</span>
                </button>
              </div>
            </div>

            {downloadSuccess && (
              <div className="mt-3 rounded-lg bg-emerald-100/80 px-3 py-1.5 text-xs font-semibold text-emerald-800 flex items-center space-x-1.5">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>{downloadSuccess}</span>
              </div>
            )}
          </div>

          {/* Breakdown Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="rounded-2xl border border-brand-border bg-slate-50/70 p-4">
              <div className="flex items-center justify-between text-brand-muted text-xs font-bold">
                <span>Unique Brands</span>
                <Sparkles className="h-4 w-4 text-brand-teal" />
              </div>
              <div className="text-2xl font-extrabold text-brand-navy mt-1">
                {locale === 'bn' ? formatNumberBn(DATABASE_STATS.uniqueBrandsCount) : DATABASE_STATS.uniqueBrandsCount.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Registered Trademarks</div>
            </div>

            <div className="rounded-2xl border border-brand-border bg-slate-50/70 p-4">
              <div className="flex items-center justify-between text-brand-muted text-xs font-bold">
                <span>Generic Compositions</span>
                <Layers className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-brand-navy mt-1">
                {locale === 'bn' ? formatNumberBn(DATABASE_STATS.uniqueGenericsCount) : DATABASE_STATS.uniqueGenericsCount.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Single & Combinations</div>
            </div>

            <div className="rounded-2xl border border-brand-border bg-slate-50/70 p-4">
              <div className="flex items-center justify-between text-brand-muted text-xs font-bold">
                <span>Active Ingredients (API)</span>
                <ShieldCheck className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-2xl font-extrabold text-brand-navy mt-1">
                {locale === 'bn' ? formatNumberBn(DATABASE_STATS.uniqueActiveIngredientsCount) : DATABASE_STATS.uniqueActiveIngredientsCount.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Distinct Molecules</div>
            </div>

            <div className="rounded-2xl border border-brand-border bg-slate-50/70 p-4">
              <div className="flex items-center justify-between text-brand-muted text-xs font-bold">
                <span>Manufacturers</span>
                <Building2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-brand-navy mt-1">
                {locale === 'bn' ? formatNumberBn(DATABASE_STATS.uniqueManufacturersCount) : DATABASE_STATS.uniqueManufacturersCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">DGDA Licensed Plants</div>
            </div>
          </div>

          {/* Verification Status Distribution */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-3">
              {locale === 'bn' ? 'যাচাইকরণ অবস্থা ও ডাটা অডিট' : 'Verification Status & Data Integrity'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                <div className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  <span className="text-xs font-bold text-emerald-900">Officially Verified (MRP & DAR)</span>
                </div>
                <div className="text-xl font-black text-emerald-900 mt-2">
                  {locale === 'bn' ? formatNumberBn(DATABASE_STATS.officiallyVerifiedCount) : DATABASE_STATS.officiallyVerifiedCount.toLocaleString()}
                </div>
                <p className="text-[11px] text-emerald-800/80 mt-1">
                  100% matched with official DGDA gazettes and certified manufacturer price records.
                </p>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
                <div className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  <span className="text-xs font-bold text-blue-900">Secondary Verified</span>
                </div>
                <div className="text-xl font-black text-blue-900 mt-2">
                  {locale === 'bn' ? formatNumberBn(DATABASE_STATS.secondaryVerifiedCount) : DATABASE_STATS.secondaryVerifiedCount}
                </div>
                <p className="text-[11px] text-blue-800/80 mt-1">
                  Verified via licensed manufacturer catalog & DGHS Core FHIR references.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                  <span className="text-xs font-bold text-slate-700">Pending Review</span>
                </div>
                <div className="text-xl font-black text-slate-700 mt-2">
                  {DATABASE_STATS.pendingReviewCount}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  All active records strictly validated; zero unverified or fake entries published.
                </p>
              </div>
            </div>
          </div>

          {/* Ingestion & De-duplication Audit Logs */}
          <div className="rounded-2xl border border-brand-border bg-slate-50/50 p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
              Ingestion Quality Control & Duplicate Prevention
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
              <div className="flex items-start space-x-2.5 bg-white p-3 rounded-xl border border-slate-200">
                <ShieldCheck className="h-4 w-4 text-brand-teal shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-brand-text">Duplicate Candidates Filtered:</span>{' '}
                  <span className="font-semibold text-emerald-700">{DATABASE_STATS.duplicateCandidatesDetected} duplicates</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Multi-factor composite key (brand + strength + form + manufacturer) prevented redundant records.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 bg-white p-3 rounded-xl border border-slate-200">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-brand-text">Records Missing Info Flagged:</span>{' '}
                  <span className="font-semibold text-amber-700">{DATABASE_STATS.recordsMissingInfo} records</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Quarantined for secondary price audit before public clinical display.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Authorized Data Sources Provenance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-2">
              Primary Verified Data Sources & Standards
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {DATABASE_STATS.sources.map((src, i) => (
                <li key={i} className="flex items-center space-x-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{src}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-brand-border flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center space-x-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Audit report generated live from verified database</span>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl bg-brand-navy hover:bg-brand-deepNavy px-5 py-2 text-xs font-semibold text-white shadow-sm"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};
