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
  Droplets,
  Check,
  ChevronDown,
  ChevronUp,
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
  const { t, language } = useTranslation();
  const todayStr = new Date().toISOString().split('T')[0];

  const formatTodayHeaderDate = () => {
    const d = new Date();
    if (language === 'hi') {
      try {
        return d.toLocaleDateString('hi-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      } catch {
        return d.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }
    }
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isFactsOpen, setIsFactsOpen] = useState(false);
  const [selectedTeenTopic, setSelectedTeenTopic] = useState<'normal' | 'hygiene' | 'school' | null>(null);
  const [selectedWellnessPillar, setSelectedWellnessPillar] = useState<'food' | 'exercise' | 'energy' | null>(null);
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
      {/* 0. WELCOME GREETING & TODAY'S DATE */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#E6E8F3] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0C1F78] tracking-tight truncate">
            {userProfile?.name?.trim()
              ? t('home.welcomeWithName', { name: userProfile.name.trim() })
              : t('home.welcomeDefault')}
          </h1>
          <p className="text-xs font-semibold text-[#0B1713]/75 mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#0C1F78]/70 shrink-0" />
            <span>{t('home.todayDate', { date: formatTodayHeaderDate() })}</span>
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#F7F8FC] border border-[#E6E8F3] text-[#0C1F78] shadow-2xs">
            {isDiscreet ? t('discreet.appName') : t(lifeStageGuide.tagKey)}
          </span>
        </div>
      </section>

      {/* 1. IN-APP REMINDER BANNER (RESPECTS DISCREET MODE) */}
      {!todayLog && reminderEnabled && (
        <div className="bg-white border border-[#E6E8F3] rounded-2xl p-3 flex items-center justify-between gap-2 text-xs shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2 text-[#0C1F78] font-medium min-w-0">
            <Bell className="w-4 h-4 text-[#0C1F78] shrink-0" />
            <span className="truncate text-[#0B1713]">
              {isDiscreet ? t('discreet.reminderText') : t('home.reminderBannerText')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCheckInOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#F73F8B] text-white font-bold text-xs shrink-0 hover:bg-[#e02f78] active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            {isDiscreet ? t('discreet.reminderButton') : t('home.reminderCheckInNow')}
          </button>
        </div>
      )}

      {/* 2. LIFE-STAGE: PREGNANCY MODE HERO OR CYCLE HERO */}
      {lifeStage === 'pregnancy' ? (
        <section className="bg-[#0C1F78] text-white rounded-3xl p-6 shadow-md border border-[#081552] relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-[#FF6FAE] text-[#0C1F78]">
              {t('lifestage.pregnancyTag')}
            </span>
            <span className="text-xs font-semibold text-white/90 bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
              {t('lifestage.pregnancyTrimesterDisplay', { trimester: pregnancyTrimester })}
            </span>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Baby className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">
                {t('lifestage.pregnancyWeekDisplay', { week: pregnantWeeks })}
              </h2>
              <p className="text-xs text-white/80 mt-1 leading-snug">
                {t('lifestage.pregnancyBody')}
              </p>
            </div>
          </div>

          {/* Antenatal Checkups Reminder Card */}
          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Calendar className="w-4 h-4 text-[#FF6FAE]" />
              <span>{t('lifestage.pregnancyCheckupsTitle')}</span>
            </div>
            <ul className="text-xs text-white/85 space-y-1.5 pl-6 list-disc">
              <li>{t('lifestage.pregnancyCheckup1')}</li>
              <li>{t('lifestage.pregnancyCheckup2')}</li>
            </ul>
          </div>

          {/* CRIMSON DANGER SIGNS WARNING CARD */}
          <div className="p-4 rounded-2xl bg-[#960045]/20 border-2 border-[#960045] space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FF6FAE] shrink-0" />
              <strong className="font-extrabold text-white">
                {t('lifestage.pregnancyDangerAlertTitle')}
              </strong>
            </div>
            <p className="text-white/90 leading-relaxed">
              {t('lifestage.pregnancyDangerAlertBody')}
            </p>
          </div>

          {/* Pregnancy Check-in CTA Button: Hot Pink primary action button */}
          <button
            type="button"
            onClick={() => setIsCheckInOpen(true)}
            className="w-full min-h-[50px] p-4 rounded-2xl bg-[#F73F8B] text-white flex items-center justify-between shadow-sm hover:bg-[#e02f78] active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-white" />
              <span className="font-bold text-sm">
                {todayLog ? t('home.editCheckInCTA') : isDiscreet ? t('discreet.checkinCTA') : t('home.dailyCheckInCTA')}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </section>
      ) : (
        /* STANDARD CYCLE HERO RING CARD: DARK HERO CARD ON HOME (NAVY #0C1F78, WHITE TEXT) */
        <section className="bg-[#0C1F78] text-white rounded-3xl p-6 shadow-md border border-[#081552] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="inline-block text-xs font-bold px-3 py-1 rounded-xl bg-[#FF6FAE] text-[#0C1F78] shadow-xs">
                {t(`cycle.phases.${cycleData.currentPhase}`)}
              </span>
              {lifeStage !== 'adult' && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-white/10 text-white/90 border border-white/15">
                  {t(lifeStageGuide.tagKey)}
                </span>
              )}
            </div>

            <span className="text-xs font-medium text-white/90 bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
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
                  stroke="rgba(255, 255, 255, 0.15)"
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
                  stroke={cycleData.currentPhase === 'menstrual' ? '#F73F8B' : '#FF6FAE'}
                  strokeWidth="10"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
                  {t('home.dayOf', { current: cycleData.currentCycleDay })}
                </span>
                <span className="text-3xl font-extrabold text-white tabular-nums tracking-tight">
                  {cycleData.currentCycleDay}
                </span>
                <span className="text-[10px] font-medium text-white/75">
                  {t('home.ofTotal', { total: cycleData.cycleLength })}
                </span>
              </div>
            </div>

            {/* Status Breakdown & Phase Insights */}
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <h2 className="text-xl font-bold text-white">
                {formatDaysUntilText()}
              </h2>
              <p className="text-xs text-white/80 leading-relaxed">
                {t(`cycle.phaseDescriptions.${cycleData.currentPhase}`)}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-[11px] font-semibold text-white/90">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F73F8B]" />
                  <span>{t('home.periodDaysLabel')}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-[11px] font-semibold text-white/90">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF6FAE]" />
                  <span>{t('home.predictedWindowLabel')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button: Primary CTA in Hot Pink */}
          <div className="pt-2">
            {todayLog ? (
              <button
                type="button"
                onClick={() => setIsCheckInOpen(true)}
                className="w-full min-h-[48px] p-4 rounded-2xl bg-white text-[#0C1F78] border border-white flex items-center justify-between hover:bg-white/90 transition-all cursor-pointer shadow-sm group"
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
                className="w-full min-h-[52px] p-4 rounded-2xl bg-[#F73F8B] text-white flex items-center justify-between shadow-md hover:bg-[#e02f78] active:scale-[0.99] transition-all cursor-pointer"
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
        <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#E6E8F3] space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#FF6FAE] text-[#0C1F78]">
                {t('lifestage.teenTag')}
              </span>
              <h3 className="text-sm font-bold text-[#0C1F78]">
                {t('lifestage.teenTitle')}
              </h3>
            </div>
            {selectedTeenTopic && (
              <button
                type="button"
                onClick={() => setSelectedTeenTopic(null)}
                className="text-[11px] font-semibold text-[#0C1F78] hover:underline cursor-pointer"
              >
                {t('common.close')}
              </button>
            )}
          </div>

          <p className="text-xs text-[#0B1713]/70">
            {t('lifestage.teenTapPrompt')}
          </p>

          {/* 3 Tap-Based Topic Tiles */}
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                id: 'normal' as const,
                titleKey: 'lifestage.teenNormalTab',
                icon: <Sparkles className="w-4 h-4" />,
              },
              {
                id: 'hygiene' as const,
                titleKey: 'lifestage.teenHygieneTab',
                icon: <Droplets className="w-4 h-4" />,
              },
              {
                id: 'school' as const,
                titleKey: 'lifestage.teenSchoolTab',
                icon: <BookOpen className="w-4 h-4" />,
              },
            ].map((topic) => {
              const isSelected = selectedTeenTopic === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() =>
                    setSelectedTeenTopic(isSelected ? null : topic.id)
                  }
                  className={`min-h-[56px] p-2 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 text-center leading-tight ${
                    isSelected
                      ? 'bg-[#0C1F78] text-white border-[#0C1F78] shadow-xs'
                      : 'bg-[#F7F8FC] text-[#0C1F78] border-[#E6E8F3] hover:border-[#FF6FAE]'
                  }`}
                >
                  <div className={isSelected ? 'text-[#FF6FAE]' : 'text-[#0C1F78]'}>
                    {topic.icon}
                  </div>
                  <span className="text-[11px]">{t(topic.titleKey)}</span>
                </button>
              );
            })}
          </div>

          {/* Expanded detail box when tapped */}
          {selectedTeenTopic && (
            <div className="p-4 rounded-2xl bg-[#F7F8FC] border border-[#E6E8F3] text-xs space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#0C1F78] text-white flex items-center justify-center shadow-xs">
                    {selectedTeenTopic === 'normal' && <Sparkles className="w-3.5 h-3.5 text-[#FF6FAE]" />}
                    {selectedTeenTopic === 'hygiene' && <Droplets className="w-3.5 h-3.5 text-[#FF6FAE]" />}
                    {selectedTeenTopic === 'school' && <BookOpen className="w-3.5 h-3.5 text-[#FF6FAE]" />}
                  </div>
                  <h4 className="font-bold text-xs text-[#0C1F78]">
                    {selectedTeenTopic === 'normal' && t('lifestage.teenNormalTab')}
                    {selectedTeenTopic === 'hygiene' && t('lifestage.teenHygieneTab')}
                    {selectedTeenTopic === 'school' && t('lifestage.teenSchoolTab')}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTeenTopic(null)}
                  className="w-6 h-6 rounded-lg bg-white border border-[#E6E8F3] text-[#0C1F78] flex items-center justify-center hover:bg-[#E6E8F3] cursor-pointer"
                  aria-label={t('common.close')}
                >
                  <ChevronUp className="w-3.5 h-3.5 text-[#0C1F78]" />
                </button>
              </div>

              <p className="text-xs text-[#0B1713] leading-relaxed font-medium">
                {selectedTeenTopic === 'normal' && t('lifestage.teenNormalDesc')}
                {selectedTeenTopic === 'hygiene' && t('lifestage.teenHygieneDesc')}
                {selectedTeenTopic === 'school' && t('lifestage.teenSchoolDesc')}
              </p>

              <div className="space-y-2 pt-1 border-t border-[#E6E8F3]">
                {selectedTeenTopic === 'normal' && (
                  <>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#FF6FAE] text-[#0C1F78] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <p className="text-[11px] text-[#0B1713]/90 leading-snug">
                        {t('lifestage.teenNormalP1')}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#FF6FAE] text-[#0C1F78] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <p className="text-[11px] text-[#0B1713]/90 leading-snug">
                        {t('lifestage.teenNormalP2')}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#FF6FAE] text-[#0C1F78] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <p className="text-[11px] text-[#0B1713]/90 leading-snug">
                        {t('lifestage.teenNormalP3')}
                      </p>
                    </div>
                  </>
                )}

                {selectedTeenTopic === 'hygiene' && (
                  <>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#FF6FAE] text-[#0C1F78] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <p className="text-[11px] text-[#0B1713]/90 leading-snug">
                        {t('lifestage.teenHygieneP1')}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#FF6FAE] text-[#0C1F78] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <p className="text-[11px] text-[#0B1713]/90 leading-snug">
                        {t('lifestage.teenHygieneP2')}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#FF6FAE] text-[#0C1F78] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <p className="text-[11px] text-[#0B1713]/90 leading-snug">
                        {t('lifestage.teenHygieneP3')}
                      </p>
                    </div>
                  </>
                )}

                {selectedTeenTopic === 'school' && (
                  <>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#FF6FAE] text-[#0C1F78] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <p className="text-[11px] text-[#0B1713]/90 leading-snug">
                        {t('lifestage.teenSchoolP1')}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#FF6FAE] text-[#0C1F78] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <p className="text-[11px] text-[#0B1713]/90 leading-snug">
                        {t('lifestage.teenSchoolP2')}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#FF6FAE] text-[#0C1F78] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <p className="text-[11px] text-[#0B1713]/90 leading-snug">
                        {t('lifestage.teenSchoolP3')}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {lifeStage === 'perimenopause' && (
        <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#E6E8F3] space-y-3">
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
              <div key={tip.titleKey} className="p-3 rounded-2xl bg-[#F7F8FC] border border-[#E6E8F3] text-xs space-y-1">
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
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#E6E8F3] space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F7F8FC] border border-[#E6E8F3] text-[#0C1F78] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[#0C1F78]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0C1F78]">
                {t(phaseWellness.titleKey)}
              </h3>
              <p className="text-[11px] text-[#0B1713]/70">
                {t('wellness.tapPrompt')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#FF6FAE] text-[#0C1F78]">
              {t(phaseWellness.badgeKey)}
            </span>
            {selectedWellnessPillar && (
              <button
                type="button"
                onClick={() => setSelectedWellnessPillar(null)}
                className="text-[11px] font-semibold text-[#0C1F78] hover:underline cursor-pointer"
              >
                {t('common.close')}
              </button>
            )}
          </div>
        </div>

        {/* 3 Interactive Tap-Based Pillar Tiles */}
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              id: 'food' as const,
              labelKey: 'wellness.foodLabel',
              descKey: phaseWellness.foodTipKey,
              pointsKeys: phaseWellness.foodPointsKeys,
              icon: <Utensils className="w-4 h-4" />,
            },
            {
              id: 'exercise' as const,
              labelKey: 'wellness.exerciseLabel',
              descKey: phaseWellness.exerciseTipKey,
              pointsKeys: phaseWellness.exercisePointsKeys,
              icon: <Dumbbell className="w-4 h-4" />,
            },
            {
              id: 'energy' as const,
              labelKey: 'wellness.energyLabel',
              descKey: phaseWellness.energyTipKey,
              pointsKeys: phaseWellness.energyPointsKeys,
              icon: <Zap className="w-4 h-4" />,
            },
          ].map((pillar) => {
            const isSelected = selectedWellnessPillar === pillar.id;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() =>
                  setSelectedWellnessPillar(isSelected ? null : pillar.id)
                }
                className={`min-h-[56px] p-2 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 text-center leading-tight ${
                  isSelected
                    ? 'bg-[#0C1F78] text-white border-[#0C1F78] shadow-xs'
                    : 'bg-[#F7F8FC] text-[#0C1F78] border-[#E6E8F3] hover:border-[#FF6FAE]'
                }`}
              >
                <div className={isSelected ? 'text-[#FF6FAE]' : 'text-[#0C1F78]'}>
                  {pillar.icon}
                </div>
                <span className="text-[11px]">{t(pillar.labelKey)}</span>
              </button>
            );
          })}
        </div>

        {/* Expanded Detail Guidance when a pillar is tapped */}
        {selectedWellnessPillar && (() => {
          const activePillar = [
            {
              id: 'food' as const,
              labelKey: 'wellness.foodLabel',
              descKey: phaseWellness.foodTipKey,
              pointsKeys: phaseWellness.foodPointsKeys,
              icon: <Utensils className="w-3.5 h-3.5 text-[#FF6FAE]" />,
            },
            {
              id: 'exercise' as const,
              labelKey: 'wellness.exerciseLabel',
              descKey: phaseWellness.exerciseTipKey,
              pointsKeys: phaseWellness.exercisePointsKeys,
              icon: <Dumbbell className="w-3.5 h-3.5 text-[#FF6FAE]" />,
            },
            {
              id: 'energy' as const,
              labelKey: 'wellness.energyLabel',
              descKey: phaseWellness.energyTipKey,
              pointsKeys: phaseWellness.energyPointsKeys,
              icon: <Zap className="w-3.5 h-3.5 text-[#FF6FAE]" />,
            },
          ].find((p) => p.id === selectedWellnessPillar)!;

          return (
            <div className="p-4 rounded-2xl bg-[#F7F8FC] border border-[#E6E8F3] text-xs space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#0C1F78] text-white flex items-center justify-center shadow-xs">
                    {activePillar.icon}
                  </div>
                  <h4 className="font-bold text-xs text-[#0C1F78]">
                    {t(activePillar.labelKey)}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedWellnessPillar(null)}
                  className="w-6 h-6 rounded-lg bg-white border border-[#E6E8F3] text-[#0C1F78] flex items-center justify-center hover:bg-[#E6E8F3] cursor-pointer"
                  aria-label={t('common.close')}
                >
                  <ChevronUp className="w-3.5 h-3.5 text-[#0C1F78]" />
                </button>
              </div>

              <p className="text-xs text-[#0B1713] leading-relaxed font-medium">
                {t(activePillar.descKey)}
              </p>

              {activePillar.pointsKeys && activePillar.pointsKeys.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-[#E6E8F3]">
                  {activePillar.pointsKeys.map((pKey) => (
                    <div key={pKey} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#FF6FAE] text-[#0C1F78] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <p className="text-[11px] text-[#0B1713]/90 leading-snug">
                        {t(pKey)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        <p className="text-[10px] text-[#0B1713]/60 italic text-right pt-0.5">
          {t('wellness.disclaimerText')}
        </p>
      </section>

      {/* 5. MYTH-BUSTING "KNOW THE FACTS" BANNER */}
      <section className="bg-white rounded-3xl p-4 border border-[#E6E8F3] flex items-center justify-between gap-3 shadow-xs">
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
        <section className="bg-white rounded-3xl p-4 shadow-sm border border-[#E6E8F3] flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F7F8FC] text-[#0C1F78] border border-[#E6E8F3] flex items-center justify-center shrink-0 mt-0.5">
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
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#E6E8F3] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#0C1F78] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0C1F78]" />
            <span>{isDiscreet ? t('discreet.todayTitle') : t('home.todayLogTitle')}</span>
          </h3>
          {todayLog && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FF6FAE] text-[#0C1F78]">
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

              <span className="min-h-[36px] inline-flex items-center px-3 rounded-lg bg-[#FF6FAE] text-[#0C1F78] text-xs font-bold capitalize">
                <Zap className="w-3.5 h-3.5 mr-1 text-[#0C1F78]" />
                {t('home.chipEnergy', {
                  val: t(
                    `checkin.energy${todayLog.energy.charAt(0).toUpperCase() + todayLog.energy.slice(1)}`
                  ),
                })}
              </span>

              <span className="min-h-[36px] inline-flex items-center px-3 rounded-lg bg-[#FF6FAE] text-[#0B1713] text-xs font-bold capitalize">
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
                    : 'bg-[#F7F8FC] text-[#0C1F78] border border-[#E6E8F3]'
                }`}
              >
                {isPainSevere && <AlertCircle className="w-3.5 h-3.5 mr-1 text-white" />}
                {t('home.chipPain', { val: todayLog.painLevel })}
              </span>

              <span className="min-h-[36px] inline-flex items-center px-3 rounded-lg bg-[#F7F8FC] border border-[#E6E8F3] text-[#0C1F78] text-xs font-semibold capitalize">
                <Moon className="w-3.5 h-3.5 mr-1 text-[#0C1F78]" />
                {todayLog.sleepHours}h
              </span>
            </div>

            {/* Symptoms logged chips */}
            {todayLog.symptoms && todayLog.symptoms.length > 0 && (
              <div className="pt-2 border-t border-[#E6E8F3]">
                <span className="text-[11px] font-semibold text-[#0C1F78] block mb-1.5">
                  {t('checkin.symptomsSection')}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {todayLog.symptoms.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-md bg-[#FF6FAE] text-[#0C1F78] text-xs font-bold"
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
              <div className="p-3 rounded-xl bg-[#F7F8FC] border border-[#E6E8F3] text-xs text-[#0B1713] italic">
                "{todayLog.note}"
              </div>
            )}
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-[#F7F8FC] border border-[#E6E8F3] text-xs text-[#0B1713]">
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
