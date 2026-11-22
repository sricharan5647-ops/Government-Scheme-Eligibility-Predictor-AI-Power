import React, { useState, useEffect } from 'react';
import { FileText, Check, AlertCircle, Info } from 'lucide-react';
import { RequiredDocument } from '../types';
import { useLanguage } from '../context/LanguageContext';

export const DocumentChecklist: React.FC<{
  documents: RequiredDocument[];
  schemeSlug: string;
}> = ({ documents, schemeSlug }) => {
  const { t } = useLanguage();
  const storageKey = `schemesathi_docs_${schemeSlug}`;

  const [checkedState, setCheckedState] = useState<Record<string, boolean>>(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleDoc = (name: string) => {
    setCheckedState((prev) => {
      const next = { ...prev, [name]: !prev[name] };
      sessionStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  const total = documents.length;
  const readyCount = documents.filter((d) => checkedState[d.document_name]).length;

  if (total === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
        No specific documents catalogued yet for this scheme. Please consult the official portal.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress pill */}
      <div className="flex items-center justify-between text-xs bg-slate-100 p-2.5 rounded-lg border border-slate-200">
        <span className="font-semibold text-slate-700">Checklist Readiness</span>
        <span className="font-bold text-teal-700">
          {readyCount} of {total} documents ready
        </span>
      </div>

      <ul className="space-y-2">
        {documents.map((doc, i) => {
          const isChecked = !!checkedState[doc.document_name];
          return (
            <li
              key={i}
              onClick={() => toggleDoc(doc.document_name)}
              className={`cursor-pointer select-none p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                isChecked
                  ? 'bg-teal-50/60 border-teal-300 text-teal-950'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border mt-0.5 transition-colors flex-shrink-0 ${
                  isChecked
                    ? 'bg-teal-600 border-teal-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {isChecked && <Check className="w-3.5 h-3.5" />}
              </div>

              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-semibold ${isChecked ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                    {doc.document_name}
                  </span>
                  {doc.is_mandatory && (
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Required
                    </span>
                  )}
                </div>
                {doc.description && (
                  <p className="text-xs text-slate-500">{doc.description}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Note on upload privacy and official portal verification */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Privacy note:</strong> SchemeSathi does not request or store any document uploads. Ticking items here saves to your current session only. Please verify exact acceptable formats (original, photocopy, or gazetted attestation) on the official department portal before applying.
        </p>
      </div>
    </div>
  );
};
