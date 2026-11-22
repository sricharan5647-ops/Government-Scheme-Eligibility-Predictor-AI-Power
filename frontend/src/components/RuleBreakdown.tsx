import React from 'react';
import { CheckCircle2, XCircle, HelpCircle, FileCheck, ExternalLink, ShieldCheck } from 'lucide-react';
import { RuleEvaluationResult } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface RuleBreakdownProps {
  matchedRules: RuleEvaluationResult[];
  unmatchedRules: RuleEvaluationResult[];
  unknownRules: RuleEvaluationResult[];
  needsReviewRules: RuleEvaluationResult[];
}

export const RuleBreakdown: React.FC<RuleBreakdownProps> = ({
  matchedRules,
  unmatchedRules,
  unknownRules,
  needsReviewRules
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      {/* 1. Matched Rules */}
      {matchedRules.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Conditions Met ({matchedRules.length})</span>
          </div>
          <ul className="space-y-2 text-xs">
            {matchedRules.map((r, i) => (
              <li key={i} className="flex items-start justify-between gap-2 bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                <div className="space-y-0.5">
                  <span className="font-medium text-slate-800">{r.plain_language_text}</span>
                  <p className="text-[11px] text-emerald-700">{r.reason}</p>
                </div>
                {r.is_mandatory && (
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 flex-shrink-0">
                    Mandatory
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 2. Unknown Rules */}
      {unknownRules.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs sm:text-sm">
            <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Information Missing / Requires Input ({unknownRules.length})</span>
          </div>
          <p className="text-[11px] text-amber-800">
            You did not provide answers for these criteria. Provide this information to determine whether you meet the requirements:
          </p>
          <ul className="space-y-2 text-xs">
            {unknownRules.map((r, i) => (
              <li key={i} className="flex items-start justify-between gap-2 bg-white/90 p-2.5 rounded-lg border border-amber-200">
                <div className="space-y-0.5">
                  <span className="font-medium text-slate-800">{r.plain_language_text}</span>
                  <p className="text-[11px] text-amber-700">{r.reason}</p>
                </div>
                {r.is_mandatory && (
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 flex-shrink-0">
                    Mandatory
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 3. Needs Review Rules */}
      {needsReviewRules.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs sm:text-sm">
            <FileCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>Requires Official Department / Document Verification ({needsReviewRules.length})</span>
          </div>
          <ul className="space-y-2 text-xs">
            {needsReviewRules.map((r, i) => (
              <li key={i} className="flex items-start justify-between gap-2 bg-white/90 p-2.5 rounded-lg border border-blue-100">
                <div className="space-y-0.5">
                  <span className="font-medium text-slate-800">{r.plain_language_text}</span>
                  <p className="text-[11px] text-blue-700">{r.reason}</p>
                </div>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 flex-shrink-0">
                  Manual Review
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Unmatched Rules */}
      {unmatchedRules.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-rose-900 font-semibold text-xs sm:text-sm">
            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>Conditions Not Met ({unmatchedRules.length})</span>
          </div>
          <ul className="space-y-2 text-xs">
            {unmatchedRules.map((r, i) => (
              <li key={i} className="flex items-start justify-between gap-2 bg-white/90 p-2.5 rounded-lg border border-rose-100">
                <div className="space-y-0.5">
                  <span className="font-medium text-slate-800">{r.plain_language_text}</span>
                  <p className="text-[11px] text-rose-700">{r.reason}</p>
                </div>
                {r.is_mandatory && (
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 flex-shrink-0">
                    Mandatory
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
