import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const DisclaimerBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="bg-amber-50 border-y border-amber-200 text-amber-900 px-4 py-2 text-xs flex items-center justify-center gap-2 text-center">
        <Info className="w-4 h-4 text-amber-700 flex-shrink-0" />
        <span>
          <strong>{t('disclaimerTitle')}:</strong> {t('disclaimerNotice')}
        </span>
      </div>
    );
  }

  return (
    <aside aria-label="Official Disclaimer" className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 text-amber-950 flex items-start gap-3 shadow-xs">
      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm space-y-1">
        <h4 className="font-semibold text-amber-900 tracking-tight">{t('disclaimerTitle')}</h4>
        <p className="text-amber-800 leading-relaxed text-xs sm:text-sm">
          {t('disclaimerNotice')}
        </p>
      </div>
    </aside>
  );
};
