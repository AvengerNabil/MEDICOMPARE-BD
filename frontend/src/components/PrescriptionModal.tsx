'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Medicine } from '@/types/medicine';
import { MEDICINES } from '@/data/bangladeshMedicines';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  ScanLine, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDetectedMedicine: (medicine: Medicine) => void;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  onSelectDetectedMedicine,
}) => {
  const { locale, t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedCandidates, setDetectedCandidates] = useState<Array<{ name: string; confidence: number; medicine: Medicine }>>([]);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    setIsProcessing(true);
    setDetectedCandidates([]);

    setTimeout(() => {
      setIsProcessing(false);
      // Realistic OCR extracted candidate matches from simulated prescription
      setDetectedCandidates([
        { name: 'Nexum 20mg Tab (Esomeprazole)', confidence: 96, medicine: MEDICINES.find(m => m.id === 'med-nexum-20') || MEDICINES[0] },
        { name: 'Napa 500mg Tab (Paracetamol)', confidence: 92, medicine: MEDICINES.find(m => m.id === 'med-napa-500') || MEDICINES[0] },
        { name: 'Monas 10mg Tab (Montelukast)', confidence: 88, medicine: MEDICINES.find(m => m.id === 'med-monas-10') || MEDICINES[0] },
      ]);
    }, 1400);
  };

  const handleConfirmCandidate = (candidate: { medicine: Medicine }) => {
    onSelectDetectedMedicine(candidate.medicine);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl border border-brand-border bg-white p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-brand-border">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-brand-teal">
              <ScanLine className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-brand-navy">
                {t.ocr.title}
              </h3>
              <span className="text-xs text-brand-muted">{t.ocr.badge}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="overflow-y-auto py-5 space-y-5">
          <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
            {t.ocr.description}
          </p>

          {/* Upload Dropzone */}
          <div 
            onClick={handleSimulateScan}
            className="border-2 border-dashed border-brand-teal/40 rounded-2xl bg-teal-50/20 p-8 text-center cursor-pointer hover:border-brand-teal hover:bg-teal-50/40 transition-all group"
          >
            <Upload className="h-10 w-10 text-brand-teal mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-brand-navy">
              {t.ocr.uploadArea}
            </div>
            <div className="text-xs text-brand-muted mt-1">
              {t.ocr.uploadHint}
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSimulateScan();
                }}
                className="inline-flex items-center space-x-1.5 rounded-xl bg-brand-navy px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-deepNavy"
              >
                <Sparkles className="h-3.5 w-3.5 text-brand-mint" />
                <span>{t.ocr.simulateDemo}</span>
              </button>
            </div>
          </div>

          {/* Processing state */}
          {isProcessing && (
            <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-5 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-teal border-r-transparent align-[-0.125em]" />
              <p className="mt-3 text-xs font-semibold text-brand-teal">
                {t.ocr.extracting}
              </p>
            </div>
          )}

          {/* Detected Candidate Medicines */}
          {detectedCandidates.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                  {t.ocr.detectedTitle} ({detectedCandidates.length})
                </span>
                <span className="text-[11px] text-amber-600 font-semibold">
                  *Please verify before searching
                </span>
              </div>

              <div className="space-y-2">
                {detectedCandidates.map((cand, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-2xl border border-brand-border bg-slate-50/70 p-3.5 hover:bg-white hover:border-brand-teal/40 transition-all"
                  >
                    <div>
                      <div className="text-sm font-bold text-brand-text">
                        {cand.name}
                      </div>
                      <div className="text-xs text-brand-muted flex items-center space-x-2 mt-0.5">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                        <span>OCR Confidence: {cand.confidence}%</span>
                        <span>•</span>
                        <span>{cand.medicine.manufacturer}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleConfirmCandidate(cand)}
                      className="rounded-xl bg-brand-teal px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-tealHover flex items-center space-x-1"
                    >
                      <span>{t.ocr.actionConfirm}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy & Safety Warning */}
          <div className="rounded-2xl bg-amber-50/80 p-3.5 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2.5">
            <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <span>{t.ocr.privacyNote}</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-brand-border flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-brand-border px-4 py-2 text-xs font-semibold text-brand-text hover:bg-slate-50"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};
