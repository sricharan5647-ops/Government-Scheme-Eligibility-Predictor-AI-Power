import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Link2,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { Scheme, EligibilityRule, RequiredDocument, SchemeSource } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const AdminSchemeEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    slug: '',
    official_name: '',
    short_description: '',
    plain_language_description: '',
    department: '',
    government_level: 'state',
    state_code: 'TG',
    category: 'Agriculture & Allied',
    beneficiary_groups: ['Farmers'],
    benefit_summary: '',
    application_steps: [''],
    official_application_url: '',
    status: 'draft',
    is_demo: false
  });

  const [rules, setRules] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    if (!isNew && id) {
      async function loadScheme() {
        try {
          const s = await api.getAdminScheme(parseInt(id!));
          setFormData({
            slug: s.slug,
            official_name: s.official_name,
            short_description: s.short_description,
            plain_language_description: s.plain_language_description || '',
            department: s.department,
            government_level: s.government_level,
            state_code: s.state_code || '',
            category: s.category,
            beneficiary_groups: Array.isArray(s.beneficiary_groups) ? s.beneficiary_groups : [s.beneficiary_groups],
            benefit_summary: s.benefit_summary,
            application_steps: s.application_steps && s.application_steps.length > 0 ? s.application_steps : [''],
            official_application_url: s.official_application_url,
            status: s.status,
            is_demo: s.is_demo
          });
          setRules(s.rules || []);
          setDocuments(s.documents || []);
          setSources(s.sources || []);
        } catch (err: any) {
          setError(err.message || 'Failed to load scheme');
        } finally {
          setLoading(false);
        }
      }
      loadScheme();
    }
  }, [id, isNew, isAuthenticated, navigate]);

  const handleTextChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  // Rule operations
  const addRule = () => {
    setRules((prev) => [
      ...prev,
      {
        field_key: 'age',
        operator: 'greater_than_or_equal',
        expected_value: '18',
        is_mandatory: true,
        plain_language_text: 'Must be at least 18 years of age.'
      }
    ]);
  };

  const removeRule = (index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, field: string, val: any) => {
    setRules((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  // Document operations
  const addDoc = () => {
    setDocuments((prev) => [
      ...prev,
      {
        document_name: '',
        description: '',
        is_mandatory: true
      }
    ]);
  };

  const removeDoc = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const updateDoc = (index: number, field: string, val: any) => {
    setDocuments((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  // Source operations
  const addSource = () => {
    setSources((prev) => [
      ...prev,
      {
        source_title: '',
        official_url: '',
        source_type: 'portal_page',
        source_excerpt: '',
        is_official: true
      }
    ]);
  };

  const removeSource = (index: number) => {
    setSources((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSource = (index: number, field: string, val: any) => {
    setSources((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  // Steps operations
  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      application_steps: [...prev.application_steps, '']
    }));
  };

  const updateStep = (index: number, val: string) => {
    setFormData((prev) => {
      const copy = [...prev.application_steps];
      copy[index] = val;
      return { ...prev, application_steps: copy };
    });
  };

  const removeStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      application_steps: prev.application_steps.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    const payload = {
      ...formData,
      rules,
      documents,
      sources
    };

    try {
      if (isNew) {
        const created = await api.createScheme(payload);
        setSuccessMsg(`Scheme '${created.official_name}' created successfully!`);
        setTimeout(() => navigate('/admin/schemes'), 1200);
      } else {
        await api.updateScheme(parseInt(id!), payload);
        setSuccessMsg('Scheme guidelines and rule set updated successfully.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save scheme');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-teal-600 border-t-transparent animate-spin mx-auto"></div>
        <p className="text-sm text-slate-600">Loading scheme editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <Link to="/admin/schemes" className="inline-flex items-center gap-1 text-xs text-teal-700 hover:underline mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Schemes List</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            {isNew ? 'Create New Scheme' : `Edit: ${formData.official_name}`}
          </h1>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Scheme & Rules'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: Scheme Core Metadata */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h2 className="font-bold text-base text-navy-950 pb-2 border-b border-slate-100">
            1. Core Scheme Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Scheme Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.official_name}
                onChange={(e) => handleTextChange('official_name', e.target.value)}
                placeholder="e.g. Rythu Bandhu Agriculture Investment Support"
                className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Slug <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => handleTextChange('slug', e.target.value)}
                placeholder="e.g. telangana-rythu-bandhu"
                className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-teal-500 bg-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleTextChange('category', e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="Agriculture & Allied">Agriculture & Allied</option>
                <option value="Education & Learning">Education & Learning</option>
                <option value="Healthcare & Wellness">Healthcare & Wellness</option>
                <option value="Housing & Shelter">Housing & Shelter</option>
                <option value="Employment & Skills">Employment & Skills</option>
                <option value="Women & Child Welfare">Women & Child Welfare</option>
                <option value="Social Security & Welfare">Social Security & Welfare</option>
                <option value="Entrepreneurship & Business">Entrepreneurship & Business</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Issuing Department <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => handleTextChange('department', e.target.value)}
                placeholder="e.g. Department of Agriculture, Government of Telangana"
                className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Government Level & State
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={formData.government_level}
                  onChange={(e) => handleTextChange('government_level', e.target.value)}
                  className="text-sm rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="state">State</option>
                  <option value="central">Central</option>
                </select>
                <input
                  type="text"
                  value={formData.state_code}
                  onChange={(e) => handleTextChange('state_code', e.target.value)}
                  placeholder="TG"
                  className="text-sm rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scheme Publication Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleTextChange('status', e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-teal-500 bg-white font-semibold"
              >
                <option value="draft">Draft (Private)</option>
                <option value="under_review">Under Review</option>
                <option value="published">Published (Public Catalogue)</option>
                <option value="expired">Expired / Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Application Portal URL
              </label>
              <input
                type="url"
                required
                value={formData.official_application_url}
                onChange={(e) => handleTextChange('official_application_url', e.target.value)}
                placeholder="https://..."
                className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  checked={formData.is_demo}
                  onChange={(e) => handleTextChange('is_demo', e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <span className="text-xs font-medium text-slate-800">
                  Mark as Demo Data (&quot;Demo data - not an official government scheme&quot;)
                </span>
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Short Description (1-2 sentences)
              </label>
              <textarea
                rows={2}
                value={formData.short_description}
                onChange={(e) => handleTextChange('short_description', e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Plain-Language Overview
              </label>
              <textarea
                rows={3}
                value={formData.plain_language_description}
                onChange={(e) => handleTextChange('plain_language_description', e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Benefit Summary
              </label>
              <textarea
                rows={2}
                value={formData.benefit_summary}
                onChange={(e) => handleTextChange('benefit_summary', e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Deterministic Rule Builder */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-base text-navy-950">2. Deterministic Eligibility Rules</h2>
              <p className="text-xs text-slate-500">
                Rules are evaluated by the machine engine against citizen questionnaire responses.
              </p>
            </div>
            <button
              type="button"
              onClick={addRule}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Condition</span>
            </button>
          </div>

          {rules.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No rules defined. Add a condition above.</p>
          ) : (
            <div className="space-y-3">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-900">Rule #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeRule(idx)}
                      className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Field Key
                      </label>
                      <select
                        value={rule.field_key}
                        onChange={(e) => updateRule(idx, 'field_key', e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                      >
                        <option value="state_code">state_code</option>
                        <option value="age">age</option>
                        <option value="annual_household_income">annual_household_income</option>
                        <option value="farmer_status">farmer_status</option>
                        <option value="landholding_acres">landholding_acres</option>
                        <option value="education_level">education_level</option>
                        <option value="occupation">occupation</option>
                        <option value="social_category">social_category</option>
                        <option value="has_bpl_ration_card">has_bpl_ration_card</option>
                        <option value="gender">gender</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Operator
                      </label>
                      <select
                        value={rule.operator}
                        onChange={(e) => updateRule(idx, 'operator', e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                      >
                        <option value="equals">equals (==)</option>
                        <option value="not_equals">not_equals (!=)</option>
                        <option value="greater_than">greater_than (&gt;)</option>
                        <option value="greater_than_or_equal">greater_than_or_equal (&gt;=)</option>
                        <option value="less_than">less_than (&lt;)</option>
                        <option value="less_than_or_equal">less_than_or_equal (&lt;=)</option>
                        <option value="between">between (min,max)</option>
                        <option value="in_list">in_list (comma separated)</option>
                        <option value="contains">contains</option>
                        <option value="required_exists">required_exists</option>
                        <option value="needs_review">needs_review (manual)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Expected Value
                      </label>
                      <input
                        type="text"
                        value={rule.expected_value}
                        onChange={(e) => updateRule(idx, 'expected_value', e.target.value)}
                        placeholder="e.g. TG or 18,35 or true"
                        className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-5">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.is_mandatory}
                          onChange={(e) => updateRule(idx, 'is_mandatory', e.target.checked)}
                          className="w-3.5 h-3.5 text-teal-600 rounded"
                        />
                        <span className="font-semibold text-slate-700">Mandatory?</span>
                      </label>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Plain Language Condition Text (Shown to Citizen)
                      </label>
                      <input
                        type="text"
                        value={rule.plain_language_text}
                        onChange={(e) => updateRule(idx, 'plain_language_text', e.target.value)}
                        placeholder="e.g. Must be a native resident of Telangana."
                        className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 3: Required Documents */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-base text-navy-950">3. Required Documents</h2>
              <p className="text-xs text-slate-500">
                Shown to citizen in the interactive document checklist.
              </p>
            </div>
            <button
              type="button"
              onClick={addDoc}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Document</span>
            </button>
          </div>

          {documents.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No documents added yet.</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-900">Document #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeDoc(idx)}
                      className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Document Name (e.g. Ration Card)"
                        value={doc.document_name}
                        onChange={(e) => updateDoc(idx, 'document_name', e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Description / Requirements"
                        value={doc.description || ''}
                        onChange={(e) => updateDoc(idx, 'description', e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={doc.is_mandatory}
                          onChange={(e) => updateDoc(idx, 'is_mandatory', e.target.checked)}
                          className="w-3.5 h-3.5 text-teal-600 rounded"
                        />
                        <span className="font-semibold text-slate-700">Mandatory</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 4: Official Source Citations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-base text-navy-950">4. Official Sources & Gazette Verification</h2>
              <p className="text-xs text-slate-500">
                Ensures product principle 7 (source transparency) is satisfied.
              </p>
            </div>
            <button
              type="button"
              onClick={addSource}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Source</span>
            </button>
          </div>

          {sources.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No sources added yet. Provide at least one official portal or gazette.</p>
          ) : (
            <div className="space-y-3">
              {sources.map((src, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-900">Official Source #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeSource(idx)}
                      className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Source Title (e.g. Telangana ePASS Gazette)"
                      value={src.source_title}
                      onChange={(e) => updateSource(idx, 'source_title', e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                    />
                    <input
                      type="url"
                      placeholder="Official URL (https://...)"
                      value={src.official_url}
                      onChange={(e) => updateSource(idx, 'official_url', e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                    />
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Source Excerpt / Relevant Quotation"
                        value={src.source_excerpt || ''}
                        onChange={(e) => updateSource(idx, 'source_excerpt', e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 5: Application Steps */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-base text-navy-950">5. Step-By-Step Application Process</h2>
              <p className="text-xs text-slate-500">
                Actionable sequential instructions displayed on the scheme detail page.
              </p>
            </div>
            <button
              type="button"
              onClick={addStep}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Step</span>
            </button>
          </div>

          <div className="space-y-2">
            {formData.application_steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={step}
                  onChange={(e) => updateStep(idx, e.target.value)}
                  placeholder="e.g. Visit MeeSeva centre with required documents..."
                  className="flex-1 text-xs sm:text-sm rounded-lg border border-slate-300 p-2 bg-white"
                />
                <button
                  type="button"
                  onClick={() => removeStep(idx)}
                  className="p-2 text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <Link
            to="/admin/schemes"
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-sm shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Scheme & Rules'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
