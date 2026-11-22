import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Building2,
  Calendar,
  Sparkles,
  FileText,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { EvaluationResponse, SchemeMatchResult } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { RuleBreakdown } from '../components/RuleBreakdown';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { useLanguage } from '../context/LanguageContext';

export const ResultsPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [results, setResults] = useState<EvaluationResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'potential' | 'more_info' | 'no_match'>('all');
  const [expandedSchemeId, setExpandedSchemeId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('schemesathi_evaluation_results');
      if (saved) {
        setResults(JSON.parse(saved));
      } else {
        // If no results in session, navigate back to questionnaire
        navigate('/eligibility');
      }
    } catch {
      navigate('/eligibility');
    }
  }, [navigate]);

  if (!results) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-teal-600 border-t-transparent animate-spin mx-auto"></div>
        <p className="text-sm text-slate-600">Loading screening results...</p>
      </div>
    );
  }

  const { potential_matches, more_info_required, no_matches } = results;
  const totalEvaluated = results.total_schemes_evaluated;

  const toggleExpand = (id: number) => {
    setExpandedSchemeId(expandedSchemeId === id ? null : id);
  };

  const renderSchemeCard = (item: SchemeMatchResult) => {
    const isExpanded = expandedSchemeId === item.scheme_id;

    return (
      <div
        key={item.scheme_id}
        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all space-y-4"
      >
        {/* Top Header */}
        <div className="p-5 pb-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-navy-100 text-navy-900">
              {item.category}
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
              item.government_level === 'central'
                ? 'bg-purple-100 text-purple-900'
                : 'bg-emerald-100 text-emerald-900'
            }`}>
              {item.government_level === 'central' ? 'Central Scheme' : `State (${item.state_code || 'Telangana'})`}
            </span>
            {item.is_demo && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-amber-700" />
                <span>{t('demoBadgeText')}</span>
              </span>
            )}
          </div>
          <StatusBadge status={item.match_status} label={item.status_label} />
        </div>

        {/* Content */}
        <div className="px-5 space-y-3">
          <h3 className="font-bold text-base sm:text-lg text-navy-950">
            <Link to={`/schemes/${item.slug}`} className="hover:text-teal-700 transition-colors">
              {item.official_name}
            </Link>
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{item.department}</span>
          </div>

          {/* Transparent Match Reason Callout */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900">Assessment summary: </span>
              <span>{item.recommendation_reason}</span>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {item.matched_rules.length > 0 && (
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium border border-emerald-100">
                <CheckCircle2 className="w-3 h-3" />
                {item.matched_rules.length} Met
              </span>
            )}
            {item.unknown_rules.length > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium border border-amber-100">
                <HelpCircle className="w-3 h-3" />
                {item.unknown_rules.length} Missing Info
              </span>
            )}
            {item.unmatched_rules.length > 0 && (
              <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-medium border border-rose-100">
                <AlertCircle className="w-3 h-3" />
                {item.unmatched_rules.length} Not Met
              </span>
            )}
          </div>
        </div>

        {/* Detailed Expandable Rule Breakdown */}
        {isExpanded && (
          <div className="px-5 pt-3 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Rule-By-Rule Breakdown:
            </h4>
            <RuleBreakdown
              matchedRules={item.matched_rules}
              unmatchedRules={item.unmatched_rules}
              unknownRules={item.unknown_rules}
              needsReviewRules={item.needs_review_rules}
            />

            {item.required_documents.length > 0 && (
              <div className="pt-2 text-xs text-slate-600 space-y-1">
                <span className="font-semibold text-slate-800">Required Documents: </span>
                <span>{item.required_documents.map(d => d.document_name).join(', ')}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            onClick={() => toggleExpand(item.scheme_id)}
            className="inline-flex items-center gap-1 text-slate-600 hover:text-navy-900 font-semibold"
          >
            <span>{isExpanded ? 'Hide rule details' : 'Show detailed rule breakdown'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center gap-2">
            <Link
              to={`/schemes/${item.slug}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors shadow-xs"
            >
              <span>{t('viewDetails')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header & Re-evaluate */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
            Evaluation Outcome
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Your Scheme Eligibility Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Evaluated against <span className="font-bold text-navy-950">{totalEvaluated}</span> published schemes in the catalogue.
          </p>
        </div>

        <button
          onClick={() => navigate('/eligibility')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold self-start sm:self-auto transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Edit Profile Answers</span>
        </button>
      </div>

      <DisclaimerBanner />

      {/* Tabs / Filter by Group */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'all'
              ? 'bg-navy-900 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All Assessed ({potential_matches.length + more_info_required.length + no_matches.length})
        </button>

        <button
          onClick={() => setActiveTab('potential')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'potential'
              ? 'bg-emerald-700 text-white'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Potential Matches ({potential_matches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('more_info')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'more_info'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>More Information Required ({more_info_required.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('no_match')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'no_match'
              ? 'bg-rose-700 text-white'
              : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Unmatched Criteria ({no_matches.length})</span>
        </button>
      </div>

      {/* Group 1: Potential Matches */}
      {(activeTab === 'all' || activeTab === 'potential') && potential_matches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <h2 className="text-lg font-bold text-navy-950">
              Potential Matches ({potential_matches.length})
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            Based on your answers, you satisfy all mandatory criteria catalogued in official scheme guidelines.
          </p>
          <div className="grid grid-cols-1 gap-4">
            {potential_matches.map(renderSchemeCard)}
          </div>
        </section>
      )}

      {/* Group 2: More Information Required */}
      {(activeTab === 'all' || activeTab === 'more_info') && more_info_required.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <h2 className="text-lg font-bold text-navy-950">
              More Information Required ({more_info_required.length})
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            These schemes may be relevant to you, but certain mandatory criteria were left unanswered or require manual department verification.
          </p>
          <div className="grid grid-cols-1 gap-4">
            {more_info_required.map(renderSchemeCard)}
          </div>
        </section>
      )}

      {/* Group 3: Does Not Appear to Match */}
      {(activeTab === 'all' || activeTab === 'no_match') && no_matches.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <h2 className="text-lg font-bold text-navy-950">
              Does Not Appear to Match ({no_matches.length})
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            At least one mandatory condition (such as state domicile, age boundary, or occupation) was not satisfied by your submitted profile.
          </p>
          <div className="grid grid-cols-1 gap-4">
            {no_matches.map(renderSchemeCard)}
          </div>
        </section>
      )}

      {/* Empty State when no schemes match current tab */}
      {((activeTab === 'potential' && potential_matches.length === 0) ||
        (activeTab === 'more_info' && more_info_required.length === 0) ||
        (activeTab === 'no_match' && no_matches.length === 0)) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
          No schemes under this status category for your submitted answers.
        </div>
      )}
    </div>
  );
};
