import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit3,
  CheckCircle,
  Archive,
  Trash2,
  ExternalLink,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { api } from '../../services/api';
import { Scheme } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const AdminSchemesPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminSchemes({
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        q: searchQuery || undefined
      });
      setSchemes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    fetchSchemes();
  }, [isAuthenticated, selectedStatus]);

  const handlePublish = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to PUBLISH '${name}' to the live citizen catalogue?`)) return;
    try {
      await api.publishScheme(id);
      setActionMessage(`Published '${name}' successfully.`);
      fetchSchemes();
    } catch (err: any) {
      alert(err.message || 'Failed to publish scheme');
    }
  };

  const handleArchive = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to ARCHIVE / EXPIRE '${name}'? It will no longer match active queries.`)) return;
    try {
      await api.archiveScheme(id);
      setActionMessage(`Archived '${name}'.`);
      fetchSchemes();
    } catch (err: any) {
      alert(err.message || 'Failed to archive scheme');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`CRITICAL: Are you sure you want to permanently DELETE '${name}'? This cannot be undone.`)) return;
    try {
      await api.deleteScheme(id);
      setActionMessage(`Deleted '${name}'.`);
      fetchSchemes();
    } catch (err: any) {
      alert(err.message || 'Failed to delete scheme');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-teal-700 hover:underline mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Scheme Catalogue Management
          </h1>
          <p className="text-xs text-slate-500">
            Create, review, publish, and maintain government scheme rules and verification records.
          </p>
        </div>

        <Link
          to="/admin/schemes/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Scheme</span>
        </Link>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-emerald-700 font-bold ml-2">&times;</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchSchemes()}
            placeholder="Search schemes by title, department, slug..."
            className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 pl-9 pr-4 py-2 focus:ring-2 focus:ring-teal-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-700 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Live</option>
            <option value="draft">Draft</option>
            <option value="under_review">Under Review</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Schemes Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading schemes catalogue...</div>
        ) : schemes.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No schemes found for selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Scheme Name & Department</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Level</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Last Verified</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schemes.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-navy-950 flex items-center gap-1.5">
                        <Link to={`/admin/schemes/${s.id}`} className="hover:text-teal-700">
                          {s.official_name}
                        </Link>
                        {s.is_demo && (
                          <span className="text-[10px] font-semibold px-1 py-0.5 rounded bg-amber-100 text-amber-800">
                            Demo
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{s.department}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      {s.category}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        s.government_level === 'central'
                          ? 'bg-purple-100 text-purple-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {s.government_level === 'central' ? 'Central' : `State (${s.state_code || 'TG'})`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(s.last_verified_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/schemes/${s.id}`}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                          title="Edit Scheme and Rules"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>

                        {s.status !== 'published' && (
                          <button
                            onClick={() => handlePublish(s.id, s.official_name)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Publish to Live Catalogue"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {s.status === 'published' && (
                          <button
                            onClick={() => handleArchive(s.id, s.official_name)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="Archive Scheme"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}

                        {role === 'platform_admin' && (
                          <button
                            onClick={() => handleDelete(s.id, s.official_name)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Delete Scheme Permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
