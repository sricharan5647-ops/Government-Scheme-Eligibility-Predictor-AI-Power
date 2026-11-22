import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle, FileCheck, Clock, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface StatusBadgeProps {
  status: string; // POTENTIAL_MATCH, MORE_INFO_REQUIRED, NO_MATCH, NOT_ASSESSED, published, draft, expired, MATCH, etc.
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'sm' }) => {
  const { t } = useLanguage();
  const normalized = status.toUpperCase();

  const sizeClass = size === 'sm' ? 'text-xs px-2.5 py-1' : 'text-sm px-3 py-1.5';

  if (normalized === 'POTENTIAL_MATCH' || normalized === 'MATCH') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 ${sizeClass}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        {label || t('potentialMatch')}
      </span>
    );
  }

  if (normalized === 'MORE_INFO_REQUIRED' || normalized === 'UNKNOWN') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClass}`}>
        <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
        {label || t('moreInfoRequired')}
      </span>
    );
  }

  if (normalized === 'NEEDS_REVIEW') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-50 text-blue-800 border border-blue-200 ${sizeClass}`}>
        <FileCheck className="w-3.5 h-3.5 text-blue-600" />
        {label || t('needsReview')}
      </span>
    );
  }

  if (normalized === 'NO_MATCH') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-800 border border-rose-200 ${sizeClass}`}>
        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
        {label || t('noMatch')}
      </span>
    );
  }

  if (normalized === 'PUBLISHED') {
    return (
      <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-teal-50 text-teal-800 border border-teal-200 ${sizeClass}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
        {label || t('published')}
      </span>
    );
  }

  if (normalized === 'EXPIRED') {
    return (
      <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClass}`}>
        <Clock className="w-3.5 h-3.5 text-slate-500" />
        {label || t('expired')}
      </span>
    );
  }

  if (normalized === 'DRAFT' || normalized === 'UNDER_REVIEW') {
    return (
      <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-800 border border-slate-300 ${sizeClass}`}>
        <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
        {label || (normalized === 'DRAFT' ? t('draft') : t('underReview'))}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClass}`}>
      {label || status}
    </span>
  );
};
