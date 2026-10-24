import { DailyCheckIn, UserProfile, PeriodFlow, MoodType, EnergyLevel, SymptomType, WeightChange } from '../types';
import { formatDate, addDays } from './cycleCalculator';

/**
 * Generates 6 realistic historical cycles for demonstration and testing.
 * Configured to trigger at least two health pattern screening flags:
 * 1. Hormonal pattern cluster (irregular cycle 38d + acne + excess facial/body hair + weight gain)
 * 2. Heavy flow with fatigue/low energy (iron levels awareness)
 */
export function generateSixCycleDemoData(): {
  dailyLogs: Record<string, DailyCheckIn>;
  profile: UserProfile;
} {
  const today = new Date();
  const todayStr = formatDate(today);

  // Profile
  const profile: UserProfile = {
    age: 26,
    lifeStage: 'adult',
    averageCycleLength: 31,
    averagePeriodLength: 6,
    lastPeriodStartDate: addDays(todayStr, -13), // 14 days ago (Day 14 today)
    completedOnboarding: true,
  };

  const dailyLogs: Record<string, DailyCheckIn> = {};

  // 6 Cycle start offsets from today with noticeable irregularity:
  // Cycle 1: 172 days ago (length: 31 days)
  // Cycle 2: 141 days ago (length: 38 days - long cycle > 35d!)
  // Cycle 3: 103 days ago (length: 27 days)
  // Cycle 4: 76 days ago (length: 36 days - long cycle > 35d!)
  // Cycle 5: 40 days ago (length: 27 days)
  // Cycle 6: 13 days ago (current cycle, Day 14 today)
  const cycleStartsDaysAgo = [172, 141, 103, 76, 40, 13];

  cycleStartsDaysAgo.forEach((daysAgo, cycleIdx) => {
    const cycleStart = addDays(todayStr, -daysAgo);
    const cycleLen = cycleIdx < 5 ? cycleStartsDaysAgo[cycleIdx] - cycleStartsDaysAgo[cycleIdx + 1] : 28;

    for (let dayInCycle = 1; dayInCycle <= cycleLen; dayInCycle++) {
      const curDate = addDays(cycleStart, dayInCycle - 1);
      if (curDate > todayStr) break;

      let flow: PeriodFlow = 'none';
      let painLevel = 0;
      let mood: MoodType = 'calm';
      let energy: EnergyLevel = 'medium';
      let sleepHours = 7.5;
      const symptoms: SymptomType[] = [];
      let excessHair = false;
      let weightChange: WeightChange | undefined = undefined;
      let darkSkinPatches = false;

      // Bleeding Days
      if (dayInCycle === 1) {
        flow = 'medium';
        painLevel = 6;
        mood = 'stressed';
        energy = 'low';
        sleepHours = 8.5;
        symptoms.push('cramps', 'fatigue', 'back_pain');
      } else if (dayInCycle === 2) {
        flow = 'heavy';
        painLevel = 7;
        mood = 'sad';
        energy = 'low'; // Low energy with heavy flow!
        sleepHours = 8.5;
        symptoms.push('cramps', 'fatigue', 'headache');
      } else if (dayInCycle === 3) {
        flow = 'heavy';
        painLevel = 5;
        mood = 'neutral';
        energy = 'low'; // Low energy with heavy flow!
        sleepHours = 8.0;
        symptoms.push('bloating', 'fatigue');
      } else if (dayInCycle === 4) {
        flow = 'medium';
        painLevel = 3;
        mood = 'calm';
        energy = 'medium';
        sleepHours = 7.5;
        symptoms.push('bloating');
      } else if (dayInCycle === 5) {
        flow = 'light';
        painLevel = 1;
        mood = 'calm';
        energy = 'medium';
        sleepHours = 7.5;
      } else if (dayInCycle === 6) {
        flow = 'spotting';
        painLevel = 0;
        mood = 'calm';
        energy = 'high';
        sleepHours = 7.5;
      } else if (dayInCycle >= 7 && dayInCycle <= 12) {
        flow = 'none';
        painLevel = 0;
        mood = 'great';
        energy = 'high';
        sleepHours = 7.2;
      } else if (dayInCycle >= 13 && dayInCycle <= 15) {
        flow = 'none';
        painLevel = dayInCycle === 14 ? 2 : 0;
        mood = 'great';
        energy = 'high';
        sleepHours = 7.0;
        if (dayInCycle === 14) symptoms.push('bloating');
      } else if (dayInCycle >= 16 && dayInCycle <= 22) {
        flow = 'none';
        painLevel = 0;
        mood = 'calm';
        energy = 'medium';
        sleepHours = 7.6;
      } else if (dayInCycle >= 23) {
        flow = 'none';
        painLevel = 3;
        mood = 'stressed';
        energy = 'low';
        sleepHours = 8.0;
        symptoms.push('acne', 'breast_tenderness', 'bloating');

        // Late luteal premenstrual mood dip (PMS)
        if (dayInCycle >= 25) {
          symptoms.push('irritability', 'mood_swings');
          mood = 'sad';
        }

        // Recorded hormonal signs during late cycle
        if (cycleIdx % 2 === 0) {
          excessHair = true;
          weightChange = 'gained';
        }
      }

      dailyLogs[curDate] = {
        date: curDate,
        flow,
        painLevel,
        mood,
        energy,
        sleepHours,
        symptoms,
        excessHair: excessHair ? true : undefined,
        weightChange: weightChange,
        darkSkinPatches: darkSkinPatches ? true : undefined,
        note: dayInCycle === 1 ? 'Period started today.' : undefined,
        updatedAt: new Date(curDate + 'T10:00:00').toISOString(),
      };
    }
  });

  return { dailyLogs, profile };
}
