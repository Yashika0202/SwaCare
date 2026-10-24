import { DailyCheckIn, UserProfile } from '../types';

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface CycleCalculationResult {
  currentCycleDay: number;
  cycleLength: number;
  periodLength: number;
  currentPhase: CyclePhase;
  daysUntilNextPeriod: number;
  isLate: boolean;
  lastPeriodStartDate: string;
  nextPredictedPeriodStartDate: string;
  predictedOvulationDate: string;
  fertileWindowStartDate: string;
  fertileWindowEndDate: string;
  predictedPeriodDates: string[]; // Set of predicted start + period duration dates
  fertileDates: string[];
  loggedPeriodDates: string[];
  cycleStartDates: string[];
  historicalCycleLengths: number[];
  isEstimatedFromOnboarding: boolean;
}

/**
 * Format Date helper (local YYYY-MM-DD avoiding UTC offset drift)
 */
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function diffDays(dateStrA: string, dateStrB: string): number {
  const a = parseDate(dateStrA);
  const b = parseDate(dateStrB);
  const diffTime = a.getTime() - b.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate cycle state, predictions, and fertile window
 */
export function calculateCycleData(
  dailyLogs: Record<string, DailyCheckIn>,
  userProfile: UserProfile | null,
  referenceDateStr?: string
): CycleCalculationResult {
  const todayStr = referenceDateStr || formatDate(new Date());

  // 1. Gather all logged dates with flow !== 'none'
  const flowDates = Object.entries(dailyLogs)
    .filter(([_, log]) => log.flow && log.flow !== 'none')
    .map(([date]) => date)
    .sort();

  // If user profile has lastPeriodStartDate, include it as reference
  const profileStartDate = userProfile?.lastPeriodStartDate || formatDate(new Date());
  const defaultCycleLen = userProfile?.averageCycleLength || 28;
  const defaultPeriodLen = userProfile?.averagePeriodLength || 5;

  // 2. Identify cycle start dates:
  // "When a user logs flow other than 'none' after a gap of 10+ days, start a new cycle;
  // calculate cycle length from consecutive start dates."
  const allCandidates = Array.from(new Set([...flowDates, profileStartDate])).sort();

  const cycleStartDates: string[] = [];
  let lastPeriodDay: string | null = null;

  for (const date of allCandidates) {
    if (!lastPeriodDay) {
      cycleStartDates.push(date);
      lastPeriodDay = date;
    } else {
      const gap = diffDays(date, lastPeriodDay);
      if (gap >= 10) {
        cycleStartDates.push(date);
        lastPeriodDay = date;
      } else {
        // Belong to the same period cluster, update last seen bleeding day
        lastPeriodDay = date;
      }
    }
  }

  // 3. Calculate consecutive cycle lengths from consecutive start dates
  const historicalCycleLengths: number[] = [];
  for (let i = 0; i < cycleStartDates.length - 1; i++) {
    const len = diffDays(cycleStartDates[i + 1], cycleStartDates[i]);
    if (len >= 15 && len <= 60) {
      historicalCycleLengths.push(len);
    }
  }

  // 4. "Predict the next period start using the average of the last 3-6 cycles;
  // if fewer than 3 cycles exist, use the average cycle length from onboarding."
  let cycleLength = defaultCycleLen;
  let isEstimatedFromOnboarding = true;

  if (historicalCycleLengths.length >= 3) {
    const recentLengths = historicalCycleLengths.slice(-6);
    const sum = recentLengths.reduce((acc, l) => acc + l, 0);
    cycleLength = Math.round(sum / recentLengths.length);
    isEstimatedFromOnboarding = false;
  }

  // Most recent cycle start date (<= today, or latest known start)
  const pastStarts = cycleStartDates.filter((d) => diffDays(d, todayStr) <= 0);
  const currentCycleStart = pastStarts.length > 0
    ? pastStarts[pastStarts.length - 1]
    : cycleStartDates[cycleStartDates.length - 1] || profileStartDate;

  // Next predicted period start
  const nextPredictedPeriodStartDate = addDays(currentCycleStart, cycleLength);

  // 5. "Estimate the fertile window (approx. 5 days before to 1 day after predicted ovulation, ovulation = 14 days before next period)."
  const predictedOvulationDate = addDays(nextPredictedPeriodStartDate, -14);
  const fertileWindowStartDate = addDays(predictedOvulationDate, -5);
  const fertileWindowEndDate = addDays(predictedOvulationDate, 1);

  // Generate lists of dates for fast calendar lookups
  const fertileDates: string[] = [];
  let curFertile = fertileWindowStartDate;
  while (diffDays(fertileWindowEndDate, curFertile) >= 0) {
    fertileDates.push(curFertile);
    curFertile = addDays(curFertile, 1);
  }

  // Predicted period days (length of defaultPeriodLen starting from nextPredictedPeriodStartDate)
  const predictedPeriodDates: string[] = [];
  for (let i = 0; i < defaultPeriodLen; i++) {
    predictedPeriodDates.push(addDays(nextPredictedPeriodStartDate, i));
  }

  // Current Cycle Day
  const diffFromStart = diffDays(todayStr, currentCycleStart);
  const currentCycleDay = Math.max(1, diffFromStart + 1);

  // Days until next period
  const rawDaysUntil = diffDays(nextPredictedPeriodStartDate, todayStr);
  const isLate = rawDaysUntil < 0;
  const daysUntilNextPeriod = rawDaysUntil;

  // 6. Current Phase determination:
  // - Menstrual: days 1 to defaultPeriodLen (or flow logged today)
  // - Follicular: after period until fertile window
  // - Ovulation: inside fertile window surrounding ovulation
  // - Luteal: after ovulation until next cycle
  let currentPhase: CyclePhase = 'follicular';

  const todayHasFlow = dailyLogs[todayStr]?.flow && dailyLogs[todayStr].flow !== 'none';

  if (todayHasFlow || currentCycleDay <= defaultPeriodLen) {
    currentPhase = 'menstrual';
  } else if (fertileDates.includes(todayStr)) {
    currentPhase = 'ovulation';
  } else if (diffDays(todayStr, predictedOvulationDate) > 1) {
    currentPhase = 'luteal';
  } else {
    currentPhase = 'follicular';
  }

  return {
    currentCycleDay,
    cycleLength,
    periodLength: defaultPeriodLen,
    currentPhase,
    daysUntilNextPeriod,
    isLate,
    lastPeriodStartDate: currentCycleStart,
    nextPredictedPeriodStartDate,
    predictedOvulationDate,
    fertileWindowStartDate,
    fertileWindowEndDate,
    predictedPeriodDates,
    fertileDates,
    loggedPeriodDates: flowDates,
    cycleStartDates,
    historicalCycleLengths,
    isEstimatedFromOnboarding,
  };
}
