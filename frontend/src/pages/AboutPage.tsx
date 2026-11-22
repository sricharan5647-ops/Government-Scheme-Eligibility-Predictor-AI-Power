import React from 'react';
import { Landmark, Shield, CheckCircle2, Lock, FileText, Building2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-100 text-navy-900 text-xs font-semibold">
          <Landmark className="w-3.5 h-3.5 text-teal-600" />
          <span>Civic Pulse &bull; Digital Governance Track</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-navy-950 tracking-tight">
          About SchemeSathi
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
          An open, transparent government scheme discovery and preliminary eligibility screening tool for Indian citizens.
        </p>
      </div>

      {/* Mission Section */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="text-xl font-bold text-navy-950">Our Mission</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          Governments launch dozens of transformative welfare initiatives in education, agriculture, healthcare, housing, and social security. However, citizens often struggle with fragmented departmental websites, dense legalistic language, and confusing eligibility criteria.
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">
          <strong>SchemeSathi</strong> was built to solve this challenge. It translates complex eligibility rules into plain language, evaluates citizen profiles through an open, deterministic rule engine, and provides transparent explanations and official source links without false certainty.
        </p>
      </section>

      {/* Core Product Principles */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-navy-950">Guiding Civic Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-navy-950 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>1. Accuracy Before Fluency</span>
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Eligibility evaluation is strictly deterministic and based on versioned rules sourced from official government gazettes. We never let an LLM guess or decide whether a citizen qualifies.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-navy-950 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>2. Explainability First</span>
            </h3>
            <p className="text-slate-600 leading-relaxed">
              We never return an opaque score. Every assessment clearly displays which conditions matched, which are missing, and which require document verification.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-navy-950 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>3. No False Certainty</span>
            </h3>
            <p className="text-slate-600 leading-relaxed">
              We use honest labels such as &quot;Potential match&quot; and &quot;More information required&quot;. We never display &quot;Approved&quot; or &quot;Guaranteed eligible&quot;.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-navy-950 flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-600" />
              <span>4. Privacy by Design</span>
            </h3>
            <p className="text-slate-600 leading-relaxed">
              No Aadhaar numbers, bank account numbers, passwords, OTPs, or document uploads are collected in our screening flow.
            </p>
          </div>
        </div>
      </section>

      {/* Limitations Box */}
      <section className="bg-amber-50/80 border border-amber-200 rounded-3xl p-6 sm:p-8 text-amber-950 space-y-3">
        <h3 className="font-bold text-base text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span>Important Project Limitations & Scope</span>
        </h3>
        <ul className="space-y-2 text-xs sm:text-sm text-amber-900 leading-relaxed list-disc list-inside">
          <li>SchemeSathi is not an official government portal and does not submit applications on your behalf.</li>
          <li>Final eligibility, identity authentication, and monetary sanctions are governed exclusively by the issuing government department.</li>
          <li>Our current pilot scope focuses on Telangana State Government programs and select Central Government of India initiatives.</li>
        </ul>
      </section>
    </div>
  );
};
