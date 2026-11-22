import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Shield, AlertCircle, ArrowRight, Landmark } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);
    try {
      const data = await api.adminLogin({ email, password });
      login(data.access_token, data.role, data.email);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type: 'platform' | 'scheme') => {
    if (type === 'platform') {
      setEmail('admin@schemesathi.in');
      setPassword('Admin@SchemeSathi2025!');
    } else {
      setEmail('editor@schemesathi.in');
      setPassword('Editor@SchemeSathi2025!');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-navy-950 text-teal-400 flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-navy-950">Administrator Sign In</h1>
          <p className="text-xs text-slate-500">
            Authorized access for Scheme Data Administrators & Platform Auditors
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@schemesathi.in"
                  className="w-full text-sm rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-sm rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-navy-950 hover:bg-navy-900 disabled:opacity-50 text-white font-semibold text-sm shadow-xs transition-colors"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Quick-Fill Credentials */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Evaluation Demo Accounts:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleFillDemo('platform')}
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <div className="font-semibold text-navy-950">Platform Admin</div>
                <div className="text-[10px] text-slate-500 truncate">admin@schemesathi.in</div>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('scheme')}
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <div className="font-semibold text-navy-950">Scheme Admin</div>
                <div className="text-[10px] text-slate-500 truncate">editor@schemesathi.in</div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          <Link to="/" className="text-teal-700 hover:underline">
            &larr; Return to SchemeSathi Public Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};
