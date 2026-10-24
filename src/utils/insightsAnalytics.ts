import { DailyCheckIn, UserProfile } from '../types';
import { calculateCycleData, diffDays, formatDate, addDays } from './cycleCalculator';

export interface CycleHistoryItem {
  cycleName: string;
  cycleNumber: number;
  startDate: string;
  endDate: string;
  length: number;
  periodDuration: number;
  heavyFlowDays: number;
  averagePain: number;
  maxPain: number;
}

export interface PhasePatternItem {
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  phaseNameKey: string;
  avgSleepHours: number;
  avgEnergyScore: number; // 1: Low, 2: Medium, 3: High
  dominantMood: string;
  dominantMoodEmoji: string;
  entryCount: number;
}

export interface PainByDayItem {
  cycleDay: number;
  averagePain: number;
  maxPain: number;
  entriesCount: number;
}

export interface SymptomFrequencyItem {
  symptomKey: string;
  count: number;
  percentage: number;
}

export interface AwarenessNotice {
  isTriggered: boolean;
  triggers: string[];
}

export interface GeneratedInsightCard {
  id: string;
  type: 'cycle' | 'pain' | 'energy' | 'sleep';
  titleKey: string;
  textKey: string;
  params?: Record<string, string | number>;
  accentColor: string;
}

export interface InsightsData {
  hasSufficientData: boolean;
  isSampleData: boolean;
  cycles: CycleHistoryItem[];
  averageCycleLength: number;
  averagePeriodDuration: number;
  painByDay: PainByDayItem[];
  phasePatterns: PhasePatternItem[];
  topSymptoms: SymptomFrequencyItem[];
  insightCards: GeneratedInsightCard[];
  awarenessNotice: AwarenessNotice;
}

/**
 * Generate synthetic baseline demo data for preview / evaluator testing
 */
export function getSampleInsightsData(): InsightsData {
  const sampleCycles: CycleHistoryItem[] = [
    {
      cycleName: 'Cycle 1',
      cycleNumber: 1,
      startDate: '2026-05-12',
      endDate: '2026-06-08',
      length: 28,
      periodDuration: 5,
      heavyFlowDays: 1,
      averagePain: 3.2,
      maxPain: 6,
    },
    {
      cycleName: 'Cycle 2',
      cycleNumber: 2,
      startDate: '2026-06-09',
      endDate: '2026-07-06',
      length: 28,
      periodDuration: 5,
      heavyFlowDays: 2,
      averagePain: 3.8,
      maxPain: 7,
    },
    {
      cycleName: 'Cycle 3',
      cycleNumber: 3,
      startDate: '2026-07-07',
      endDate: '2026-08-05',
      length: 30,
      periodDuration: 6,
      heavyFlowDays: 2,
      averagePain: 4.5,
      maxPain: 7,
    },
    {
      cycleName: 'Cycle 4',
      cycleNumber: 4,
      startDate: '2026-08-06',
      endDate: '2026-09-01',
      length: 27,
      periodDuration: 4,
      heavyFlowDays: 1,
      averagePain: 3.0,
      maxPain: 5,
    },
    {
      cycleName: 'Cycle 5',
      cycleNumber: 5,
      startDate: '2026-09-02',
      endDate: '2026-09-29',
      length: 28,
      periodDuration: 5,
      heavyFlowDays: 2,
      averagePain: 4.2,
      maxPain: 8,
    },
    {
      cycleName: 'Cycle 6',
      cycleNumber: 6,
      startDate: '2026-09-30',
      endDate: '2026-10-27',
      length: 28,
      periodDuration: 5,
      heavyFlowDays: 2,
      averagePain: 4.6,
      maxPain: 8,
    },
  ];

  const avgCycle = Math.round(
    sampleCycles.reduce((acc, c) => acc + c.length, 0) / sampleCycles.length
  );
  const avgPeriod = +(
    sampleCycles.reduce((acc, c) => acc + c.periodDuration, 0) / sampleCycles.length
  ).toFixed(1);

  // Pain by cycle day (Days 1 to 28)
  const painByDay: PainByDayItem[] = [];
  for (let day = 1; day <= 28; day++) {
    let avgPain = 0.5;
    if (day === 1) avgPain = 7.8;
    else if (day === 2) avgPain = 6.4;
    else if (day === 3) avgPain = 4.1;
    else if (day === 4) avgPain = 2.5;
    else if (day === 14) avgPain = 2.8; // mild ovulation cramping
    else if (day >= 25) avgPain = 2.2; // PMS pre-menstrual twinges
    painByDay.push({
      cycleDay: day,
      averagePain: avgPain,
      maxPain: day === 1 ? 9 : day === 2 ? 8 : Math.ceil(avgPain + 1),
      entriesCount: 6,
    });
  }

  const phasePatterns: PhasePatternItem[] = [
    {
      phase: 'menstrual',
      phaseNameKey: 'cycle.phases.menstrual',
      avgSleepHours: 8.4,
      avgEnergyScore: 1.4, // low-medium
      dominantMood: 'checkin.moodCalm',
      dominantMoodEmoji: '😌',
      entryCount: 30,
    },
    {
      phase: 'follicular',
      phaseNameKey: 'cycle.phases.follicular',
      avgSleepHours: 7.4,
      avgEnergyScore: 2.8, // high
      dominantMood: 'checkin.moodGreat',
      dominantMoodEmoji: '😊',
      entryCount: 42,
    },
    {
      phase: 'ovulation',
      phaseNameKey: 'cycle.phases.ovulation',
      avgSleepHours: 7.2,
      avgEnergyScore: 2.9, // highest
      dominantMood: 'checkin.moodGreat',
      dominantMoodEmoji: '✨',
      entryCount: 18,
    },
    {
      phase: 'luteal',
      phaseNameKey: 'cycle.phases.luteal',
      avgSleepHours: 7.8,
      avgEnergyScore: 1.5, // low
      dominantMood: 'checkin.moodNeutral',
      dominantMoodEmoji: '😐',
      entryCount: 48,
    },
  ];

  const topSymptoms: SymptomFrequencyItem[] = [
    { symptomKey: 'cramps', count: 24, percentage: 78 },
    { symptomKey: 'fatigue', count: 19, percentage: 62 },
    { symptomKey: 'bloating', count: 16, percentage: 52 },
    { symptomKey: 'headache', count: 12, percentage: 39 },
    { symptomKey: 'back_pain', count: 10, percentage: 32 },
    { symptomKey: 'breast_tenderness', count: 8, percentage: 26 },
  ];

  const insightCards: GeneratedInsightCard[] = [
    {
      id: 'cycle-1',
      type: 'cycle',
      titleKey: 'insights.charts.chart1Title',
      textKey: 'insights.cards.cycleLengthRegular',
      params: { avg: avgCycle, diff: 2 },
      accentColor: '#F73F8B',
    },
    {
      id: 'pain-1',
      type: 'pain',
      titleKey: 'insights.charts.chart3Title',
      textKey: 'insights.cards.painTrendPeak',
      params: { day: 1, ease: 3 },
      accentColor: '#960045',
    },
    {
      id: 'energy-1',
      type: 'energy',
      titleKey: 'insights.cards.sectionTitle',
      textKey: 'insights.cards.energyLutealLow',
      params: {},
      accentColor: '#0C1F78',
    },
    {
      id: 'sleep-1',
      type: 'sleep',
      titleKey: 'insights.charts.chart4Title',
      textKey: 'insights.cards.sleepMenstrualHigh',
      params: { hours: '8.4' },
      accentColor: '#FF6FAE',
    },
    {
      id: 'pms-mood-1',
      type: 'pain',
      titleKey: 'insights.cards.pmsMoodTitle',
      textKey: 'insights.cards.pmsMoodDip',
      params: { days: '3-4' },
      accentColor: '#F73F8B',
    },
  ];

  const awarenessNotice: AwarenessNotice = {
    isTriggered: false,
    triggers: [],
  };

  return {
    hasSufficientData: true,
    isSampleData: true,
    cycles: sampleCycles,
    averageCycleLength: avgCycle,
    averagePeriodDuration: avgPeriod,
    painByDay,
    phasePatterns,
    topSymptoms,
    insightCards,
    awarenessNotice,
  };
}

/**
 * Compute real insights analytics from actual localStorage logs & profile
 */
export function computeInsightsAnalytics(
  dailyLogs: Record<string, DailyCheckIn>,
  userProfile: UserProfile | null
): InsightsData {
  const loggedDates = Object.keys(dailyLogs).sort();
  const cycleInfo = calculateCycleData(dailyLogs, userProfile);

  // If user has fewer than 3 logged entries total, mark as insufficient data
  if (loggedDates.length < 3) {
    return {
      hasSufficientData: false,
      isSampleData: false,
      cycles: [],
      averageCycleLength: cycleInfo.cycleLength,
      averagePeriodDuration: cycleInfo.periodLength,
      painByDay: [],
      phasePatterns: [],
      topSymptoms: [],
      insightCards: [],
      awarenessNotice: { isTriggered: false, triggers: [] },
    };
  }

  // Build cycle intervals from cycleStartDates
  const cycleStarts = cycleInfo.cycleStartDates;
  const cycles: CycleHistoryItem[] = [];

  for (let i = 0; i < cycleStarts.length; i++) {
    const start = cycleStarts[i];
    const end = cycleStarts[i + 1] ? addDays(cycleStarts[i + 1], -1) : addDays(start, cycleInfo.cycleLength);
    const len = cycleStarts[i + 1] ? diffDays(cycleStarts[i + 1], start) : cycleInfo.cycleLength;

    // Collect logs within this cycle range
    const logsInCycle = Object.entries(dailyLogs).filter(([date]) => {
      return diffDays(date, start) >= 0 && diffDays(end, date) >= 0;
    });

    const periodDays = logsInCycle.filter(([_, l]) => l.flow && l.flow !== 'none').length;
    const heavyDays = logsInCycle.filter(([_, l]) => l.flow === 'heavy').length;
    const pains = logsInCycle.map(([_, l]) => l.painLevel);
    const avgPain = pains.length > 0 ? +(pains.reduce((a, b) => a + b, 0) / pains.length).toFixed(1) : 0;
    const maxPain = pains.length > 0 ? Math.max(...pains) : 0;

    cycles.push({
      cycleName: `Cycle ${i + 1}`,
      cycleNumber: i + 1,
      startDate: start,
      endDate: end,
      length: len,
      periodDuration: Math.max(periodDays, userProfile?.averagePeriodLength || 5),
      heavyFlowDays: heavyDays,
      averagePain: avgPain,
      maxPain: maxPain,
    });
  }

  // Keep up to last 6 cycles
  const recentCycles = cycles.slice(-6);

  const avgCycleLength = recentCycles.length > 0
    ? Math.round(recentCycles.reduce((a, c) => a + c.length, 0) / recentCycles.length)
    : cycleInfo.cycleLength;

  const avgPeriodDuration = recentCycles.length > 0
    ? +(recentCycles.reduce((a, c) => a + c.periodDuration, 0) / recentCycles.length).toFixed(1)
    : cycleInfo.periodLength;

  // Pain by cycle day (1 to 30)
  const painByDayMap: Record<number, { sum: number; count: number; max: number }> = {};
  for (let d = 1; d <= 28; d++) {
    painByDayMap[d] = { sum: 0, count: 0, max: 0 };
  }

  // Correlate logs to cycle day
  Object.entries(dailyLogs).forEach(([dateStr, log]) => {
    // Find closest preceding cycle start
    const pastStarts = cycleStarts.filter((s) => diffDays(s, dateStr) <= 0);
    if (pastStarts.length > 0) {
      const activeStart = pastStarts[pastStarts.length - 1];
      const cycleDay = diffDays(dateStr, activeStart) + 1;
      if (cycleDay >= 1 && cycleDay <= 35) {
        if (!painByDayMap[cycleDay]) {
          painByDayMap[cycleDay] = { sum: 0, count: 0, max: 0 };
        }
        painByDayMap[cycleDay].sum += log.painLevel;
        painByDayMap[cycleDay].count += 1;
        painByDayMap[cycleDay].max = Math.max(painByDayMap[cycleDay].max, log.painLevel);
      }
    }
  });

  const painByDay: PainByDayItem[] = Object.entries(painByDayMap)
    .map(([dayStr, data]) => ({
      cycleDay: Number(dayStr),
      averagePain: data.count > 0 ? +(data.sum / data.count).toFixed(1) : 0,
      maxPain: data.max,
      entriesCount: data.count,
    }))
    .sort((a, b) => a.cycleDay - b.cycleDay)
    .slice(0, 28);

  // Symptoms frequency
  const symptomTotals: Record<string, number> = {};
  let totalEntries = 0;

  Object.values(dailyLogs).forEach((log) => {
    totalEntries++;
    (log.symptoms || []).forEach((sym) => {
      symptomTotals[sym] = (symptomTotals[sym] || 0) + 1;
    });
  });

  const topSymptoms: SymptomFrequencyItem[] = Object.entries(symptomTotals)
    .map(([symptomKey, count]) => ({
      symptomKey,
      count,
      percentage: totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Phase patterns
  const energyScores: Record<string, number> = { low: 1, medium: 2, high: 3 };
  const phaseDataMap: Record<
    'menstrual' | 'follicular' | 'ovulation' | 'luteal',
    { sleepSum: number; energySum: number; count: number; moods: Record<string, number> }
  > = {
    menstrual: { sleepSum: 0, energySum: 0, count: 0, moods: {} },
    follicular: { sleepSum: 0, energySum: 0, count: 0, moods: {} },
    ovulation: { sleepSum: 0, energySum: 0, count: 0, moods: {} },
    luteal: { sleepSum: 0, energySum: 0, count: 0, moods: {} },
  };

  Object.entries(dailyLogs).forEach(([dateStr, log]) => {
    // Check phase for dateStr
    const tempCalc = calculateCycleData(dailyLogs, userProfile, dateStr);
    const ph = tempCalc.currentPhase;
    const bucket = phaseDataMap[ph];
    bucket.sleepSum += log.sleepHours;
    bucket.energySum += energyScores[log.energy] || 2;
    bucket.count += 1;
    bucket.moods[log.mood] = (bucket.moods[log.mood] || 0) + 1;
  });

  const moodEmojis: Record<string, string> = {
    great: '😊',
    calm: '😌',
    neutral: '😐',
    sad: '😔',
    stressed: '😣',
  };

  const phasePatterns: PhasePatternItem[] = (
    ['menstrual', 'follicular', 'ovulation', 'luteal'] as const
  ).map((ph) => {
    const bucket = phaseDataMap[ph];
    const avgSleep = bucket.count > 0 ? +(bucket.sleepSum / bucket.count).toFixed(1) : 7.5;
    const avgEnergy = bucket.count > 0 ? +(bucket.energySum / bucket.count).toFixed(1) : 2.0;

    let dominantMood = 'calm';
    let maxMoodCount = 0;
    Object.entries(bucket.moods).forEach(([m, c]) => {
      if (c > maxMoodCount) {
        maxMoodCount = c;
        dominantMood = m;
      }
    });

    return {
      phase: ph,
      phaseNameKey: `cycle.phases.${ph}`,
      avgSleepHours: avgSleep,
      avgEnergyScore: avgEnergy,
      dominantMood: `checkin.mood${dominantMood.charAt(0).toUpperCase() + dominantMood.slice(1)}`,
      dominantMoodEmoji: moodEmojis[dominantMood] || '😌',
      entryCount: bucket.count,
    };
  });

  // Dynamic Rule-based Awareness Card (no diagnosis, no AI claims):
  // "if cycles are consistently shorter than 21 or longer than 35 days,
  // cycle length varies by more than 7 days,
  // pain is 8+ for 3 or more cycles,
  // or heavy flow lasts more than 7 days, show a crimson card:
  // 'This pattern is worth discussing with a doctor.'"
  const triggers: string[] = [];

  if (recentCycles.length >= 2) {
    const allShort = recentCycles.every((c) => c.length < 21);
    const allLong = recentCycles.every((c) => c.length > 35);
    const lengths = recentCycles.map((c) => c.length);
    const maxLen = Math.max(...lengths);
    const minLen = Math.min(...lengths);

    if (allShort) triggers.push('insights.awareness.triggerShortCycles');
    if (allLong) triggers.push('insights.awareness.triggerLongCycles');
    if (maxLen - minLen > 7) triggers.push('insights.awareness.triggerHighVariance');
  }

  // Severe pain 8+ in 3 or more cycles or entries
  const severePainCount = Object.values(dailyLogs).filter((l) => l.painLevel >= 8).length;
  if (severePainCount >= 3) {
    triggers.push('insights.awareness.triggerSeverePain');
  }

  // Heavy flow >= 7 days in any cycle or consecutive
  const hasProlongedHeavyFlow = recentCycles.some((c) => c.heavyFlowDays >= 7);
  if (hasProlongedHeavyFlow) {
    triggers.push('insights.awareness.triggerHeavyFlow');
  }

  const awarenessNotice: AwarenessNotice = {
    isTriggered: triggers.length > 0,
    triggers,
  };

  // Generate plain-language insight cards from data
  const insightCards: GeneratedInsightCard[] = [];

  // Card 1: Cycle variance
  if (recentCycles.length >= 2) {
    const lastCycle = recentCycles[recentCycles.length - 1];
    const diff = lastCycle.length - avgCycleLength;
    if (Math.abs(diff) <= 2) {
      insightCards.push({
        id: 'cycle-regular',
        type: 'cycle',
        titleKey: 'insights.charts.chart1Title',
        textKey: 'insights.cards.cycleLengthRegular',
        params: { avg: avgCycleLength, diff: Math.abs(diff) },
        accentColor: '#F73F8B',
      });
    } else if (diff > 0) {
      insightCards.push({
        id: 'cycle-longer',
        type: 'cycle',
        titleKey: 'insights.charts.chart1Title',
        textKey: 'insights.cards.cycleLengthLonger',
        params: { last: lastCycle.length, diff, avg: avgCycleLength },
        accentColor: '#F73F8B',
      });
    } else {
      insightCards.push({
        id: 'cycle-shorter',
        type: 'cycle',
        titleKey: 'insights.charts.chart1Title',
        textKey: 'insights.cards.cycleLengthShorter',
        params: { last: lastCycle.length, diff: Math.abs(diff), avg: avgCycleLength },
        accentColor: '#F73F8B',
      });
    }
  }

  // Card 2: Pain trend
  const day1Pain = painByDayMap[1]?.count > 0 ? +(painByDayMap[1].sum / painByDayMap[1].count).toFixed(1) : 0;
  if (day1Pain >= 4) {
    insightCards.push({
      id: 'pain-peak',
      type: 'pain',
      titleKey: 'insights.charts.chart3Title',
      textKey: 'insights.cards.painTrendPeak',
      params: { day: 1, ease: 3 },
      accentColor: '#960045',
    });
  }

  // Card 3: Energy pattern
  const lutealPattern = phasePatterns.find((p) => p.phase === 'luteal');
  if (lutealPattern && lutealPattern.avgEnergyScore < 2.0) {
    insightCards.push({
      id: 'energy-luteal',
      type: 'energy',
      titleKey: 'insights.cards.sectionTitle',
      textKey: 'insights.cards.energyLutealLow',
      params: {},
      accentColor: '#0C1F78',
    });
  }

  // Card 4: Sleep pattern
  const menstrualPattern = phasePatterns.find((p) => p.phase === 'menstrual');
  if (menstrualPattern && menstrualPattern.avgSleepHours > 0) {
    insightCards.push({
      id: 'sleep-menstrual',
      type: 'sleep',
      titleKey: 'insights.charts.chart4Title',
      textKey: 'insights.cards.sleepMenstrualHigh',
      params: { hours: String(menstrualPattern.avgSleepHours) },
      accentColor: '#FF6FAE',
    });
  }

  // Card 5: PMS & Mood Tracking Correlation (3-4 days before period)
  let premenstrualDipCount = 0;
  Object.entries(dailyLogs).forEach(([dateStr, log]) => {
    const cycleInfo = calculateCycleData(dailyLogs, userProfile, dateStr);
    const daysUntil = cycleInfo.daysUntilNextPeriod;
    const isLateLuteal = daysUntil >= 0 && daysUntil <= 5;
    const hasPmsMood =
      log.mood === 'sad' ||
      log.mood === 'stressed' ||
      (log.symptoms &&
        log.symptoms.some((s) =>
          ['irritability', 'anxiety', 'low_mood', 'mood_swings'].includes(s)
        ));
    if (isLateLuteal && hasPmsMood) {
      premenstrualDipCount++;
    }
  });

  if (premenstrualDipCount >= 1) {
    insightCards.push({
      id: 'pms-mood-dip',
      type: 'pain',
      titleKey: 'insights.cards.pmsMoodTitle',
      textKey: 'insights.cards.pmsMoodDip',
      params: { days: '3-4' },
      accentColor: '#F73F8B',
    });
  }

  return {
    hasSufficientData: true,
    isSampleData: false,
    cycles: recentCycles,
    averageCycleLength: avgCycleLength,
    averagePeriodDuration: avgPeriodDuration,
    painByDay,
    phasePatterns,
    topSymptoms,
    insightCards,
    awarenessNotice,
  };
}
