import { DailyCheckIn, UserProfile, HealthPatternFlag } from '../types';
import { calculateCycleData, diffDays, formatDate, addDays } from './cycleCalculator';

export interface ScreeningResult {
  flags: HealthPatternFlag[];
  hasCriticalFlags: boolean;
  totalFlagsCount: number;
}

/**
 * Rule-based Health Pattern Screening Engine
 * Note: Never diagnoses; only flags observable patterns to discuss with a healthcare professional.
 */
export function runHealthPatternScreening(
  dailyLogs: Record<string, DailyCheckIn>,
  userProfile: UserProfile | null,
  referenceDateStr?: string
): ScreeningResult {
  const todayStr = referenceDateStr || formatDate(new Date());
  const cycleInfo = calculateCycleData(dailyLogs, userProfile, todayStr);
  const flags: HealthPatternFlag[] = [];

  const logEntries = Object.entries(dailyLogs).sort(([a], [b]) => a.localeCompare(b));
  const cycleStarts = cycleInfo.cycleStartDates;

  // Build list of completed cycle lengths
  const completedCycleLengths: { start: string; end: string; length: number; heavyDays: number; pain7Plus: boolean }[] = [];

  for (let i = 0; i < cycleStarts.length; i++) {
    const start = cycleStarts[i];
    const nextStart = cycleStarts[i + 1];
    if (nextStart) {
      const length = diffDays(nextStart, start);
      const end = addDays(nextStart, -1);

      // Check heavy flow and pain >= 7 in this cycle
      const cycleLogs = logEntries.filter(([d]) => diffDays(d, start) >= 0 && diffDays(end, d) >= 0);
      const heavyDays = cycleLogs.filter(([_, l]) => l.flow === 'heavy').length;
      const pain7Plus = cycleLogs.some(([_, l]) => l.painLevel >= 7);

      completedCycleLengths.push({ start, end, length, heavyDays, pain7Plus });
    }
  }

  // FLAG 1: Cycle shorter than 21 or longer than 35 days, repeated in 2+ recent cycles
  if (completedCycleLengths.length >= 2) {
    const lastTwo = completedCycleLengths.slice(-2);
    const bothShort = lastTwo.every((c) => c.length < 21);
    const bothLong = lastTwo.every((c) => c.length > 35);

    if (bothShort || bothLong) {
      const type = bothShort ? 'short' : 'long';
      flags.push({
        id: 'abnormal-cycle-length',
        severity: 'see_doctor',
        titleKey: 'screening.flagAbnormalCycleTitle',
        whatWeNoticedKey: bothShort
          ? 'screening.flagCycleShortNoticed'
          : 'screening.flagCycleLongNoticed',
        whatWeNoticedParams: {
          c1: lastTwo[0].length,
          c2: lastTwo[1].length,
        },
        timeframeKey: 'screening.flagCycleTimeframe',
        timeframeParams: {
          start: lastTwo[0].start,
          end: lastTwo[1].end,
        },
        nextStepKey: 'screening.flagAbnormalCycleNextStep',
      });
    }
  }

  // FLAG 2: No period for 90+ days (Amenorrhea pattern)
  const lastBleedDate = cycleInfo.loggedPeriodDates.length > 0
    ? cycleInfo.loggedPeriodDates[cycleInfo.loggedPeriodDates.length - 1]
    : userProfile?.lastPeriodStartDate;

  if (lastBleedDate) {
    const daysSinceBleed = diffDays(todayStr, lastBleedDate);
    if (daysSinceBleed >= 90) {
      flags.push({
        id: 'prolonged-amenorrhea',
        severity: 'see_doctor',
        titleKey: 'screening.flagNoPeriodTitle',
        whatWeNoticedKey: 'screening.flagNoPeriodNoticed',
        whatWeNoticedParams: { days: daysSinceBleed },
        timeframeKey: 'screening.flagNoPeriodTimeframe',
        timeframeParams: { lastDate: lastBleedDate, days: daysSinceBleed },
        nextStepKey: 'screening.flagNoPeriodNextStep',
      });
    }
  }

  // FLAG 3: Heavy flow lasting more than 7 days
  let maxHeavyStreak = 0;
  let currentHeavyStreak = 0;
  let heavyStreakStart = '';
  let heavyStreakEnd = '';

  // Sort daily logs chronologically
  logEntries.forEach(([d, log]) => {
    if (log.flow === 'heavy') {
      currentHeavyStreak++;
      if (currentHeavyStreak === 1) heavyStreakStart = d;
      if (currentHeavyStreak > maxHeavyStreak) {
        maxHeavyStreak = currentHeavyStreak;
        heavyStreakEnd = d;
      }
    } else {
      currentHeavyStreak = 0;
    }
  });

  // Also check if any completed cycle had total heavy days > 7
  const cycleWithExcessHeavy = completedCycleLengths.find((c) => c.heavyDays > 7);

  if (maxHeavyStreak > 7 || cycleWithExcessHeavy) {
    const heavyDaysCount = Math.max(maxHeavyStreak, cycleWithExcessHeavy ? cycleWithExcessHeavy.heavyDays : 8);
    flags.push({
      id: 'prolonged-heavy-flow',
      severity: 'see_doctor',
      titleKey: 'screening.flagHeavyFlowTitle',
      whatWeNoticedKey: 'screening.flagHeavyFlowNoticed',
      whatWeNoticedParams: { days: heavyDaysCount },
      timeframeKey: 'screening.flagHeavyFlowTimeframe',
      timeframeParams: {
        start: heavyStreakStart || (cycleWithExcessHeavy ? cycleWithExcessHeavy.start : todayStr),
        days: heavyDaysCount,
      },
      nextStepKey: 'screening.flagHeavyFlowNextStep',
    });
  }

  // FLAG 4: Pain 7+ affecting several cycles in a row
  if (completedCycleLengths.length >= 3) {
    const lastThree = completedCycleLengths.slice(-3);
    const allThreeHadSeverePain = lastThree.every((c) => c.pain7Plus);

    if (allThreeHadSeverePain) {
      flags.push({
        id: 'recurring-severe-pain',
        severity: 'see_doctor',
        titleKey: 'screening.flagSeverePainTitle',
        whatWeNoticedKey: 'screening.flagSeverePainNoticed',
        whatWeNoticedParams: { count: lastThree.length },
        timeframeKey: 'screening.flagSeverePainTimeframe',
        timeframeParams: {
          start: lastThree[0].start,
          end: lastThree[lastThree.length - 1].end,
        },
        nextStepKey: 'screening.flagSeverePainNextStep',
      });
    }
  } else {
    // If fewer than 3 completed cycles, check if user logged pain >= 7 in 3 or more distinct entries
    const severePainEntries = logEntries.filter(([_, l]) => l.painLevel >= 7);
    if (severePainEntries.length >= 3) {
      flags.push({
        id: 'recurring-severe-pain-entries',
        severity: 'see_doctor',
        titleKey: 'screening.flagSeverePainTitle',
        whatWeNoticedKey: 'screening.flagSeverePainNoticed',
        whatWeNoticedParams: { count: severePainEntries.length },
        timeframeKey: 'screening.flagSeverePainTimeframe',
        timeframeParams: {
          start: severePainEntries[0][0],
          end: severePainEntries[severePainEntries.length - 1][0],
        },
        nextStepKey: 'screening.flagSeverePainNextStep',
      });
    }
  }

  // FLAG 5: Irregular cycles together with frequent acne, excess hair or weight change
  // (pattern sometimes seen with hormonal conditions like PCOS, worth discussing with a doctor)
  const isCycleIrregular =
    (completedCycleLengths.length >= 2 &&
      (completedCycleLengths.some((c) => c.length > 35 || c.length < 21) ||
        Math.max(...completedCycleLengths.map((c) => c.length)) -
          Math.min(...completedCycleLengths.map((c) => c.length)) > 7)) ||
    (userProfile && (userProfile.averageCycleLength > 35 || userProfile.averageCycleLength < 21));

  let hasAcneReports = 0;
  let hasExcessHairReports = 0;
  let hasWeightGainReports = 0;
  let hasDarkSkinReports = 0;

  logEntries.forEach(([_, l]) => {
    if (l.symptoms && l.symptoms.includes('acne')) hasAcneReports++;
    if (l.excessHair) hasExcessHairReports++;
    if (l.weightChange === 'gained') hasWeightGainReports++;
    if (l.darkSkinPatches) hasDarkSkinReports++;
  });

  const hasHormonalPhysicalSigns =
    hasAcneReports >= 2 ||
    hasExcessHairReports >= 1 ||
    hasWeightGainReports >= 1 ||
    hasDarkSkinReports >= 1;

  if (isCycleIrregular && hasHormonalPhysicalSigns) {
    flags.push({
      id: 'pcos-hormonal-cluster',
      severity: 'see_doctor',
      titleKey: 'screening.flagPcosClusterTitle',
      whatWeNoticedKey: 'screening.flagPcosClusterNoticed',
      timeframeKey: 'screening.flagPcosClusterTimeframe',
      nextStepKey: 'screening.flagPcosClusterNextStep',
    });
  }

  // FLAG 6: Very low energy or fatigue with heavy flow (worth checking iron levels)
  const fatigueWithHeavyCount = logEntries.filter(([_, l]) => {
    const isHeavy = l.flow === 'heavy';
    const isFatigued = l.energy === 'low' || (l.symptoms && l.symptoms.includes('fatigue'));
    return isHeavy && isFatigued;
  }).length;

  if (fatigueWithHeavyCount >= 2) {
    flags.push({
      id: 'iron-fatigue-heavy-flow',
      severity: 'attention',
      titleKey: 'screening.flagIronLevelsTitle',
      whatWeNoticedKey: 'screening.flagIronLevelsNoticed',
      whatWeNoticedParams: { count: fatigueWithHeavyCount },
      timeframeKey: 'screening.flagIronLevelsTimeframe',
      nextStepKey: 'screening.flagIronLevelsNextStep',
    });
  }

  return {
    flags,
    hasCriticalFlags: flags.some((f) => f.severity === 'see_doctor'),
    totalFlagsCount: flags.length,
  };
}
