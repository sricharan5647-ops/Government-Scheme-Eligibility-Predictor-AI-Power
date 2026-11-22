import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  User,
  GraduationCap,
  Briefcase,
  IndianRupee,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Shield,
  HelpCircle,
  AlertCircle,
  Wheat
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CitizenProfile } from '../types';
import { api } from '../services/api';

export const QuestionnairePage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [profile, setProfile] = useState<CitizenProfile>(() => {
    try {
      const saved = sessionStorage.getItem('schemesathi_profile');
      return saved ? JSON.parse(saved) : {
        state_code: 'TG',
        district: '',
        age: '',
        education_level: '',
        occupation: '',
        annual_household_income: '',
        student_status: false,
        farmer_status: false,
        landholding_acres: '',
        gender: '',
        social_category: '',
        has_bpl_ration_card: false
      };
    } catch {
      return {
        state_code: 'TG',
        district: '',
        age: '',
        education_level: '',
        occupation: '',
        annual_household_income: '',
        student_status: false,
        farmer_status: false,
        landholding_acres: '',
        gender: '',
        social_category: '',
        has_bpl_ration_card: false
      };
    }
  });

  const [metadata, setMetadata] = useState<any>({
    districts_telangana: [],
    education_levels: [],
    occupations: [],
    social_categories: []
  });

  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMeta() {
      try {
        const meta = await api.getMetadata();
        setMetadata(meta);
      } catch (e) {
        console.error(e);
      }
    }
    loadMeta();
  }, []);

  const handleChange = (field: keyof CitizenProfile, value: any) => {
    setProfile((prev) => {
      const updated = { ...prev, [field]: value };
      sessionStorage.setItem('schemesathi_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const handleNext = () => {
    setError(null);
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitEvaluation = async () => {
    setEvaluating(true);
    setError(null);
    try {
      // Prepare clean profile payload
      const cleanProfile: CitizenProfile = {
        ...profile,
        age: profile.age ? Number(profile.age) : undefined,
        annual_household_income: profile.annual_household_income ? Number(profile.annual_household_income) : undefined,
        landholding_acres: profile.landholding_acres ? Number(profile.landholding_acres) : undefined,
      };

      const result = await api.evaluateEligibility(cleanProfile);
      sessionStorage.setItem('schemesathi_evaluation_results', JSON.stringify(result));
      navigate('/results');
    } catch (err: any) {
      setError(err.message || 'Evaluation failed. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const stepsList = [
    { num: 1, title: t('stepLocation') },
    { num: 2, title: t('stepDemographics') },
    { num: 3, title: t('stepEducationWork') },
    { num: 4, title: t('stepIncomeStatus') },
    { num: 5, title: t('stepReview') },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title & Privacy Box */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
          {t('questionnaireTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {t('questionnaireSubtitle')}
        </p>
        <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 text-xs flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <span>
            <strong>Privacy Guarantee:</strong> Answers are not stored on our servers. You may select &quot;Prefer not to say&quot; on optional items.
          </span>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
            Step {step} of {totalSteps}: {stepsList[step - 1].title}
          </span>
          <span className="text-xs font-bold text-slate-600">
            {Math.round((step / totalSteps) * 100)}%
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-5 gap-1 mt-3 pt-2 border-t border-slate-100 text-center">
          {stepsList.map((s) => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`text-[11px] font-medium truncate px-1 py-1 rounded transition-colors ${
                s.num === step
                  ? 'text-teal-700 font-bold bg-teal-50'
                  : s.num < step
                  ? 'text-slate-700 hover:text-navy-900'
                  : 'text-slate-400'
              }`}
            >
              {s.num}. {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Step Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Location & Domicile */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-base font-bold text-navy-950 pb-2 border-b border-slate-100">
              <MapPin className="w-5 h-5 text-teal-600" />
              <span>Location & Residence</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Current State of Residence <span className="text-rose-500">*</span>
              </label>
              <select
                value={profile.state_code || 'TG'}
                onChange={(e) => handleChange('state_code', e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                <option value="TG">Telangana (Pilot Focus)</option>
                <option value="CENTRAL">Other Indian State (Central Schemes Only)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                State selection determines whether state-specific schemes (like Rythu Bandhu or Aarogyasri) apply to you.
              </p>
            </div>

            {profile.state_code === 'TG' && (
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  District in Telangana <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <select
                  value={profile.district || ''}
                  onChange={(e) => handleChange('district', e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                >
                  <option value="">-- Select District (Optional) --</option>
                  {(metadata.districts_telangana || []).map((dist: string) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Demographics */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-base font-bold text-navy-950 pb-2 border-b border-slate-100">
              <User className="w-5 h-5 text-teal-600" />
              <span>Basic Demographics</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Age in Years <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={profile.age || ''}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="e.g. 28"
                className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Used to evaluate age-bracket schemes (such as youth apprenticeships or senior citizen pensions).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Gender <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <select
                value={profile.gender || ''}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                <option value="">-- Prefer not to say / Any --</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="transgender">Transgender</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Required for women-specific schemes like Matru Vandana or Kalyana Lakshmi.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Social Category <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <select
                value={profile.social_category || ''}
                onChange={(e) => handleChange('social_category', e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                <option value="">-- Prefer not to say / General --</option>
                <option value="sc">Scheduled Caste (SC)</option>
                <option value="st">Scheduled Tribe (ST)</option>
                <option value="bc">Backward Classes (BC)</option>
                <option value="minority">Religious Minority</option>
                <option value="general">General / Open Category</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Only collected because specific affirmative action welfare programs (like Dalit Bandhu or Ambedkar Overseas Vidya Nidhi) require it by statute.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Education & Occupation */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-base font-bold text-navy-950 pb-2 border-b border-slate-100">
              <GraduationCap className="w-5 h-5 text-teal-600" />
              <span>Education & Occupation</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Highest Education Level Achieved <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <select
                value={profile.education_level || ''}
                onChange={(e) => handleChange('education_level', e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                <option value="">-- Prefer not to say / Unspecified --</option>
                {(metadata.education_levels || []).map((lvl: any) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Current Primary Occupation <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <select
                value={profile.occupation || ''}
                onChange={(e) => handleChange('occupation', e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                <option value="">-- Prefer not to say / Unspecified --</option>
                {(metadata.occupations || []).map((occ: any) => (
                  <option key={occ.value} value={occ.value}>
                    {occ.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!profile.student_status}
                  onChange={(e) => handleChange('student_status', e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <span className="text-xs font-medium text-slate-800">
                  Currently enrolled as a student in an educational institution
                </span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 4: Income & Livelihood specifics */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-base font-bold text-navy-950 pb-2 border-b border-slate-100">
              <IndianRupee className="w-5 h-5 text-teal-600" />
              <span>Income & Livelihood Details</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Estimated Annual Household Income (₹) <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={profile.annual_household_income || ''}
                onChange={(e) => handleChange('annual_household_income', e.target.value)}
                placeholder="e.g. 180000"
                className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Income caps exist on many poverty alleviation and scholarship programs (e.g. under Rs. 5 Lakhs for scholarships, or under Rs. 1.5 Lakhs for pensions).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Agriculture & Landholding</h4>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!profile.farmer_status}
                  onChange={(e) => handleChange('farmer_status', e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <span className="text-xs font-medium text-slate-800">
                  Are you an agricultural cultivator or patta landholder?
                </span>
              </label>

              {profile.farmer_status && (
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Documented Landholding in Acres
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={profile.landholding_acres || ''}
                    onChange={(e) => handleChange('landholding_acres', e.target.value)}
                    placeholder="e.g. 2.5"
                    className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Required for schemes like Rythu Bandhu and PM-KISAN.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!profile.has_bpl_ration_card}
                  onChange={(e) => handleChange('has_bpl_ration_card', e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-slate-800">
                    Holds active Food Security Card (White Ration Card / BPL card)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Essential for free healthcare under Aarogyasri / Ayushman Bharat.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Submit */}
        {step === 5 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-base font-bold text-navy-950 pb-2 border-b border-slate-100">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <span>Review Your Profile Answers</span>
            </div>

            <p className="text-xs text-slate-600">
              Please review the details you provided. You can go back to edit any section before running the eligibility rule matching.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <span className="text-slate-500">State:</span>
                <p className="font-semibold text-slate-900">{profile.state_code === 'TG' ? 'Telangana' : 'Other / Central'}</p>
              </div>
              {profile.district && (
                <div className="space-y-1">
                  <span className="text-slate-500">District:</span>
                  <p className="font-semibold text-slate-900">{profile.district}</p>
                </div>
              )}
              <div className="space-y-1">
                <span className="text-slate-500">Age:</span>
                <p className="font-semibold text-slate-900">{profile.age ? `${profile.age} Years` : 'Not provided'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500">Gender:</span>
                <p className="font-semibold text-slate-900">{profile.gender || 'Not specified'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500">Occupation:</span>
                <p className="font-semibold text-slate-900">{profile.occupation || 'Not specified'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500">Annual Income:</span>
                <p className="font-semibold text-slate-900">
                  {profile.annual_household_income ? `₹ ${Number(profile.annual_household_income).toLocaleString('en-IN')}` : 'Not provided'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500">Farmer Status:</span>
                <p className="font-semibold text-slate-900">{profile.farmer_status ? `Yes (${profile.landholding_acres || '0'} Acres)` : 'No'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500">BPL / White Card:</span>
                <p className="font-semibold text-slate-900">{profile.has_bpl_ration_card ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <strong>Transparent evaluation note:</strong> Any field left as &quot;Not provided&quot; will be assessed as an <em>Unknown Condition</em> for schemes that require it. You will see which conditions are missing in the results.
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs sm:text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('prevStep')}</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm shadow-xs"
            >
              <span>{t('nextStep')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={evaluating}
              onClick={handleSubmitEvaluation}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-sm shadow-md"
            >
              <span>{evaluating ? 'Evaluating Rules...' : t('evaluateBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
