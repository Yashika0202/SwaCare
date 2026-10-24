import React, { useState } from 'react';
import { useTranslation, Language } from '../../context/LanguageContext';
import { UserProfile } from '../../types';
import { storage } from '../../storage/localStorage';
import { ShieldCheck, Sparkles, ArrowRight, ArrowLeft, Heart, Check, Calendar, Clock, User } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { language, setLanguage, t } = useTranslation();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form states with requested defaults: cycle 28, period 5
  const today = new Date();
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(today.getDate() - 14);
  const defaultDateStr = twoWeeksAgo.toISOString().split('T')[0];

  const [age, setAge] = useState<number>(25);
  const [lifeStage, setLifeStage] = useState<'teen' | 'adult' | 'pregnancy' | 'perimenopause'>('adult');
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [periodLength, setPeriodLength] = useState<number>(5);
  const [lastPeriodDate, setLastPeriodDate] = useState<string>(defaultDateStr);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectLanguage = (selectedLang: Language) => {
    setLanguage(selectedLang);
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!age || age < 10 || age > 80 || !cycleLength || !periodLength || !lastPeriodDate) {
      setErrorMsg(t('onboarding.step3.validationError'));
      return;
    }

    const profile: UserProfile = {
      age,
      lifeStage,
      averageCycleLength: cycleLength,
      averagePeriodLength: periodLength,
      lastPeriodStartDate: lastPeriodDate,
      completedOnboarding: true,
    };

    storage.set('user_profile', profile);
    storage.set('onboarding_completed', true);
    onComplete(profile);
  };

  return (
    <div className="min-h-screen bg-[#FFF5F9] text-[#0B1713] flex flex-col justify-between p-4 max-w-md mx-auto">
      {/* Top Header / Progress Indicator */}
      <header className="pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#F73F8B] flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[#0C1F78] text-base tracking-tight">
            {t('app.name')}
          </span>
        </div>

        {/* Step indicator pills */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === s
                  ? 'w-6 bg-[#F73F8B]'
                  : step > s
                  ? 'w-2 bg-[#FF6FAE]'
                  : 'w-2 bg-[#FF6FAE]/30'
              }`}
            />
          ))}
        </div>
      </header>

      {/* Main Step Content */}
      <main className="flex-1 flex flex-col justify-center py-6">
        {/* STEP 1: Language Selection */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#FF6FAE] text-[#0C1F78] mb-2">
                {t('onboarding.step1.tag')}
              </span>
              <h2 className="text-2xl font-bold text-[#0C1F78] tracking-tight">
                {t('onboarding.step1.title')}
              </h2>
              <p className="text-sm text-[#0B1713] mt-2 leading-relaxed">
                {t('onboarding.step1.subtitle')}
              </p>
            </div>

            {/* 2 Large Buttons Showing Each Language in its Own Script */}
            <div className="grid grid-cols-1 gap-4 pt-2">
              {/* English Button */}
              <button
                type="button"
                onClick={() => handleSelectLanguage('en')}
                className={`min-h-[76px] w-full p-5 rounded-2xl border-2 flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-sm cursor-pointer ${
                  language === 'en'
                    ? 'border-[#F73F8B] bg-white ring-2 ring-[#F73F8B]/20'
                    : 'border-[#FF6FAE]/40 bg-white hover:border-[#FF6FAE]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                      language === 'en'
                        ? 'bg-[#F73F8B] text-white'
                        : 'bg-[#FF6FAE]/25 text-[#0C1F78]'
                    }`}
                  >
                    EN
                  </div>
                  <div>
                    <div className="text-lg font-bold text-[#0C1F78]">
                      {t('onboarding.step1.englishScript')}
                    </div>
                    <div className="text-xs text-[#0B1713]/70">
                      {t('onboarding.step1.englishLabel')}
                    </div>
                  </div>
                </div>
                {language === 'en' && (
                  <div className="w-7 h-7 rounded-full bg-[#F73F8B] flex items-center justify-center text-white">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>

              {/* Hindi Button (हिन्दी in Devanagari script) */}
              <button
                type="button"
                onClick={() => handleSelectLanguage('hi')}
                className={`min-h-[76px] w-full p-5 rounded-2xl border-2 flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-sm cursor-pointer ${
                  language === 'hi'
                    ? 'border-[#F73F8B] bg-white ring-2 ring-[#F73F8B]/20'
                    : 'border-[#FF6FAE]/40 bg-white hover:border-[#FF6FAE]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                      language === 'hi'
                        ? 'bg-[#F73F8B] text-white'
                        : 'bg-[#FF6FAE]/25 text-[#0C1F78]'
                    }`}
                  >
                    हि
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#0C1F78] font-sans">
                      {t('onboarding.step1.hindiScript')}
                    </div>
                    <div className="text-xs text-[#0B1713]/70">
                      {t('onboarding.step1.hindiLabel')}
                    </div>
                  </div>
                </div>
                {language === 'hi' && (
                  <div className="w-7 h-7 rounded-full bg-[#F73F8B] flex items-center justify-center text-white">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full min-h-[48px] rounded-xl bg-[#F73F8B] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>{t('common.continue')}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Welcome Screen with Privacy Note */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#FF6FAE] text-[#0C1F78] mb-2">
                {t('onboarding.step2.tag')}
              </span>
              <h2 className="text-2xl font-bold text-[#0C1F78] tracking-tight">
                {t('onboarding.step2.welcomeTitle')}
              </h2>
              <p className="text-sm text-[#0B1713] mt-2 leading-relaxed">
                {t('onboarding.step2.welcomeSubtitle')}
              </p>
            </div>

            {/* Privacy Highlight Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#FF6FAE]/30 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#FFF5F9] border border-[#FF6FAE]/40 flex items-center justify-center text-[#F73F8B] shrink-0">
                  <ShieldCheck className="w-6 h-6 text-[#F73F8B]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0C1F78]">
                    {t('onboarding.step2.privacyBadge')}
                  </span>
                  <h3 className="text-base font-bold text-[#0C1F78] leading-tight">
                    {t('onboarding.step2.privacyNote')}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-[#0B1713] leading-relaxed pt-1">
                {t('onboarding.step2.privacyDescription')}
              </p>

              <div className="pt-2 space-y-2 border-t border-[#FF6FAE]/20">
                <div className="flex items-center gap-2 text-xs text-[#0C1F78] font-medium">
                  <div className="w-4 h-4 rounded-full bg-[#FF6FAE] text-[#0C1F78] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>{t('onboarding.step2.bullet1')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#0C1F78] font-medium">
                  <div className="w-4 h-4 rounded-full bg-[#FF6FAE] text-[#0C1F78] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>{t('onboarding.step2.bullet2')}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="min-h-[48px] px-4 rounded-xl border border-[#FF6FAE]/40 bg-white text-[#0C1F78] font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-[#FFF5F9] transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-[#0C1F78]" />
                <span>{t('common.back')}</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 min-h-[48px] rounded-xl bg-[#F73F8B] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>{t('onboarding.step2.continueButton')}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Basic Cycle Details */}
        {step === 3 && (
          <form onSubmit={handleFinish} className="space-y-4 animate-fadeIn">
            <div>
              <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#FF6FAE] text-[#0C1F78] mb-2">
                {t('onboarding.step3.tag')}
              </span>
              <h2 className="text-2xl font-bold text-[#0C1F78] tracking-tight">
                {t('onboarding.step3.title')}
              </h2>
              <p className="text-xs text-[#0B1713] mt-1 leading-relaxed">
                {t('onboarding.step3.subtitle')}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#960045]/10 border border-[#960045]/30 text-[#960045] text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Inputs Container */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#FF6FAE]/30 space-y-4">
              {/* Life-Stage Mode Selector */}
              <div>
                <label className="block text-xs font-bold text-[#0C1F78] mb-1.5">
                  {t('lifestage.modeSelectorTitle')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: 'teen', labelKey: 'lifestage.teenLabel', subKey: 'lifestage.teenSub' },
                      { id: 'adult', labelKey: 'lifestage.adultLabel', subKey: 'lifestage.adultSub' },
                      { id: 'pregnancy', labelKey: 'lifestage.pregnancyLabel', subKey: 'lifestage.pregnancySub' },
                      { id: 'perimenopause', labelKey: 'lifestage.periLabel', subKey: 'lifestage.periSub' },
                    ] as const
                  ).map((m) => {
                    const isSelected = lifeStage === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setLifeStage(m.id)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer active:scale-98 ${
                          isSelected
                            ? 'bg-[#FF6FAE] border-[#F73F8B] shadow-xs text-[#0C1F78]'
                            : 'bg-[#FFF5F9] border-[#FF6FAE]/30 hover:border-[#FF6FAE] text-[#0B1713]'
                        }`}
                      >
                        <div className="text-xs font-bold leading-tight">
                          {t(m.labelKey)}
                        </div>
                        <div className="text-[10px] text-[#0B1713]/70 truncate mt-0.5">
                          {t(m.subKey)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-bold text-[#0C1F78] mb-1">
                  {t('onboarding.step3.ageLabel')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={12}
                    max={70}
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                    placeholder={t('onboarding.step3.agePlaceholder')}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#FF6FAE]/40 text-sm font-semibold text-[#0B1713] focus:outline-none focus:ring-2 focus:ring-[#F73F8B] bg-[#FFF5F9]/40"
                    required
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[#0C1F78]/70">
                    {t('common.years')}
                  </span>
                </div>
              </div>

              {/* Average Cycle Length (Default 28) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#0C1F78]">
                    {t('onboarding.step3.cycleLengthLabel')}
                  </label>
                  <span className="text-xs font-bold text-[#F73F8B] bg-[#FF6FAE]/25 px-2 py-0.5 rounded-md">
                    {cycleLength} {t('common.days')}
                  </span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={45}
                  value={cycleLength}
                  onChange={(e) => setCycleLength(parseInt(e.target.value))}
                  className="w-full accent-[#F73F8B] cursor-pointer"
                />
                <p className="text-[11px] text-[#0B1713]/70 mt-1">
                  {t('onboarding.step3.cycleLengthHint')}
                </p>
              </div>

              {/* Average Period Length (Default 5) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#0C1F78]">
                    {t('onboarding.step3.periodLengthLabel')}
                  </label>
                  <span className="text-xs font-bold text-[#F73F8B] bg-[#FF6FAE]/25 px-2 py-0.5 rounded-md">
                    {periodLength} {t('common.days')}
                  </span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={periodLength}
                  onChange={(e) => setPeriodLength(parseInt(e.target.value))}
                  className="w-full accent-[#F73F8B] cursor-pointer"
                />
                <p className="text-[11px] text-[#0B1713]/70 mt-1">
                  {t('onboarding.step3.periodLengthHint')}
                </p>
              </div>

              {/* Last Period Start Date */}
              <div>
                <label className="block text-xs font-bold text-[#0C1F78] mb-1">
                  {t('onboarding.step3.lastPeriodLabel')}
                </label>
                <input
                  type="date"
                  value={lastPeriodDate}
                  onChange={(e) => setLastPeriodDate(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#FF6FAE]/40 text-sm font-semibold text-[#0B1713] focus:outline-none focus:ring-2 focus:ring-[#F73F8B] bg-[#FFF5F9]/40"
                  required
                />
                <p className="text-[11px] text-[#0B1713]/70 mt-1">
                  {t('onboarding.step3.lastPeriodHint')}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="min-h-[48px] px-4 rounded-xl border border-[#FF6FAE]/40 bg-white text-[#0C1F78] font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-[#FFF5F9] transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-[#0C1F78]" />
                <span>{t('common.back')}</span>
              </button>
              <button
                type="submit"
                className="flex-1 min-h-[48px] rounded-xl bg-[#F73F8B] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>{t('onboarding.step3.finishButton')}</span>
                <Sparkles className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};
