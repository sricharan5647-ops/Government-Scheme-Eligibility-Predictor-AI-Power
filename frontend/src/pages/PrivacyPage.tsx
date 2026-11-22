import React from 'react';
import { ShieldCheck, Lock, EyeOff, Trash2, CheckCircle2 } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const handleClearSession = () => {
    sessionStorage.clear();
    alert('All questionnaire answers and document checklist selections have been erased from this browser.');
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Privacy by Design</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-navy-950 tracking-tight">
          Privacy Notice & Data Commitments
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          How SchemeSathi protects citizen privacy through minimal data collection and zero identity tracking.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs text-xs sm:text-sm text-slate-700 leading-relaxed">
        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-navy-950 flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-600" />
            <span>1. What We Never Collect</span>
          </h2>
          <p>SchemeSathi operates on a strict zero-PII (Personally Identifiable Information) collection principle:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
            <li><strong>No Aadhaar Numbers:</strong> We will never ask for your 12-digit Aadhaar or Virtual ID.</li>
            <li><strong>No Bank Details:</strong> No account numbers, IFSC codes, UPI IDs, or credit information.</li>
            <li><strong>No Document Uploads:</strong> We never request you to upload digital copies of certificates or identity proofs.</li>
            <li><strong>No Passwords or OTPs:</strong> The citizen discovery flow requires no account creation or login.</li>
          </ul>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-navy-950 flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-teal-600" />
            <span>2. How Screening Answers Are Handled</span>
          </h2>
          <p>
            When you complete the eligibility questionnaire (providing non-identifying attributes like age, state, education, and occupation), the information is processed ephemerally in memory by our rule evaluation engine to produce your recommendation breakdown.
          </p>
          <p>
            Your questionnaire answers are saved exclusively in your local browser&apos;s <code>sessionStorage</code> so you can review and edit them. They are automatically cleared when you close your browser tab.
          </p>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-navy-950">
            3. Clear Your Session Data Right Now
          </h2>
          <p className="text-slate-600">
            You can immediately clear any questionnaire responses or checklist ticks stored in this browser session by clicking below:
          </p>
          <button
            onClick={handleClearSession}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 font-semibold text-xs transition-colors"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Clear Local Session Storage</span>
          </button>
        </div>
      </div>
    </div>
  );
};
