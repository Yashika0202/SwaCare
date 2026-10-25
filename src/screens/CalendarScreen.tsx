import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Droplets,
  Sparkles,
  Calendar as CalendarIcon,
  Plus,
  Edit3,
  AlertCircle,
  Activity,
  Heart,
  Moon,
  Zap,
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { storage } from '../storage/localStorage';
import { DailyCheckIn, UserProfile } from '../types';
import { calculateCycleData, formatDate, parseDate } from '../utils/cycleCalculator';
import { DailyCheckInScreen } from '../components/checkin/DailyCheckInScreen';

export const CalendarScreen: React.FC = () => {
  const { t } = useTranslation();
  const todayStr = formatDate(new Date());

  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isCheckInOpen, setIsCheckInOpen] = useState<boolean>(false);

  const [allLogs, setAllLogs] = useState<Record<string, DailyCheckIn>>({});
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const loadData = () => {
    const logs = storage.get<Record<string, DailyCheckIn>>('daily_logs', {});
    const profile = storage.get<UserProfile | null>('user_profile', null);
    setAllLogs(logs);
    setUserProfile(profile);
  };

  useEffect(() => {
    loadData();
  }, []);

  const cycleData = calculateCycleData(allLogs, userProfile, todayStr);

  const weekDays = [
    t('calendar.weekDays.m'),
    t('calendar.weekDays.t1'),
    t('calendar.weekDays.w'),
    t('calendar.weekDays.t2'),
    t('calendar.weekDays.f'),
    t('calendar.weekDays.s1'),
    t('calendar.weekDays.s2'),
  ];

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(todayStr);
  };

  // Generate calendar grid for current month
  // Monday as first day of week (ISO standard)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Day of week: 0 (Sun) to 6 (Sat) -> convert to 0 (Mon) to 6 (Sun)
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const selectedDateLog = allLogs[selectedDate] || null;

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Calendar Header Card */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#E6E8F3]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#FF6FAE] text-[#0C1F78]">
              {t('calendar.tag')}
            </span>
            <h2 className="text-lg font-bold text-[#0C1F78] mt-1.5 flex items-center gap-2">
              <span>{monthName}</span>
              <button
                type="button"
                onClick={handleJumpToToday}
                className="text-[10px] font-bold text-[#0C1F78] bg-[#F7F8FC] px-2 py-0.5 rounded-md border border-[#E6E8F3] hover:bg-[#E6E8F3] transition-all cursor-pointer"
              >
                {t('calendar.todayBadge') || 'Today'}
              </button>
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-10 h-10 rounded-xl border border-[#E6E8F3] bg-[#F7F8FC] text-[#0C1F78] flex items-center justify-center hover:bg-[#E6E8F3] active:scale-95 transition-all cursor-pointer"
              aria-label={t('calendar.prevMonthAria')}
            >
              <ChevronLeft className="w-5 h-5 text-[#0C1F78]" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-10 h-10 rounded-xl border border-[#E6E8F3] bg-[#F7F8FC] text-[#0C1F78] flex items-center justify-center hover:bg-[#E6E8F3] active:scale-95 transition-all cursor-pointer"
              aria-label={t('calendar.nextMonthAria')}
            >
              <ChevronRight className="w-5 h-5 text-[#0C1F78]" />
            </button>
          </div>
        </div>

        {/* Day-of-week indicators */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {weekDays.map((d, i) => (
            <span key={i} className="text-xs font-bold text-[#0C1F78]/80 py-1">
              {d}
            </span>
          ))}
        </div>

        {/* Month Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Empty spacer cells before 1st of month */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`spacer-${i}`} className="min-h-[48px] p-1" />
          ))}

          {/* Days of current month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayNum = index + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;

            // 1. Logged period day (flow !== 'none') -> Hot Pink
            const isLoggedPeriod = cycleData.loggedPeriodDates.includes(dateStr);

            // 2. Predicted period day -> Light Pink with Navy text (never white!)
            const isPredictedPeriod = !isLoggedPeriod && cycleData.predictedPeriodDates.includes(dateStr);

            // 3. Fertile window -> Soft outline
            const isFertile = cycleData.fertileDates.includes(dateStr);

            // 4. Symptoms logged -> Small dot
            const logEntry = allLogs[dateStr];
            const hasSymptoms = logEntry && ((logEntry.symptoms && logEntry.symptoms.length > 0) || logEntry.painLevel > 0);

            let bgStyle = 'bg-[#F7F8FC] text-[#0B1713] hover:bg-[#E6E8F3]/60';
            let outlineStyle = '';

            if (isLoggedPeriod) {
              // Primary hot pink #F73F8B
              bgStyle = 'bg-[#F73F8B] text-white font-bold shadow-xs';
            } else if (isPredictedPeriod) {
              // Secondary light pink #FF6FAE with NAVY text, never white!
              bgStyle = 'bg-[#FF6FAE] text-[#0C1F78] font-bold shadow-xs';
            }

            if (isFertile) {
              // Fertile window: soft outline
              outlineStyle = 'ring-2 ring-inset ring-[#FF6FAE] border border-[#FF6FAE]/60';
            }

            if (isSelected) {
              outlineStyle += ' ring-2 ring-[#0C1F78] ring-offset-1';
            }

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => {
                  setSelectedDate(dateStr);
                }}
                className={`relative min-h-[48px] rounded-xl flex flex-col items-center justify-center text-xs transition-all cursor-pointer active:scale-95 ${bgStyle} ${outlineStyle} ${
                  isToday && !isLoggedPeriod && !isPredictedPeriod ? 'border-2 border-[#0C1F78] font-bold text-[#0C1F78]' : ''
                }`}
              >
                <span>{dayNum}</span>

                {/* Status Dot: small dot for symptoms / entries */}
                <div className="h-1.5 flex items-center justify-center gap-0.5 mt-0.5">
                  {hasSymptoms && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isLoggedPeriod ? 'bg-white' : 'bg-[#0C1F78]'
                      }`}
                    />
                  )}
                  {isLoggedPeriod && !hasSymptoms && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-5 pt-4 border-t border-[#E6E8F3] grid grid-cols-2 gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-[#F73F8B] shrink-0 shadow-xs" />
            <span className="text-[#0B1713]">{t('calendar.legendPeriod')}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-[#FF6FAE] border border-[#0C1F78]/20 shrink-0" />
            <span className="text-[#0B1713]">{t('calendar.legendPredicted')}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-white border-2 border-[#FF6FAE] ring-1 ring-[#FF6FAE]/40 shrink-0" />
            <span className="text-[#0B1713]">{t('calendar.legendFertile')}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-[#F7F8FC] border border-[#E6E8F3] flex items-center justify-center shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0C1F78]" />
            </span>
            <span className="text-[#0B1713]">{t('calendar.legendSymptoms')}</span>
          </div>
        </div>
      </section>

      {/* SELECTED DAY INSPECTION & QUICK CHECK-IN ACTION */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#E6E8F3] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0C1F78]">
              {t('calendar.selectedDayTitle', { date: selectedDate })}
            </span>
            <h3 className="text-base font-bold text-[#0C1F78] mt-0.5">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </h3>
          </div>

          {cycleData.fertileDates.includes(selectedDate) && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-[#FF6FAE] text-[#0C1F78]">
              {t('calendar.fertileEstimateBadge')}
            </span>
          )}
        </div>

        {/* Existing check-in details for this day or empty state */}
        {selectedDateLog ? (
          <div className="space-y-2 pt-1">
            <div className="flex flex-wrap gap-2">
              {selectedDateLog.flow !== 'none' && (
                <span className="px-3 py-1 rounded-lg bg-[#F73F8B] text-white text-xs font-bold capitalize">
                  {t(`checkin.flow${selectedDateLog.flow.charAt(0).toUpperCase() + selectedDateLog.flow.slice(1)}`)}
                </span>
              )}
              <span className="px-3 py-1 rounded-lg bg-[#FF6FAE] text-[#0C1F78] text-xs font-bold capitalize">
                {t(`checkin.energy${selectedDateLog.energy.charAt(0).toUpperCase() + selectedDateLog.energy.slice(1)}`)}
              </span>
              <span className="px-3 py-1 rounded-lg bg-[#FF6FAE] text-[#0B1713] text-xs font-bold capitalize">
                {t(`checkin.mood${selectedDateLog.mood.charAt(0).toUpperCase() + selectedDateLog.mood.slice(1)}`)}
              </span>
              <span
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  selectedDateLog.painLevel >= 8
                    ? 'bg-[#960045] text-white'
                    : 'bg-[#F7F8FC] text-[#0C1F78] border border-[#E6E8F3]'
                }`}
              >
                Pain: {selectedDateLog.painLevel}/10
              </span>
              <span className="px-3 py-1 rounded-lg bg-[#F7F8FC] border border-[#E6E8F3] text-[#0C1F78] text-xs font-semibold">
                {selectedDateLog.sleepHours}h sleep
              </span>
            </div>

            {selectedDateLog.symptoms && selectedDateLog.symptoms.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedDateLog.symptoms.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-md bg-[#FF6FAE] text-[#0C1F78] text-[11px] font-bold"
                  >
                    {t(`checkin.symptom${s.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`)}
                  </span>
                ))}
              </div>
            )}

            {selectedDateLog.note && (
              <p className="text-xs text-[#0B1713] italic bg-[#F7F8FC] p-2.5 rounded-xl border border-[#E6E8F3] mt-1">
                "{selectedDateLog.note}"
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#0B1713]/70 pt-1">
            {t('calendar.noEntryOnDay')}
          </p>
        )}

        {/* Action Button: Opens Check-in Modal for this day (including past dates) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsCheckInOpen(true)}
            className="w-full min-h-[48px] rounded-2xl bg-[#F73F8B] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-[#e02f78] active:scale-[0.98] transition-all cursor-pointer"
          >
            {selectedDateLog ? (
              <>
                <Edit3 className="w-4 h-4 text-white" />
                <span>{t('calendar.editDayCTA')}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-white" />
                <span>{t('calendar.logNewDayCTA')}</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Fertile Window Estimate Explainer */}
      <section className="bg-white rounded-3xl p-4 shadow-sm border border-[#E6E8F3] flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#0C1F78] shrink-0 mt-0.5" />
        <div className="text-xs text-[#0B1713] leading-relaxed">
          <div className="flex items-center gap-1.5 mb-0.5">
            <strong className="text-[#0C1F78]">
              {t('calendar.fertileWindowBanner', {
                date: cycleData.predictedOvulationDate,
              })}
            </strong>
          </div>
          <span>{t('cycle.fertileEstimateNotice')}</span>
        </div>
      </section>

      {/* Check-in Modal targeting the selected day */}
      <DailyCheckInScreen
        isOpen={isCheckInOpen}
        initialDate={selectedDate}
        onClose={() => setIsCheckInOpen(false)}
        onSaved={() => {
          loadData();
        }}
      />
    </div>
  );
};
