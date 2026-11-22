import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Landmark,
  Building2,
  Calendar,
  ExternalLink,
  CheckCircle2,
  FileText,
  ListOrdered,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  MessageSquare,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { Scheme } from '../types';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { DocumentChecklist } from '../components/DocumentChecklist';
import { FeedbackModal } from '../components/FeedbackModal';
import { useLanguage } from '../context/LanguageContext';

export const SchemeDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    async function loadScheme() {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await api.getScheme(slug);
        setScheme(data);
      } catch (err: any) {
        setError(err.message || 'Scheme not found');
      } finally {
        setLoading(false);
      }
    }
    loadScheme();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-teal-600 border-t-transparent animate-spin mx-auto"></div>
        <p className="text-sm text-slate-600">Loading scheme details...</p>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto" />
        <h2 className="text-xl font-bold text-navy-950">Scheme Not Found</h2>
        <p className="text-sm text-slate-600">The requested scheme record could not be located in our catalogue.</p>
        <Link
          to="/schemes"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white font-medium text-xs hover:bg-teal-700"
        >
          <span>Return to Scheme Catalogue</span>
        </Link>
      </div>
    );
  }

  const formattedDate = scheme.last_verified_at
    ? new Date(scheme.last_verified_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <Link to="/schemes" className="hover:text-teal-700">Explore Schemes</Link>
          <span>/</span>
          <span className="text-navy-900 font-medium truncate max-w-xs">{scheme.official_name}</span>
        </div>

        <button
          onClick={() => setFeedbackOpen(true)}
          className="inline-flex items-center gap-1 text-slate-500 hover:text-navy-900 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
          <span>Report issue / feedback</span>
        </button>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-navy-100 text-navy-900">
            {scheme.category}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
            scheme.government_level === 'central'
              ? 'bg-purple-100 text-purple-900'
              : 'bg-emerald-100 text-emerald-900'
          }`}>
            {scheme.government_level === 'central' ? 'Central Government' : `State Government (${scheme.state_code || 'Telangana'})`}
          </span>
          {scheme.is_demo && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              <span>{t('demoBadgeText')}</span>
            </span>
          )}
          <StatusBadge status={scheme.status} />
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-navy-950 tracking-tight leading-tight">
          {scheme.official_name}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>{scheme.department}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>Last verified with official sources: <strong>{formattedDate}</strong></span>
          </div>
        </div>

        {/* CTAs */}
        <div className="pt-4 flex flex-wrap items-center gap-3">
          <Link
            to="/eligibility"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-xs transition-colors"
          >
            <span>{t('checkMyEligibility')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href={scheme.official_application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-sm shadow-xs transition-colors"
          >
            <span>{t('applyOnOfficialPortal')}</span>
            <ExternalLink className="w-4 h-4 text-teal-400" />
          </a>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Descriptions, Rules, Steps */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Plain-Language Summary */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-navy-950">About This Scheme</h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              {scheme.plain_language_description || scheme.short_description}
            </p>

            {/* Key Benefits */}
            <div className="p-4 rounded-xl bg-teal-50/80 border border-teal-100 text-teal-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-teal-900 text-sm">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Benefit Summary</span>
              </div>
              <p className="text-xs sm:text-sm text-teal-800 leading-relaxed">
                {scheme.benefit_summary}
              </p>
            </div>
          </section>

          {/* 2. Eligibility Criteria */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-navy-950">
              Eligibility Conditions
            </h2>
            <p className="text-xs text-slate-600">
              These conditions are codified directly from official scheme guidelines:
            </p>

            {scheme.rules && scheme.rules.length > 0 ? (
              <ul className="space-y-2.5">
                {scheme.rules.map((rule, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs sm:text-sm"
                  >
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-800">{rule.plain_language_text}</span>
                    </div>
                    {rule.is_mandatory && (
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-navy-100 text-navy-800 flex-shrink-0">
                        Mandatory
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">No structured rule items defined yet.</p>
            )}
          </section>

          {/* 3. Application Process */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-teal-600" />
              <h2 className="text-base sm:text-lg font-bold text-navy-950">
                Application Instructions
              </h2>
            </div>

            {scheme.application_steps && scheme.application_steps.length > 0 ? (
              <ol className="space-y-3">
                {scheme.application_steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                    <span className="w-6 h-6 rounded-full bg-navy-100 text-navy-900 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-700 leading-relaxed pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-slate-500 italic">Application instructions will be updated from official guidelines.</p>
            )}
          </section>
        </div>

        {/* Right Column: Required Documents & Official Sources */}
        <div className="space-y-8">
          {/* Interactive Document Checklist */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <h2 className="text-base font-bold text-navy-950">Required Documents Checklist</h2>
            </div>
            <p className="text-xs text-slate-500">
              Tick documents you already hold to prepare for your application:
            </p>

            <DocumentChecklist
              documents={scheme.documents || []}
              schemeSlug={scheme.slug}
            />
          </section>

          {/* Official Verification & Sources */}
          <section className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-navy-950">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Official Department Sources</span>
            </div>

            {scheme.sources && scheme.sources.length > 0 ? (
              <ul className="space-y-2 pt-1">
                {scheme.sources.map((src, i) => (
                  <li key={i} className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                    <a
                      href={src.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-teal-700 hover:underline flex items-center gap-1"
                    >
                      <span className="truncate">{src.source_title}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                    {src.source_excerpt && (
                      <p className="text-slate-500 italic text-[11px] line-clamp-2">
                        &quot;{src.source_excerpt}&quot;
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">Official notification source details available on portal.</p>
            )}

            <div className="pt-2 border-t border-slate-200 text-slate-500 text-[11px] leading-relaxed">
              <strong>Official Disclaimer:</strong> Final approval and sanction of benefits is made solely by the competent authority in the respective department.
            </div>
          </section>
        </div>
      </div>

      {feedbackOpen && (
        <FeedbackModal
          schemeId={scheme.id}
          schemeName={scheme.official_name}
          onClose={() => setFeedbackOpen(false)}
        />
      )}
    </div>
  );
};
