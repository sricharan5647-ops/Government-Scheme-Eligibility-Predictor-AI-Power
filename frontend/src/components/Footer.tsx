import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Shield, ExternalLink, MessageSquare, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { FeedbackModal } from './FeedbackModal';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <>
      <footer className="bg-navy-950 text-slate-300 border-t border-navy-900 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            {/* Col 1: About */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white">
                  <Landmark className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white tracking-tight">SchemeSathi</span>
              </div>
              <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                An open civic-tech platform empowering citizens of Telangana and India to discover government welfare opportunities transparently, without artificial barriers or speculative claims.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-900/80 border border-navy-800 text-xs text-slate-300">
                <Shield className="w-4 h-4 text-teal-400" />
                <span>Zero data retention by default &bull; No Aadhaar/bank data collected</span>
              </div>
            </div>

            {/* Col 2: Fast Links */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/schemes" className="hover:text-teal-400 transition-colors">
                    {t('exploreSchemes')}
                  </Link>
                </li>
                <li>
                  <Link to="/eligibility" className="hover:text-teal-400 transition-colors">
                    {t('checkEligibility')}
                  </Link>
                </li>
                <li>
                  <Link to="/assistant" className="hover:text-teal-400 transition-colors">
                    {t('assistant')}
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-teal-400 transition-colors">
                    {t('about')}
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-teal-400 transition-colors">
                    {t('privacy')}
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="hover:text-teal-400 transition-colors">
                    {t('admin')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Official Portals & Feedback */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Official Sources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a
                    href="https://www.myscheme.gov.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-teal-400 transition-colors"
                  >
                    <span>myScheme National Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://telangana.gov.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-teal-400 transition-colors"
                  >
                    <span>Telangana State Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.india.gov.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-teal-400 transition-colors"
                  >
                    <span>National Portal of India</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </li>
              </ul>

              <div className="pt-2">
                <button
                  onClick={() => setFeedbackOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900 border border-slate-700 hover:border-teal-500 text-xs text-white transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                  <span>{t('reportIssue')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Legal / Civic Disclaimer Note */}
          <div className="mt-10 pt-6 border-t border-navy-900 text-xs text-slate-400 space-y-3">
            <p className="leading-relaxed">
              <strong>Official Disclaimer:</strong> SchemeSathi is an independent civic information platform and is not an official government portal. It does not submit applications, collect identity documents, or guarantee benefit eligibility. All preliminary recommendations are evaluated strictly against verified guidelines from official government gazettes and notifications. Final decisions rest solely with the respective government departments.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400">
              <p>&copy; {new Date().getFullYear()} SchemeSathi &bull; Civic Pulse &bull; Open Governance Initiative</p>
              <p className="flex items-center gap-1">
                <span>Built with integrity for Indian citizens</span>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
    </>
  );
};
