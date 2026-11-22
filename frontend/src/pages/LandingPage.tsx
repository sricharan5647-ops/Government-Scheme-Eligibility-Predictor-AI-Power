import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Search,
  CheckCircle2,
  FileText,
  Building2,
  Lock,
  ChevronDown,
  Sparkles,
  HelpCircle,
  Wheat,
  GraduationCap,
  HeartPulse,
  Home,
  Briefcase,
  Users,
  Shield,
  Lightbulb
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { SchemeCard } from '../components/SchemeCard';
import { api } from '../services/api';
import { Scheme } from '../types';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<{ id: string; name: string; count: number }[]>([]);
  const [featuredSchemes, setFeaturedSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [cats, schemes] = await Promise.all([
          api.getCategories(),
          api.getSchemes({ limit: 4 } as any)
        ]);
        setCategories(cats);
        setFeaturedSchemes(schemes.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('agri')) return Wheat;
    if (lower.includes('edu')) return GraduationCap;
    if (lower.includes('health')) return HeartPulse;
    if (lower.includes('hous')) return Home;
    if (lower.includes('employ') || lower.includes('skill')) return Briefcase;
    if (lower.includes('women') || lower.includes('child')) return Users;
    if (lower.includes('social') || lower.includes('secur')) return Shield;
    if (lower.includes('entre') || lower.includes('busi')) return Lightbulb;
    return Building2;
  };

  const faqs = [
    {
      q: "Does SchemeSathi guarantee that I will get the scheme benefit or money?",
      a: "No. SchemeSathi is strictly an informational and preliminary screening assistant. We evaluate your submitted information against publicly available government rules to find potential matches. The official decision, document verification, and final sanction is conducted solely by the respective government department."
    },
    {
      q: "Do I need to submit my Aadhaar number or bank details here?",
      a: "Never. By design, SchemeSathi does not request, collect, or store your Aadhaar number, bank account details, PAN, passwords, or OTPs. You only provide general screening attributes (such as age, state, or occupation) to evaluate applicable criteria."
    },
    {
      q: "Are the scheme rules up-to-date and verified?",
      a: "Yes. Every published scheme on SchemeSathi is linked to an official government gazette, portal, or department notification with a visible 'Last Verified' date and direct link to the primary government portal."
    },
    {
      q: "Which states are covered right now?",
      a: "Our initial pilot scope covers schemes from the Government of Telangana along with key Central Government of India schemes. We are expanding to additional states in future releases."
    }
  ];

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white pt-16 pb-20 lg:pt-24 lg:pb-32">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs sm:text-sm font-medium backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Telangana & Central Government Welfare Pilot</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {t('heroTitle')}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
              {t('heroSubtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to="/eligibility"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-base shadow-lg shadow-teal-900/30 transition-all hover:scale-[1.02]"
              >
                <span>{t('checkEligibility')}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/schemes"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-navy-800/80 hover:bg-navy-700/80 border border-slate-700 text-slate-200 font-semibold text-base transition-colors"
              >
                <Compass className="w-5 h-5 text-teal-400" />
                <span>{t('exploreSchemes')}</span>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-navy-800/80 text-xs text-slate-400">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>Deterministic Rules</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>Zero Aadhaar Required</span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2">
                <Building2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>Verified Source Links</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Mandatory Disclaimer Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-20">
        <DisclaimerBanner />
      </div>

      {/* 2. How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-950 tracking-tight">
            {t('howItWorksTitle')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            A 3-step transparent screening process designed to save you hours of administrative searching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:border-teal-500/50 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-lg border border-teal-200">
                1
              </div>
              <h3 className="font-bold text-lg text-navy-950">{t('step1Title')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t('step1Desc')}</p>
            </div>
            <div className="pt-2 text-xs font-semibold text-teal-700">Quick 5-step questionnaire</div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:border-teal-500/50 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-navy-50 text-navy-900 font-bold flex items-center justify-center text-lg border border-navy-200">
                2
              </div>
              <h3 className="font-bold text-lg text-navy-950">{t('step2Title')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t('step2Desc')}</p>
            </div>
            <div className="pt-2 text-xs font-semibold text-navy-800">No opaque percentages or AI guesswork</div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:border-teal-500/50 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-900 font-bold flex items-center justify-center text-lg border border-amber-200">
                3
              </div>
              <h3 className="font-bold text-lg text-navy-950">{t('step3Title')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t('step3Desc')}</p>
            </div>
            <div className="pt-2 text-xs font-semibold text-amber-800">Checklist & official department links</div>
          </div>
        </div>
      </section>

      {/* 3. Browse By Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-950 tracking-tight">
              {t('categoriesTitle')}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Explore welfare initiatives across diverse livelihood and community sectors.
            </p>
          </div>
          <Link
            to="/schemes"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            <span>View All Schemes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.name);
            return (
              <button
                key={cat.id}
                onClick={() => navigate(`/schemes?category=${encodeURIComponent(cat.id)}`)}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all text-left group flex flex-col justify-between space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-teal-50 text-slate-700 group-hover:text-teal-700 flex items-center justify-center transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-navy-950 group-hover:text-teal-700 transition-colors">
                    {cat.name}
                  </h4>
                  <span className="text-xs text-slate-500 font-medium">
                    {cat.count} {cat.count === 1 ? 'Scheme' : 'Schemes'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Featured Schemes */}
      {featuredSchemes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-950 tracking-tight">
                Verified Schemes Catalogue
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Featured government initiatives with published rule specifications.
              </p>
            </div>
            <Link
              to="/schemes"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              <span>Explore all catalogued schemes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {featuredSchemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Trust & Transparency Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="max-w-3xl space-y-6 relative z-10">
            <span className="text-teal-400 font-semibold text-xs uppercase tracking-wider">
              Governance & Civic Principles
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Honest Public Technology: No False Certainty, No Hallucinated Eligibility
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Many citizens are misled by unofficial portals promising instant approvals or requesting sensitive identity papers. SchemeSathi adheres to strict civic principles:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-200 pt-2">
              <div className="p-4 rounded-xl bg-navy-800/70 border border-navy-700 space-y-1">
                <span className="font-bold text-teal-300">Deterministic Rule Matching</span>
                <p className="text-slate-400">Rules are coded directly from government notifications. We do not use speculative AI models to decide eligibility.</p>
              </div>
              <div className="p-4 rounded-xl bg-navy-800/70 border border-navy-700 space-y-1">
                <span className="font-bold text-teal-300">Privacy by Design</span>
                <p className="text-slate-400">No passwords, OTPs, Aadhaar numbers, or document uploads. Screening is session-based and never monetized.</p>
              </div>
              <div className="p-4 rounded-xl bg-navy-800/70 border border-navy-700 space-y-1">
                <span className="font-bold text-teal-300">Complete Source Transparency</span>
                <p className="text-slate-400">Every single scheme card shows official government URLs and the date details were last verified by a human administrator.</p>
              </div>
              <div className="p-4 rounded-xl bg-navy-800/70 border border-navy-700 space-y-1">
                <span className="font-bold text-teal-300">Grounded Language Assistant</span>
                <p className="text-slate-400">Our Q&A assistant answers only what is written in verified guidelines. If an answer is unverified, it explicitly admits it.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-950 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600">
            Clear answers about our purpose, privacy, and how preliminary matching works.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all"
            >
              <button
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-navy-950 hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${faqOpen === i ? 'rotate-180 text-teal-600' : ''}`} />
              </button>
              {faqOpen === i && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. Bottom Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-3xl p-8 sm:p-12 text-center text-white space-y-4 shadow-xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to find welfare schemes for your household?
          </h2>
          <p className="text-sm sm:text-base text-teal-100 max-w-xl mx-auto">
            Take 2 minutes to complete our guided questionnaire and see transparent, rule-matched opportunities.
          </p>
          <div className="pt-2">
            <Link
              to="/eligibility"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-teal-900 hover:bg-teal-50 font-bold text-base shadow-md transition-all hover:scale-[1.02]"
            >
              <span>{t('checkEligibility')}</span>
              <ArrowRight className="w-5 h-5 text-teal-700" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
