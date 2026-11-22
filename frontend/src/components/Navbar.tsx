import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Landmark, Compass, CheckCircle2, MessageSquareText, Shield, Globe, Menu, X, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Language } from '../i18n/translations';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, logout, email } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: t('home'), icon: Landmark },
    { to: '/schemes', label: t('exploreSchemes'), icon: Compass },
    { to: '/eligibility', label: t('checkEligibility'), icon: CheckCircle2 },
    { to: '/assistant', label: t('assistant'), icon: MessageSquareText },
    { to: '/about', label: t('about'), icon: Shield },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center text-white shadow-xs group-hover:bg-navy-800 transition-colors">
              <Landmark className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-navy-950 tracking-tight">SchemeSathi</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-teal-100 text-teal-800">
                  Pilot
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Civic Pulse &bull; Telangana & Central</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-navy-50 text-navy-900 font-semibold'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Language Selector, Admin & CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs font-medium">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded transition-colors ${language === 'en' ? 'bg-white shadow-xs font-semibold text-navy-900' : 'text-slate-600 hover:text-slate-900'}`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('te')}
                className={`px-2 py-1 rounded transition-colors ${language === 'te' ? 'bg-white shadow-xs font-semibold text-navy-900' : 'text-slate-600 hover:text-slate-900'}`}
                title="Telugu"
              >
                తెలుగు
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 rounded transition-colors ${language === 'hi' ? 'bg-white shadow-xs font-semibold text-navy-900' : 'text-slate-600 hover:text-slate-900'}`}
                title="Hindi"
              >
                हिन्दी
              </button>
            </div>

            {/* Admin link or status */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin"
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-navy-100 text-navy-900 hover:bg-navy-200 transition-colors"
                >
                  Admin Panel
                </Link>
                <button
                  onClick={logout}
                  className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="text-xs font-medium text-slate-500 hover:text-navy-900 px-2 py-1"
              >
                {t('admin')}
              </Link>
            )}

            {/* Primary Action Button */}
            <Link
              to="/eligibility"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm shadow-xs transition-colors"
            >
              <span>{t('findSchemesBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'te' : language === 'te' ? 'hi' : 'en')}
              className="px-2 py-1 rounded border border-slate-200 text-xs font-semibold bg-slate-100 text-navy-900"
            >
              {language === 'en' ? 'తెలుగు' : language === 'te' ? 'हिन्दी' : 'EN'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-navy-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-navy-900"
                >
                  <Icon className="w-5 h-5 text-teal-600" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-slate-100 space-y-3">
            <Link
              to="/eligibility"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 text-white font-semibold text-sm shadow-xs"
            >
              <span>{t('findSchemesBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About SchemeSathi</Link>
              <Link to="/privacy" onClick={() => setMobileMenuOpen(false)}>Privacy Notice</Link>
              <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)}>{t('admin')}</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
