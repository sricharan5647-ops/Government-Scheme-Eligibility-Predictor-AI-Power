import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Calendar, ExternalLink, ArrowRight, ShieldAlert, Sparkles, Building2 } from 'lucide-react';
import { Scheme } from '../types';
import { StatusBadge } from './StatusBadge';
import { useLanguage } from '../context/LanguageContext';

export const SchemeCard: React.FC<{ scheme: Scheme }> = ({ scheme }) => {
  const { t } = useLanguage();

  const formattedDate = scheme.last_verified_at
    ? new Date(scheme.last_verified_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-teal-500/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Top Badges */}
        <div className="p-5 pb-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-navy-100 text-navy-900">
              {scheme.category}
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
              scheme.government_level === 'central'
                ? 'bg-purple-100 text-purple-900'
                : 'bg-emerald-100 text-emerald-900'
            }`}>
              {scheme.government_level === 'central' ? 'Central (All India)' : `State (${scheme.state_code || 'Telangana'})`}
            </span>
            {scheme.is_demo && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-amber-700" />
                <span>{t('demoBadgeText')}</span>
              </span>
            )}
          </div>
          <StatusBadge status={scheme.status} />
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <h3 className="font-bold text-base text-navy-950 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug">
            <Link to={`/schemes/${scheme.slug}`}>{scheme.official_name}</Link>
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            <span className="truncate">{scheme.department}</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
            {scheme.short_description}
          </p>

          {/* Key Benefit Highlight */}
          <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-100 text-teal-950 text-xs">
            <div className="font-semibold text-teal-900 flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Key Benefit:</span>
            </div>
            <p className="line-clamp-2 text-teal-800">{scheme.benefit_summary}</p>
          </div>
        </div>
      </div>

      {/* Footer Meta & Actions */}
      <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>{t('verifiedOn')}: {formattedDate || 'Recently'}</span>
        </div>

        <Link
          to={`/schemes/${scheme.slug}`}
          className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-800 hover:underline"
        >
          <span>{t('viewDetails')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
