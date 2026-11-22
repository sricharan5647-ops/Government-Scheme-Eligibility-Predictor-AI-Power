import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { ExploreSchemesPage } from './pages/ExploreSchemesPage';
import { QuestionnairePage } from './pages/QuestionnairePage';
import { ResultsPage } from './pages/ResultsPage';
import { SchemeDetailPage } from './pages/SchemeDetailPage';
import { AssistantPage } from './pages/AssistantPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminSchemesPage } from './pages/admin/AdminSchemesPage';
import { AdminSchemeEditPage } from './pages/admin/AdminSchemeEditPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-teal-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Citizen Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/schemes" element={<ExploreSchemesPage />} />
                <Route path="/eligibility" element={<QuestionnairePage />} />
                <Route path="/results" element={<ResultsPage />} />
                <Route path="/schemes/:slug" element={<SchemeDetailPage />} />
                <Route path="/assistant" element={<AssistantPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />

                {/* Administration Routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/schemes" element={<AdminSchemesPage />} />
                <Route path="/admin/schemes/new" element={<AdminSchemeEditPage />} />
                <Route path="/admin/schemes/:id" element={<AdminSchemeEditPage />} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
