import { CyclePhase } from './cycleCalculator';
import { LifeStageMode } from '../types';

export interface PhaseWellnessAdvice {
  phase: CyclePhase;
  titleKey: string;
  foodTipKey: string;
  exerciseTipKey: string;
  energyTipKey: string;
  badgeKey: string;
  foodPointsKeys: string[];
  exercisePointsKeys: string[];
  energyPointsKeys: string[];
}

export const PHASE_WELLNESS_GUIDE: Record<CyclePhase, PhaseWellnessAdvice> = {
  menstrual: {
    phase: 'menstrual',
    titleKey: 'wellness.menstrualTitle',
    badgeKey: 'wellness.menstrualBadge',
    foodTipKey: 'wellness.menstrualFood',
    exerciseTipKey: 'wellness.menstrualExercise',
    energyTipKey: 'wellness.menstrualEnergy',
    foodPointsKeys: ['wellness.menstrualFoodP1', 'wellness.menstrualFoodP2'],
    exercisePointsKeys: ['wellness.menstrualExerciseP1', 'wellness.menstrualExerciseP2'],
    energyPointsKeys: ['wellness.menstrualEnergyP1', 'wellness.menstrualEnergyP2'],
  },
  follicular: {
    phase: 'follicular',
    titleKey: 'wellness.follicularTitle',
    badgeKey: 'wellness.follicularBadge',
    foodTipKey: 'wellness.follicularFood',
    exerciseTipKey: 'wellness.follicularExercise',
    energyTipKey: 'wellness.follicularEnergy',
    foodPointsKeys: ['wellness.follicularFoodP1', 'wellness.follicularFoodP2'],
    exercisePointsKeys: ['wellness.follicularExerciseP1', 'wellness.follicularExerciseP2'],
    energyPointsKeys: ['wellness.follicularEnergyP1', 'wellness.follicularEnergyP2'],
  },
  ovulation: {
    phase: 'ovulation',
    titleKey: 'wellness.ovulationTitle',
    badgeKey: 'wellness.ovulationBadge',
    foodTipKey: 'wellness.ovulationFood',
    exerciseTipKey: 'wellness.ovulationExercise',
    energyTipKey: 'wellness.ovulationEnergy',
    foodPointsKeys: ['wellness.ovulationFoodP1', 'wellness.ovulationFoodP2', 'wellness.ovulationFoodP3'],
    exercisePointsKeys: ['wellness.ovulationExerciseP1', 'wellness.ovulationExerciseP2', 'wellness.ovulationExerciseP3'],
    energyPointsKeys: ['wellness.ovulationEnergyP1', 'wellness.ovulationEnergyP2', 'wellness.ovulationEnergyP3'],
  },
  luteal: {
    phase: 'luteal',
    titleKey: 'wellness.lutealTitle',
    badgeKey: 'wellness.lutealBadge',
    foodTipKey: 'wellness.lutealFood',
    exerciseTipKey: 'wellness.lutealExercise',
    energyTipKey: 'wellness.lutealEnergy',
    foodPointsKeys: ['wellness.lutealFoodP1', 'wellness.lutealFoodP2'],
    exercisePointsKeys: ['wellness.lutealExerciseP1', 'wellness.lutealExerciseP2'],
    energyPointsKeys: ['wellness.lutealEnergyP1', 'wellness.lutealEnergyP2'],
  },
};

export interface LifeStageAdvice {
  stage: LifeStageMode;
  tagKey: string;
  titleKey: string;
  bodyKey: string;
  tips: { icon: string; titleKey: string; descKey: string }[];
}

export const LIFE_STAGE_GUIDE: Record<LifeStageMode, LifeStageAdvice> = {
  teen: {
    stage: 'teen',
    tagKey: 'lifestage.teenTag',
    titleKey: 'lifestage.teenTitle',
    bodyKey: 'lifestage.teenBody',
    tips: [
      {
        icon: 'heart',
        titleKey: 'lifestage.teenTip1Title',
        descKey: 'lifestage.teenTip1Desc',
      },
      {
        icon: 'sparkles',
        titleKey: 'lifestage.teenTip2Title',
        descKey: 'lifestage.teenTip2Desc',
      },
      {
        icon: 'droplet',
        titleKey: 'lifestage.teenTip3Title',
        descKey: 'lifestage.teenTip3Desc',
      },
    ],
  },
  adult: {
    stage: 'adult',
    tagKey: 'lifestage.adultTag',
    titleKey: 'lifestage.adultTitle',
    bodyKey: 'lifestage.adultBody',
    tips: [
      {
        icon: 'activity',
        titleKey: 'lifestage.adultTip1Title',
        descKey: 'lifestage.adultTip1Desc',
      },
    ],
  },
  pregnancy: {
    stage: 'pregnancy',
    tagKey: 'lifestage.pregnancyTag',
    titleKey: 'lifestage.pregnancyTitle',
    bodyKey: 'lifestage.pregnancyBody',
    tips: [
      {
        icon: 'calendar',
        titleKey: 'lifestage.pregTip1Title',
        descKey: 'lifestage.pregTip1Desc',
      },
      {
        icon: 'heart',
        titleKey: 'lifestage.pregTip2Title',
        descKey: 'lifestage.pregTip2Desc',
      },
      {
        icon: 'alert',
        titleKey: 'lifestage.pregTip3Title',
        descKey: 'lifestage.pregTip3Desc',
      },
    ],
  },
  perimenopause: {
    stage: 'perimenopause',
    tagKey: 'lifestage.periTag',
    titleKey: 'lifestage.periTitle',
    bodyKey: 'lifestage.periBody',
    tips: [
      {
        icon: 'flame',
        titleKey: 'lifestage.periTip1Title',
        descKey: 'lifestage.periTip1Desc',
      },
      {
        icon: 'moon',
        titleKey: 'lifestage.periTip2Title',
        descKey: 'lifestage.periTip2Desc',
      },
      {
        icon: 'activity',
        titleKey: 'lifestage.periTip3Title',
        descKey: 'lifestage.periTip3Desc',
      },
    ],
  },
};
