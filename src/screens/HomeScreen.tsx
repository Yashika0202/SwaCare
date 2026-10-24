import React, { useState, useEffect } from 'react';
import {
  Heart,
  Activity,
  Info,
  Sparkles,
  CheckCircle2,
  Edit3,
  Moon,
  Zap,
  AlertCircle,
  Calendar,
  Clock,
  Bell,
  AlertTriangle,
  BookOpen,
  Utensils,
  Dumbbell,
  Baby,
  ShieldCheck,
  ChevronRight,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { storage } from '../storage/localStorage';
import { DailyCheckIn, UserProfile } from '../types';
import { calculateCycleData, CyclePhase } from '../utils/cycleCalculator';
import { DailyCheckInScreen } from '../components/checkin/DailyCheckInScreen';
import { EmergencyCareCard } from '../components/emergency/EmergencyCareCard';
import { FactsScreen } from '../components/facts/FactsScreen';
import { PHASE_WELLNESS_GUIDE, LIFE_STAGE_GUIDE } from '../utils/wellnessGuide';

interface HomeScreenProps {
  onNavigateToCalendar?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = () => {
  const { t } = useTranslation();
  const todayStr = new Date().toISOString().split('T')[0];

  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isFactsOpen, setIsFactsOpen] = useState(false);
  const [todayLog, setTodayLog] = useState<DailyCheckIn | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [allLogs, setAllLogs] = useState<Record<string, DailyCheckIn>>({});
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(() => {
    return storage.get<boolean>('reminder_enabled', true);
  });
  const [isDiscreet, setIsDiscreet] = useState<boolean>(() => {
    return storage.get<boolean>('discreet_mode_enabled', false);
  });

  const reloadData = () => {
    const logs = storage.get<Record<string, DailyCheckIn>>('daily_logs', {});
    const profile = storage.get<UserProfile | null>('user_profile', null);
    setAllLogs(logs);
    setUserProfile(profile);
    setTodayLog(logs[todayStr] || null);
    setReminderEnabled(storage.get<boolean>('reminder_enabled', true));
    setIsDiscreet(storage.get<boolean>('discreet_mode_enabled', false));
  };

  useEffect(() => {
    reloadData();
    const handleDiscreetChange = () => {
      setIsDiscreet(storage.get<boolean>('discreet_mode_enabled', false));
    };
    window.addEventListener('luna_discreet_mode_changed', handleDiscreetChange);
    return () => {
      window.removeEventListener('luna_discreet_mode_changed', handleDiscreetChange);
    };
  }, []);

  const cycleData = calculateCycleData(allLogs, userProfile, todayStr);
  const lifeStage = userProfile?.lifeStage || 'adult';

  const handleSavedCheckIn = (entry: DailyCheckIn) => {
    setTodayLog(entry);
    reloadData();
  };

  const isPainSevere = (todayLog?.painLevel ?? 0) >= 8;

  // Pregnancy week calculation
  let pregnantWeeks = userProfile?.pregnancyWeeks || 14;
  if (userProfile?.lastPeriodStartDate) {
    const daysDiff = Math.max(
      0,
      Math.floor(
        (new Date(todayStr).getTime() - new Date(userProfile.lastPeriodStartDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    const calculatedWeeks = Math.floor(daysDiff / 7);
    if (calculatedWeeks > 0 && calculatedWeeks <= 42) {
      pregnantWeeks = calculatedWeeks;
    }
  }
  const pregnancyTrimester =
    pregnantWeeks <= 12 ? '1st' : pregnantWeeks <= 27 ? '2nd' : '3rd';

  // Phase badge styles
  const phaseColors: Record<CyclePhase, { bg: string; text: string; border: string }> = {
    menstrual: {
      bg: 'bg-[#F73F8B]/15',
      text: 'text-[#960045]',
      border: 'border-[#F73F8B]/30',
    },
    follicular: {
      bg: 'bg-[#FF6FAE]/25',
      text: 'text-[#0C1F78]',
      border: 'border-[#FF6FAE]/40',
    },
    ovulation: {
      bg: 'bg-[#FF6FAE]/40',
      text: 'text-[#0C1F78]',
      border: 'border-[#FF6FAE]',
    },
    luteal: {
      bg: 'bg-[#0C1F78]/10',
      text: 'text-[#0C1F78]',
      border: 'border-[#0C1F78]/20',
    },
  };

  const currentPhaseStyle = phaseColors[cycleData.currentPhase];
  const phaseWellness = PHASE_WELLNESS_GUIDE[cycleData.currentPhase];
  const lifeStageGuide = LIFE_STAGE_GUIDE[lifeStage];

  // SVG Ring calculation
  const ringRadius = 58;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const cycleProgress = Math.min(
    1,
    cycleData.currentCycleDay / Math.max(1, cycleData.cycleLength)
  );
  const strokeDashoffset = ringCircumference - cycleProgress * ringCircumference;

  const formatDaysUntilText = () => {
    if (cycleData.isLate) {
      return t('cycle.daysLate', { days: Math.abs(cycleData.daysUntilNextPeriod) });
    }
    if (cycleData.daysUntilNextPeriod === 0) {
      return t('cycle.dueToday');
    }
    return t('cycle.daysUntilNext', { days: cycleData.daysUntilNextPeriod });
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* 1. IN-APP REMINDER BANNER (RESPECTS DISCREET MODE) */}
      {!todayLog && reminderEnabled && (
        <div className="bg-[#FF6FAE]/20 border border-[#FF6FAE]/40 rounded-2xl p-3 flex items-center justify-between gap-2 text-xs animate-fadeIn">
          <div className="flex items-center gap-2 text-[#0C1F78] font-medium min-w-0">
            <Bell className="w-4 h-4 text-[#F73F8B] shrink-0" />
            <span className="truncate">
              {isDiscreet ? t('discreet.reminderText') : t('home.reminderBannerText')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCheckInOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#F73F8B] text-white font-bold text-xs shrink-0 hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            {isDiscreet ? t('discreet.reminderButton') : t('home.reminderCheckInNow')}
          </button>
        </div>
      )}

      {/* 2. LIFE-STAGE: PREGNANCY MODE HERO OR CYCLE HERO */}
      {lifeStage === 'pregnancy' ? (
        <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#FF6FAE]/30 relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-[#FF6FAE] text-[#0C1F78]">
              {t('lifestage.pregnancyTag')}
            </span>
            <span className="text-xs font-semibold text-[#0C1F78] bg-[#FFF5F9] px-2.5 py-1 rounded-lg border border-[#FF6FAE]/30">
              {t('lifestage.pregnancyTrimesterDisplay', { trimester: pregnancyTrimester })}
            </span>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF5F9] border-2 border-[#FF6FAE] flex items-center justify-center text-[#F73F8B] shrink-0 shadow-xs">
              <Baby className="w-8 h-8 text-[#F73F8B]" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#0C1F78]">
                {t('lifestage.pregnancyWeekDisplay', { week: pregnantWeeks })}
              </h2>
              <p className="text-xs text-[#0B1713]/80 mt-1 leading-snug">
                {t('lifestage.pregnancyBody')}
              </p>
            </div>
          </div>

          {/* Antenatal Checkups Reminder Card */}
          <div className="p-3.5 rounded-2xl bg-[#FFF5F9] border border-[#FF6FAE]/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0C1F78]">
              <Calendar className="w-4 h-4 text-[#F73F8B]" />
              <span>{t('lifestage.pregnancyCheckupsTitle')}</span>
            </div>
            <ul className="text-xs text-[#0B1713]/85 space-y-1.5 pl-6 list-disc">
              <li>{t('lifestage.pregnancyCheckup1')}</li>
              <li>{t('lifestage.pregnancyCheckup2')}</li>
            </ul>
          </div>

          {/* CRIMSON DANGER SIGNS WARNING CARD */}
          <div className="p-4 rounded-2xl bg-[#960045]/10 border-2 border-[#960045]/40 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#960045] shrink-0" />
              <strong className="font-extrabold text-[#960045]">
                {t('lifestage.pregnancyDangerAlertTitle')}
              </strong>
            </div>
            <p className="text-[#0B1713] leading-relaxed">
              {t('lifestage.pregnancyDangerAlertBody')}
            </p>
          </div>

          {/* Pregnancy Check-in CTA Button */}
          <button
            type="button"
            onClick={() => setIsCheckInOpen(true)}
            className="w-full min-h-[50px] p-4 rounded-2xl bg-[#F73F8B] text-white flex items-center justify-between shadow-sm hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-white" />
              <span className="font-bold text-sm">
                {todayLog ? t('home.editCheckInCTA') : "Today's Pregnancy Check-in"}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </section>
      ) : (
        /* STANDARD CYCLE HERO RING CARD */
        <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#FF6FAE]/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF6FAE]/15 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block text-xs font-bold px-3 py-1 rounded-xl border ${currentPhaseStyle.bg} ${currentPhaseStyle.text} ${currentPhaseStyle.border}`}
              >
                {t(`cycle.phases.${cycleData.currentPhase}`)}
              </span>
              {lifeStage !== 'adult' && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#FF6FAE] text-[#0C1F78]">
                  {t(lifeStageGuide.tagKey)}
                </span>
              )}
            </div>

            <span className="text-xs font-medium text-[#0C1F78] bg-[#FFF5F9] px-2.5 py-1 rounded-lg border border-[#FF6FAE]/30">
              {t('cycle.cycleLengthLabel', { days: cycleData.cycleLength })}
            </span>
          </div>

          {/* Circular Cycle Visualizer Ring */}
          <div className="flex flex-col sm:flex-row items-center gap-6 py-4">
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r={ringRadius}
                  fill="none"
                  stroke="#FFF5F9"
                  strokeWidth="10"
                />
                <circle
                  cx="70"
                  cy="70"
                  r={ringRadius}
                  fill="none"
                  stroke="#FF6FAE"
                  strokeOpacity="0.3"
                  strokeWidth="10"
                />
                <circle
                  cx="70"
                  cy="70"
                  r={ringRadius}
                  fill="none"
                  stroke="#F73F8B"
                  strokeWidth="10"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-[#0B1713]/60 uppercase tracking-wider">
                  {t('home.dayOf', { current: cycleData.currentCycleDay })}
                </span>
                <span className="text-3xl font-extrabold text-[#0C1F78] tabular-nums tracking-tight">
                  {cycleData.currentCycleDay}
                </span>
                <span className="text-[10px] font-medium text-[#0B1713]/70">
                  {t('home.ofTotal', { total: cycleData.cycleLength })}
                </span>
              </div>
            </div>

            {/* Status Breakdown & Phase Insights */}
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <h2 className="text-xl font-bold text-[#0C1F78]">
                {formatDaysUntilText()}
              </h2>
              <p className="text-xs text-[#0B1713] leading-relaxed">
                {t(`cycle.phaseDescriptions.${cycleData.currentPhase}`)}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFF5F9] border border-[#FF6FAE]/30 text-[11px] font-semibold text-[#0C1F78]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F73F8B]" />
                  <span>{t('home.periodDaysLabel')}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFF5F9] border border-[#FF6FAE]/30 text-[11px] font-semibold text-[#0C1F78]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF6FAE]" />
                  <span>{t('home.predictedWindowLabel')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button: Aaj Ka Check-in */}
          <div className="pt-2">
            {todayLog ? (
              <button
                type="button"
                onClick={() => setIsCheckInOpen(true)}
                className="w-full min-h-[48px] p-4 rounded-2xl bg-[#FFF5F9] border-2 border-[#FF6FAE]/40 flex items-center justify-between hover:bg-[#FF6FAE]/15 transition-all cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#FF6FAE] flex items-center justify-center text-[#0C1F78]">
                    <CheckCircle2 className="w-4 h-4 text-[#0C1F78]" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-xs text-[#0C1F78] block">
                      {isDiscreet ? t('discreet.checkinCompleted') : t('home.checkInCompletedTag')}
                    </span>
                    <span className="text-[11px] text-[#0B1713]/60">
                      {isDiscreet ? "Tap to view note" : t('home.editCheckInCTA')}
                    </span>
                  </div>
                </div>
                <Edit3 className="w-4 h-4 text-[#0C1F78] group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsCheckInOpen(true)}
                className="w-full min-h-[52px] p-4 rounded-2xl bg-[#F73F8B] text-white flex items-center justify-between shadow-sm hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-white" />
                  <div className="text-left">
                    <div className="font-bold text-sm tracking-tight">
                      {isDiscreet ? t('discreet.checkinCTA') : t('home.dailyCheckInCTA')}
                    </div>
                    <div className="text-[11px] text-white/80">
                      {t('home.dailyCheckInSub')}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </section>
      )}

      {/* 3. TEEN OR PERIMENOPAUSE SPECIFIC GUIDANCE CARD */}
      {lifeStage === 'teen' && (
        <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#FF6FAE]/25 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#FF6FAE] text-[#0C1F78]">
              {t('lifestage.teenTag')}
            </span>
            <h3 className="text-sm font-bold text-[#0C1F78]">
              {t('lifestage.teenTitle')}
            </h3>
          </div>
          <p className="text-xs text-[#0B1713] leading-relaxed">
            {t('lifestage.teenBody')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {lifeStageGuide.tips.map((tip) => (
              <div key={tip.titleKey} className="p-3 rounded-2xl bg-[#FFF5F9] border border-[#FF6FAE]/25 text-xs space-y-1">
                <strong className="font-bold text-[#0C1F78] block">
                  {t(tip.titleKey)}
                </strong>
                <p className="text-[11px] text-[#0B1713]/80 leading-snug">
                  {t(tip.descKey)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {lifeStage === 'perimenopause' && (
        <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#FF6FAE]/25 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#FF6FAE] text-[#0C1F78]">
              {t('lifestage.periTag')}
            </span>
            <h3 className="text-sm font-bold text-[#0C1F78]">
              {t('lifestage.periTitle')}
            </h3>
          </div>
          <p className="text-xs text-[#0B1713] leading-relaxed">
            {t('lifestage.periBody')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {lifeStageGuide.tips.map((tip) => (
              <div key={tip.titleKey} className="p-3 rounded-2xl bg-[#FFF5F9] border border-[#FF6FAE]/25 text-xs space-y-1">
                <strong className="font-bold text-[#0C1F78] block">
                  {t(tip.titleKey)}
                </strong>
                <p className="text-[11px] text-[#0B1713]/80 leading-snug">
                  {t(tip.descKey)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. CYCLE-PHASE WELLNESS GUIDE (FOOD, EXERCISE, ENERGY TIPS) */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#FF6FAE]/25 space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF5F9] border border-[#FF6FAE]/30 text-[#F73F8B] flex items-center justify-center shrink-0">
              <Utensils className="w-4 h-4 text-[#F73F8B]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0C1F78]">
                {t(phaseWellness.titleKey)}
              </h3>
              <p className="text-[11px] text-[#0B1713]/70">
                {t('wellness.cardSubtitle')}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#FF6FAE] text-[#0C1F78] shrink-0">
            {t(phaseWellness.badgeKey)}
          </span>
        </div>

        {/* 3 Pillars: Food, Exercise, Energy */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Food Tip */}
          <div className="p-3.5 rounded-2xl bg-[#FFF5F9] border border-[#FF6FAE]/25 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0C1F78]">
              <Utensils className="w-3.5 h-3.5 text-[#F73F8B]" />
              <span>{t('wellness.foodLabel')}</span>
            </div>
            <p className="text-[11px] text-[#0B1713] leading-relaxed">
              {t(phaseWellness.foodTipKey)}
            </p>
          </div>

          {/* Exercise Tip */}
          <div className="p-3.5 rounded-2xl bg-[#FFF5F9] border border-[#FF6FAE]/25 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0C1F78]">
              <Dumbbell className="w-3.5 h-3.5 text-[#0C1F78]" />
              <span>{t('wellness.exerciseLabel')}</span>
            </div>
            <p className="text-[11px] text-[#0B1713] leading-relaxed">
              {t(phaseWellness.exerciseTipKey)}
            </p>
          </div>

          {/* Energy Tip */}
          <div className="p-3.5 rounded-2xl bg-[#FFF5F9] border border-[#FF6FAE]/25 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0C1F78]">
              <Zap className="w-3.5 h-3.5 text-[#F73F8B]" />
              <span>{t('wellness.energyLabel')}</span>
            </div>
            <p className="text-[11px] text-[#0B1713] leading-relaxed">
              {t(phaseWellness.energyTipKey)}
            </p>
          </div>
        </div>

        <p className="text-[10px] text-[#0B1713]/60 italic text-right">
          {t('wellness.disclaimerText')}
        </p>
      </section>

      {/* 5. MYTH-BUSTING "KNOW THE FACTS" BANNER */}
      <section className="bg-gradient-to-r from-[#FFF5F9] to-white rounded-3xl p-4 border border-[#FF6FAE]/30 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0C1F78] text-white flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0C1F78]">
              {t('myths.screenTitle')}
            </h4>
            <p className="text-[11px] text-[#0B1713]/70">
              {t('myths.screenSubtitle')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsFactsOpen(true)}
          className="min-h-[38px] px-3.5 rounded-xl bg-[#0C1F78] text-white font-bold text-xs shrink-0 hover:bg-[#081552] active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <span>{t('common.select')}</span> &rarr;
        </button>
      </section>

      {/* 6. ESTIMATED FERTILE WINDOW BANNER (FOR NON-PREGNANCY MODES) */}
      {lifeStage !== 'pregnancy' && (
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#FF6FAE]/25 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FF6FAE]/25 text-[#0C1F78] border border-[#FF6FAE]/40 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-[#0C1F78]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-bold text-[#0C1F78]">
                {t('cycle.fertileWindowLabel')}
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FF6FAE] text-[#0C1F78]">
                {t('cycle.estimateBadge')}
              </span>
            </div>
            <p className="text-xs text-[#0B1713] font-medium">
              {cycleData.fertileWindowStartDate} - {cycleData.fertileWindowEndDate}
            </p>
            <p className="text-[11px] text-[#0B1713]/70 mt-1 leading-snug">
              {t('cycle.fertileEstimateNotice')}
            </p>
          </div>
        </section>
      )}

      {/* 7. TODAY'S LOGGED DATA SECTION */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#FF6FAE]/20 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#0C1F78] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#F73F8B]" />
            <span>{isDiscreet ? t('discreet.todayTitle') : t('home.todayLogTitle')}</span>
          </h3>
          {todayLog && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FF6FAE] text-[#0C1F78]">
              {isDiscreet ? t('discreet.checkinCompleted') : t('home.checkInCompletedTag')}
            </span>
          )}
        </div>

        <p className="text-xs text-[#0B1713] leading-relaxed">
          {t('home.todayLogSubtitle')}
        </p>

        {todayLog ? (
          <div className="space-y-3 pt-1">
            <div className="flex flex-wrap gap-2">
              {todayLog.flow !== 'none' && !isDiscreet && (
                <span className="min-h-[36px] inline-flex items-center px-3 rounded-lg bg-[#F73F8B] text-white text-xs font-bold capitalize shadow-xs">
                  {t('home.chipFlow', {
                    val: t(
                      `checkin.flow${todayLog.flow.charAt(0).toUpperCase() + todayLog.flow.slice(1)}`
                    ),
                  })}
                </span>
              )}

              <span className="min-h-[36px] inline-flex items-center px-3 rounded-lg bg-[#FF6FAE] text-[#0C1F78] text-xs font-semibold capitalize">
                <Zap className="w-3.5 h-3.5 mr-1 text-[#0C1F78]" />
                {t('home.chipEnergy', {
                  val: t(
                    `checkin.energy${todayLog.energy.charAt(0).toUpperCase() + todayLog.energy.slice(1)}`
                  ),
                })}
              </span>

              <span className="min-h-[36px] inline-flex items-center px-3 rounded-lg bg-[#FF6FAE] text-[#0B1713] text-xs font-medium capitalize">
                {t('home.chipMood', {
                  val: t(
                    `checkin.mood${todayLog.mood.charAt(0).toUpperCase() + todayLog.mood.slice(1)}`
                  ),
                })}
              </span>

              <span
                className={`min-h-[36px] inline-flex items-center px-3 rounded-lg text-xs font-bold ${
                  isPainSevere
                    ? 'bg-[#960045] text-white shadow-xs'
                    : 'bg-[#FF6FAE]/25 text-[#0C1F78] border border-[#FF6FAE]/30'
                }`}
              >
                {isPainSevere && <AlertCircle className="w-3.5 h-3.5 mr-1 text-white" />}
                {t('home.chipPain', { val: todayLog.painLevel })}
              </span>

              <span className="min-h-[36px] inline-flex items-center px-3 rounded-lg bg-[#FFF5F9] border border-[#FF6FAE]/30 text-[#0C1F78] text-xs font-medium capitalize">
                <Moon className="w-3.5 h-3.5 mr-1 text-[#0C1F78]" />
                {todayLog.sleepHours}h
              </span>
            </div>

            {/* Symptoms logged chips */}
            {todayLog.symptoms && todayLog.symptoms.length > 0 && (
              <div className="pt-2 border-t border-[#FF6FAE]/15">
                <span className="text-[11px] font-semibold text-[#0C1F78] block mb-1.5">
                  {t('checkin.symptomsSection')}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {todayLog.symptoms.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-md bg-[#FF6FAE] text-[#0C1F78] text-xs font-medium"
                    >
                      {t(
                        `checkin.symptom${s.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Optional note display */}
            {todayLog.note && (
              <div className="p-3 rounded-xl bg-[#FFF5F9] border border-[#FF6FAE]/25 text-xs text-[#0B1713] italic">
                "{todayLog.note}"
              </div>
            )}
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-[#FFF5F9] border border-[#FF6FAE]/30 text-xs text-[#0B1713]">
            {t('home.todayNoLogYet')}
          </div>
        )}
      </section>

      {/* 8. EMERGENCY HEALTH HELP BUTTON */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setIsEmergencyOpen(true)}
          className="w-full min-h-[46px] rounded-2xl bg-[#960045]/10 border border-[#960045]/30 text-[#960045] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#960045]/15 active:scale-98 transition-all cursor-pointer shadow-2xs"
        >
          <AlertTriangle className="w-4 h-4 text-[#960045]" />
          <span>{t('emergency.homeHelpButton')}</span>
        </button>
      </div>

      {/* Daily Check-in Modal */}
      <DailyCheckInScreen
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSaved={handleSavedCheckIn}
      />

      {/* Emergency Care Guidance Modal */}
      {isEmergencyOpen && (
        <EmergencyCareCard isModal onClose={() => setIsEmergencyOpen(false)} />
      )}

      {/* Know the Facts / Myth-Busting Modal */}
      <FactsScreen
        isOpen={isFactsOpen}
        onClose={() => setIsFactsOpen(false)}
      />
    </div>
  );
};
