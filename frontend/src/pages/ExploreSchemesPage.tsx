import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RefreshCw, Compass, AlertCircle, Building2 } from 'lucide-react';
import { SchemeCard } from '../components/SchemeCard';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { api } from '../services/api';
import { Scheme } from '../types';
import { useLanguage } from '../context/LanguageContext';

export const ExploreSchemesPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedGovLevel, setSelectedGovLevel] = useState(searchParams.get('gov') || 'all');
  const [sortBy, setSortBy] = useState('name_asc');

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await api.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error(err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function fetchSchemes() {
      setLoading(true);
      try {
        const data = await api.getSchemes({
          q: searchQuery || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          government_level: selectedGovLevel !== 'all' ? selectedGovLevel : undefined
        });
        setSchemes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchSchemes();
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedGovLevel]);

  const sortedSchemes = [...schemes].sort((a, b) => {
    if (sortBy === 'name_asc') return a.official_name.localeCompare(b.official_name);
    if (sortBy === 'name_desc') return b.official_name.localeCompare(a.official_name);
    return 0;
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedGovLevel('all');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-100 text-navy-900 text-xs font-semibold">
          <Compass className="w-3.5 h-3.5 text-teal-600" />
          <span>Welfare Catalogue</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">
          {t('exploreSchemes')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
          Browse verified government initiatives for Telangana and Central programs. Filter by category, scope, or keywords.
        </p>
      </div>

      <DisclaimerBanner compact />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by scheme name, department, or keywords..."
              className="w-full text-sm rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-slate-700"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Government Level Filter */}
          <div>
            <select
              value={selectedGovLevel}
              onChange={(e) => setSelectedGovLevel(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-slate-700"
            >
              <option value="all">All Jurisdictions</option>
              <option value="state">State (Telangana)</option>
              <option value="central">Central Government</option>
            </select>
          </div>
        </div>

        {/* Sub-bar: Count, Sort, and Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="font-medium">
            Showing <span className="font-bold text-navy-950">{sortedSchemes.length}</span> published schemes
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-slate-300 px-2 py-1 bg-white text-xs text-slate-700"
              >
                <option value="name_asc">Name (A to Z)</option>
                <option value="name_desc">Name (Z to A)</option>
              </select>
            </div>

            {(searchQuery || selectedCategory !== 'all' || selectedGovLevel !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800 font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scheme Cards Grid or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : sortedSchemes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-lg text-navy-950">No schemes found matching your criteria</h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Try adjusting your search terms or clearing category filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white font-medium text-xs hover:bg-teal-700"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSchemes.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      )}
    </div>
  );
};
