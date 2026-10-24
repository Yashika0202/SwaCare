/**
 * Application Type Definitions
 */

export type TabId = 'home' | 'calendar' | 'insights' | 'settings';

export type PeriodFlow = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type MoodType = 'great' | 'calm' | 'neutral' | 'sad' | 'stressed';

export type EnergyLevel = 'low' | 'medium' | 'high';

export type WeightChange = 'gained' | 'lost' | 'same';

export type LifeStageMode = 'teen' | 'adult' | 'pregnancy' | 'perimenopause';

export type SymptomType =
  | 'cramps'
  | 'headache'
  | 'bloating'
  | 'acne'
  | 'hair_fall'
  | 'fatigue'
  | 'nausea'
  | 'back_pain'
  | 'breast_tenderness'
  // PMS & Mood Tracking
  | 'irritability'
  | 'anxiety'
  | 'low_mood'
  | 'mood_swings'
  // Perimenopause
  | 'hot_flashes'
  | 'night_sweats'
  | 'insomnia'
  | 'brain_fog'
  // Pregnancy
  | 'morning_sickness'
  | 'swollen_feet'
  | 'heartburn'
  | 'baby_kicks';

export interface DailyCheckIn {
  date: string; // YYYY-MM-DD
  flow: PeriodFlow;
  painLevel: number; // 0-10
  mood: MoodType;
  energy: EnergyLevel;
  sleepHours: number;
  symptoms: SymptomType[];
  note?: string;
  excessHair?: boolean;
  weightChange?: WeightChange;
  darkSkinPatches?: boolean;
  updatedAt: string;
}

export interface UserProfile {
  age: number;
  lifeStage?: LifeStageMode; // default adult
  pregnancyStartDate?: string;
  pregnancyWeeks?: number;
  averageCycleLength: number; // default 28
  averagePeriodLength: number; // default 5
  lastPeriodStartDate: string;
  completedOnboarding: boolean;
  discreetMode?: boolean;
}

export interface MythFact {
  id: string;
  category: 'periods' | 'pain' | 'fertility' | 'hormones';
  mythKey: string;
  factKey: string;
  explanationKey: string;
}

export type FlagSeverity = 'info' | 'attention' | 'see_doctor';

export interface HealthPatternFlag {
  id: string;
  severity: FlagSeverity;
  titleKey: string;
  whatWeNoticedKey: string;
  whatWeNoticedParams?: Record<string, string | number>;
  timeframeKey: string;
  timeframeParams?: Record<string, string | number>;
  nextStepKey: string;
  nextStepParams?: Record<string, string | number>;
}
