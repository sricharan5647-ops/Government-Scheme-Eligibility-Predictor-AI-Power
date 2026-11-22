import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Shield,
  Activity,
  History,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminStats, AuditLog } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { isAuthenticated, role, email, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    async function loadData() {
      try {
        const [statsData, logsData] = await Promise.all([
          api.getAdminStats(),
          api.getAuditLogs(10)
        ]);
        setStats(statsData);
        setAuditLogs(logsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-teal-600 border-t-transparent animate-spin mx-auto"></div>
        <p className="text-sm text-slate-600">Loading admin dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-navy-100 text-navy-900">
              {role === 'platform_admin' ? 'Platform Administrator' : 'Scheme Data Administrator'}
            </span>
            <span className="text-xs text-slate-500 truncate">{email}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight mt-1">
            Scheme Data Management Console
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/schemes/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Scheme</span>
          </Link>
          <Link
            to="/admin/schemes"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm transition-colors"
          >
            <span>Manage All Schemes</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-medium text-slate-500">Total Schemes</span>
            <div className="text-2xl font-extrabold text-navy-950">{stats.total_schemes}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs space-y-1">
            <span className="text-xs font-medium text-emerald-800">Published Live</span>
            <div className="text-2xl font-extrabold text-emerald-700">{stats.published_schemes}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-medium text-slate-500">Drafts</span>
            <div className="text-2xl font-extrabold text-slate-700">{stats.draft_schemes}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-xs space-y-1">
            <span className="text-xs font-medium text-blue-800">Under Review</span>
            <div className="text-2xl font-extrabold text-blue-700">{stats.under_review_schemes}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-medium text-slate-500">Expired</span>
            <div className="text-2xl font-extrabold text-slate-600">{stats.expired_schemes}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs space-y-1">
            <span className="text-xs font-medium text-amber-800">Demo Records</span>
            <div className="text-2xl font-extrabold text-amber-700">{stats.demo_schemes}</div>
          </div>
        </div>
      )}

      {/* Main Grid: Quick Nav and Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Operations */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-base text-navy-950">Administrative Workflows</h3>
            <div className="space-y-2 text-xs">
              <Link
                to="/admin/schemes"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-900">Scheme Catalogue Manager</div>
                  <div className="text-slate-500">Publish, archive, edit rules & documents</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/admin/schemes/new"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-900">Add New Scheme Guideline</div>
                  <div className="text-slate-500">Build deterministic rules & sources</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Verification Protocol Box */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-3 text-xs">
            <h4 className="font-bold text-navy-950 flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-600" />
              <span>Verification Protocol</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Before marking any scheme as <strong>Published</strong>, verify that:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>Official Gazette or Department URL is accessible.</li>
              <li>Eligibility rule thresholds match the primary gazette text.</li>
              <li>Verification date is updated to current date.</li>
              <li>Non-official or fictional records are explicitly marked as <code>Demo Data</code>.</li>
            </ul>
          </div>
        </div>

        {/* Audit Log Trail */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-navy-950">
              <History className="w-5 h-5 text-teal-600" />
              <span>Recent System Audit Trail</span>
            </div>
            <span className="text-xs text-slate-400">Latest 10 activities</span>
          </div>

          {auditLogs.length > 0 ? (
            <div className="space-y-3 text-xs">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-mono font-semibold text-navy-900 uppercase">
                      {log.action.replace('_', ' ')}
                    </span>
                    <span>
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium">{log.change_summary}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No audit records logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
