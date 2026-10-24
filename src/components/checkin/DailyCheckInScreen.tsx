import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Droplets,
  CircleSlash,
  Flame,
  Minus,
  Plus,
  Check,
  Heart,
  AlertCircle,
  Clock,
  Activity,
  Smile,
  Zap,
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { storage } from '../../storage/localStorage';
import {
  DailyCheckIn,
  UserProfile,
  PeriodFlow,
  MoodType,
  EnergyLevel,
  SymptomType,
  WeightChange,
} from '../../types';

interface DailyCheckInScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (entry: DailyCheckIn) => void;
  initialDate?: string;
}

export const DailyCheckInScreen: React.FC<DailyCheckInScreenProps> = ({
  isOpen,
  onClose,
  onSaved,
  initialDate,
}) => {
  const { t } = useTranslation();

  // Determine target date (default today)
  const targetDate =
    initialDate || new Date().toISOString().split('T')[0];

  // State
  const [flow, setFlow] = useState<PeriodFlow>('none');
  const [painLevel, setPainLevel] = useState<number>(0);
  const [mood, setMood] = useState<MoodType>('calm');
  const [energy, setEnergy] = useState<EnergyLevel>('medium');
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomType[]>([]);
  const [excessHair, setExcessHair] = useState<boolean>(false);
  const [weightChange, setWeightChange] = useState<WeightChange | undefined>(undefined);
  const [darkSkinPatches, setDarkSkinPatches] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');
  const [alreadyExists, setAlreadyExists] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [savedEntry, setSavedEntry] = useState<DailyCheckIn | null>(null);

  // Load existing log for targetDate if available
  useEffect(() => {
    if (isOpen) {
      const logs = storage.get<Record<string, DailyCheckIn>>('daily_logs', {});
      const existing = logs[targetDate];
      if (existing) {
        setFlow(existing.flow);
        setPainLevel(existing.painLevel);
        setMood(existing.mood);
        setEnergy(existing.energy);
        setSleepHours(existing.sleepHours);
        setSelectedSymptoms(existing.symptoms || []);
        setExcessHair(Boolean(existing.excessHair));
        setWeightChange(existing.weightChange);
        setDarkSkinPatches(Boolean(existing.darkSkinPatches));
        setNote(existing.note || '');
        setAlreadyExists(true);
      } else {
        setFlow('none');
        setPainLevel(0);
        setMood('calm');
        setEnergy('medium');
        setSleepHours(7.5);
        setSelectedSymptoms([]);
        setExcessHair(false);
        setWeightChange(undefined);
        setDarkSkinPatches(false);
        setNote('');
        setAlreadyExists(false);
      }
      setShowConfirmation(false);
    }
  }, [isOpen, targetDate]);

  if (!isOpen) return null;

  const toggleSymptom = (symptom: SymptomType) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const newEntry: DailyCheckIn = {
      date: targetDate,
      flow,
      painLevel,
      mood,
      energy,
      sleepHours,
      symptoms: selectedSymptoms,
      excessHair: excessHair ? true : undefined,
      weightChange: weightChange,
      darkSkinPatches: darkSkinPatches ? true : undefined,
      note: note.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    // Save one entry per date in localStorage (overwriting existing for targetDate)
    const allLogs = storage.get<Record<string, DailyCheckIn>>('daily_logs', {});
    allLogs[targetDate] = newEntry;
    storage.set('daily_logs', allLogs);

    setSavedEntry(newEntry);
    setShowConfirmation(true);
    onSaved(newEntry);
  };

  const isPainHigh = painLevel >= 8;

  const flowOptions: { id: PeriodFlow; labelKey: string; icon: React.ReactNode }[] = [
    {
      id: 'none',
      labelKey: 'checkin.flowNone',
      icon: <CircleSlash className="w-4 h-4" />,
    },
    {
      id: 'spotting',
      labelKey: 'checkin.flowSpotting',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'light',
      labelKey: 'checkin.flowLight',
      icon: <Droplets className="w-4 h-4" />,
    },
    {
      id: 'medium',
      labelKey: 'checkin.flowMedium',
      icon: (
        <div className="flex -space-x-1">
          <Droplets className="w-4 h-4" />
        </div>
      ),
    },
    {
      id: 'heavy',
      labelKey: 'checkin.flowHeavy',
      icon: (
        <div className="flex -space-x-1">
          <Droplets className="w-4 h-4 text-[#960045]" />
          <Droplets className="w-4 h-4 text-[#960045]" />
        </div>
      ),
    },
  ];

  const moodOptions: { id: MoodType; emoji: string; labelKey: string }[] = [
    { id: 'great', emoji: '😊', labelKey: 'checkin.moodGreat' },
    { id: 'calm', emoji: '😌', labelKey: 'checkin.moodCalm' },
    { id: 'neutral', emoji: '😐', labelKey: 'checkin.moodNeutral' },
    { id: 'sad', emoji: '😔', labelKey: 'checkin.moodSad' },
    { id: 'stressed', emoji: '😣', labelKey: 'checkin.moodStressed' },
  ];

  const userProfile = storage.get<UserProfile | null>('user_profile', null);
  const lifeStage = userProfile?.lifeStage || 'adult';
  const isDiscreet = storage.get<boolean>('discreet_mode_enabled', false);

  const energyOptions: { id: EnergyLevel; labelKey: string }[] = [
    { id: 'low', labelKey: 'checkin.energyLow' },
    { id: 'medium', labelKey: 'checkin.energyMedium' },
    { id: 'high', labelKey: 'checkin.energyHigh' },
  ];

  const baseSymptomsList: { id: SymptomType; labelKey: string }[] = [
    { id: 'cramps', labelKey: 'checkin.symptomCramps' },
    { id: 'headache', labelKey: 'checkin.symptomHeadache' },
    { id: 'bloating', labelKey: 'checkin.symptomBloating' },
    { id: 'acne', labelKey: 'checkin.symptomAcne' },
    { id: 'fatigue', labelKey: 'checkin.symptomFatigue' },
    { id: 'back_pain', labelKey: 'checkin.symptomBackPain' },
    { id: 'breast_tenderness', labelKey: 'checkin.symptomBreastTenderness' },
    { id: 'hair_fall', labelKey: 'checkin.symptomHairFall' },
    // PMS & Mood Tracking
    { id: 'irritability', labelKey: 'checkin.symptomIrritability' },
    { id: 'anxiety', labelKey: 'checkin.symptomAnxiety' },
    { id: 'low_mood', labelKey: 'checkin.symptomLowMood' },
    { id: 'mood_swings', labelKey: 'checkin.symptomMoodSwings' },
  ];

  if (lifeStage === 'perimenopause') {
    baseSymptomsList.push(
      { id: 'hot_flashes', labelKey: 'checkin.symptomHotFlashes' },
      { id: 'night_sweats', labelKey: 'checkin.symptomNightSweats' },
      { id: 'insomnia', labelKey: 'checkin.symptomInsomnia' },
      { id: 'brain_fog', labelKey: 'checkin.symptomBrainFog' }
    );
  }

  if (lifeStage === 'pregnancy') {
    baseSymptomsList.push(
      { id: 'morning_sickness', labelKey: 'checkin.symptomMorningSickness' },
      { id: 'swollen_feet', labelKey: 'checkin.symptomSwollenFeet' },
      { id: 'heartburn', labelKey: 'checkin.symptomHeartburn' },
      { id: 'baby_kicks', labelKey: 'checkin.symptomBabyKicks' }
    );
  }

  const symptomsList = baseSymptomsList;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#0B1713]/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fadeIn"
    >
      <div className="bg-[#FFF5F9] w-full max-w-md max-h-[92vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl border-t sm:border border-[#FF6FAE]/30 overflow-hidden">
        {/* Modal Top Header */}
        <div className="sticky top-0 z-10 bg-[#FFF5F9]/95 backdrop-blur-md px-5 py-4 border-b border-[#FF6FAE]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F73F8B] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0C1F78] leading-tight">
                {t('checkin.title')}
              </h2>
              <p className="text-[11px] text-[#0B1713]/65">
                {t('checkin.subtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-[#FF6FAE]/30 flex items-center justify-center text-[#0C1F78] hover:bg-[#FF6FAE]/20 active:scale-95 transition-all cursor-pointer"
            aria-label={t('checkin.closeButton')}
          >
            <X className="w-5 h-5 text-[#0C1F78]" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {alreadyExists && !showConfirmation && (
            <div className="p-3 rounded-xl bg-[#FF6FAE]/20 border border-[#FF6FAE]/30 text-xs text-[#0C1F78] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#F73F8B] shrink-0" />
              <span>{t('checkin.alreadyLoggedHint')}</span>
            </div>
          )}

          {/* SUCCESS CONFIRMATION OVERLAY / CARD */}
          {showConfirmation ? (
            <div className="py-8 px-4 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-3xl bg-[#F73F8B] text-white flex items-center justify-center mx-auto shadow-md">
                <Heart className="w-8 h-8 text-white fill-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0C1F78]">
                  {t('checkin.title')}
                </h3>
                <p className="text-sm font-medium text-[#0B1713] mt-2 max-w-xs mx-auto leading-relaxed">
                  {t('checkin.encouragingMessage')}
                </p>
              </div>

              {/* Summary snapshot */}
              <div className="bg-white rounded-2xl p-4 border border-[#FF6FAE]/30 text-left text-xs space-y-2 mt-4">
                <div className="flex justify-between py-1 border-b border-[#FF6FAE]/15">
                  <span className="text-[#0B1713]/70">{t('checkin.flowSection')}:</span>
                  <span className="font-bold text-[#0C1F78] capitalize">{flow}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#FF6FAE]/15">
                  <span className="text-[#0B1713]/70">{t('checkin.painSection')}:</span>
                  <span className={`font-bold ${isPainHigh ? 'text-[#960045]' : 'text-[#0C1F78]'}`}>
                    {painLevel} / 10
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#FF6FAE]/15">
                  <span className="text-[#0B1713]/70">{t('checkin.sleepSection')}:</span>
                  <span className="font-bold text-[#0C1F78]">
                    {t('checkin.sleepHoursDisplay', { hours: sleepHours })}
                  </span>
                </div>
                {selectedSymptoms.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[#0B1713]/70 block mb-1.5">
                      {t('checkin.symptomsSection')} ({selectedSymptoms.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedSymptoms.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-md bg-[#FF6FAE] text-[#0C1F78] text-[10px] font-semibold"
                        >
                          {t(`checkin.symptom${s.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full min-h-[48px] rounded-xl bg-[#F73F8B] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>{t('checkin.closeButton')}</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-5">
              {/* 1. PERIOD FLOW (Icon buttons) */}
              <section className="bg-white rounded-2xl p-4 shadow-xs border border-[#FF6FAE]/25 space-y-2.5">
                <label className="block text-xs font-bold text-[#0C1F78]">
                  {t('checkin.flowSection')}
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {flowOptions.map((opt) => {
                    const isSelected = flow === opt.id;
                    const isHeavy = opt.id === 'heavy';

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFlow(opt.id)}
                        className={`min-h-[58px] p-1.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
                          isSelected
                            ? isHeavy
                              ? 'bg-[#960045] text-white border-[#960045] shadow-xs'
                              : 'bg-[#F73F8B] text-white border-[#F73F8B] shadow-xs'
                            : 'bg-[#FFF5F9] text-[#0C1F78] border-[#FF6FAE]/30 hover:border-[#F73F8B]'
                        }`}
                      >
                        <div className={isSelected ? 'text-white' : 'text-[#0C1F78]'}>
                          {opt.icon}
                        </div>
                        <span className="text-[10px] font-semibold tracking-tight text-center leading-none">
                          {t(opt.labelKey)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 2. PAIN LEVEL (Slider 0-10, Pain 8-10 in crimson) */}
              <section className="bg-white rounded-2xl p-4 shadow-xs border border-[#FF6FAE]/25 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-[#0C1F78] block">
                      {t('checkin.painSection')}
                    </label>
                    <span className="text-[10px] text-[#0B1713]/60">
                      {t('checkin.painScaleHint')}
                    </span>
                  </div>

                  {/* Pain display badge - pain 8-10 shown in crimson */}
                  <span
                    className={`min-h-[32px] px-3 py-1 rounded-lg text-sm font-bold flex items-center justify-center transition-colors tabular-nums ${
                      isPainHigh
                        ? 'bg-[#960045] text-white shadow-xs'
                        : painLevel > 0
                        ? 'bg-[#FF6FAE] text-[#0C1F78]'
                        : 'bg-[#FFF5F9] text-[#0C1F78] border border-[#FF6FAE]/30'
                    }`}
                  >
                    {painLevel} / 10
                  </span>
                </div>

                <div className="pt-1">
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={painLevel}
                    onChange={(e) => setPainLevel(parseInt(e.target.value))}
                    className={`w-full cursor-pointer h-2 rounded-lg ${
                      isPainHigh ? 'accent-[#960045]' : 'accent-[#F73F8B]'
                    }`}
                  />
                  <div className="flex justify-between text-[10px] font-medium text-[#0B1713]/50 px-1 mt-1">
                    <span>0</span>
                    <span>5</span>
                    <span className="text-[#960045] font-bold">10</span>
                  </div>
                </div>

                {isPainHigh && (
                  <div className="p-2.5 rounded-xl bg-[#960045]/10 border border-[#960045]/20 flex items-start gap-2 text-xs text-[#960045] animate-fadeIn">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#960045]" />
                    <span>{t('checkin.painHighAlert')}</span>
                  </div>
                )}
              </section>

              {/* 3. MOOD (5 emoji options) */}
              <section className="bg-white rounded-2xl p-4 shadow-xs border border-[#FF6FAE]/25 space-y-2.5">
                <label className="block text-xs font-bold text-[#0C1F78]">
                  {t('checkin.moodSection')}
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {moodOptions.map((opt) => {
                    const isSelected = mood === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setMood(opt.id)}
                        className={`min-h-[58px] p-1.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-[#F73F8B] text-white border-[#F73F8B] shadow-xs'
                            : 'bg-[#FFF5F9] text-[#0C1F78] border-[#FF6FAE]/30 hover:border-[#F73F8B]'
                        }`}
                      >
                        <span className="text-xl leading-none">{opt.emoji}</span>
                        <span className="text-[10px] font-semibold tracking-tight text-center leading-none">
                          {t(opt.labelKey)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 4. ENERGY (Low / Medium / High) */}
              <section className="bg-white rounded-2xl p-4 shadow-xs border border-[#FF6FAE]/25 space-y-2.5">
                <label className="block text-xs font-bold text-[#0C1F78]">
                  {t('checkin.energySection')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {energyOptions.map((opt) => {
                    const isSelected = energy === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setEnergy(opt.id)}
                        className={`min-h-[44px] py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-[#F73F8B] text-white border-[#F73F8B] shadow-xs'
                            : 'bg-[#FFF5F9] text-[#0C1F78] border-[#FF6FAE]/30 hover:bg-[#FF6FAE]/20'
                        }`}
                      >
                        <Zap className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#0C1F78]'}`} />
                        <span>{t(opt.labelKey)}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 5. SLEEP HOURS (Simple Stepper) */}
              <section className="bg-white rounded-2xl p-4 shadow-xs border border-[#FF6FAE]/25">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-[#0C1F78] block">
                      {t('checkin.sleepSection')}
                    </label>
                    <span className="text-sm font-bold text-[#0C1F78] tabular-nums">
                      {t('checkin.sleepHoursDisplay', { hours: sleepHours })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSleepHours((prev) => Math.max(0, +(prev - 0.5).toFixed(1)))}
                      className="w-10 h-10 rounded-xl bg-[#FFF5F9] border border-[#FF6FAE]/30 text-[#0C1F78] flex items-center justify-center hover:bg-[#FF6FAE]/20 active:scale-95 transition-all cursor-pointer"
                      aria-label="Decrease sleep hours"
                    >
                      <Minus className="w-4 h-4 text-[#0C1F78]" />
                    </button>
                    <div className="w-12 text-center font-bold text-sm text-[#0C1F78] tabular-nums">
                      {sleepHours}h
                    </div>
                    <button
                      type="button"
                      onClick={() => setSleepHours((prev) => Math.min(24, +(prev + 0.5).toFixed(1)))}
                      className="w-10 h-10 rounded-xl bg-[#FFF5F9] border border-[#FF6FAE]/30 text-[#0C1F78] flex items-center justify-center hover:bg-[#FF6FAE]/20 active:scale-95 transition-all cursor-pointer"
                      aria-label="Increase sleep hours"
                    >
                      <Plus className="w-4 h-4 text-[#0C1F78]" />
                    </button>
                  </div>
                </div>
              </section>

              {/* 6. SYMPTOMS (Multi-select chips with light pink & navy/ink text) */}
              <section className="bg-white rounded-2xl p-4 shadow-xs border border-[#FF6FAE]/25 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0C1F78]">
                    {t('checkin.symptomsSection')}
                  </label>
                  <span className="text-[11px] text-[#0B1713]/60">
                    {t('checkin.symptomsHint')}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {symptomsList.map((sym) => {
                    const isSelected = selectedSymptoms.includes(sym.id);

                    return (
                      <button
                        key={sym.id}
                        type="button"
                        onClick={() => toggleSymptom(sym.id)}
                        className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#FF6FAE] text-[#0C1F78] font-bold border border-[#FF6FAE] shadow-xs' // Strictly Navy on light pink!
                            : 'bg-[#FFF5F9] text-[#0B1713] font-medium border border-[#FF6FAE]/30 hover:border-[#FF6FAE]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#0C1F78]" />}
                        <span>{t(sym.labelKey)}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 7. OPTIONAL HORMONAL PATTERN INDICATORS */}
              <section className="bg-white rounded-2xl p-4 shadow-xs border border-[#FF6FAE]/25 space-y-3">
                <div>
                  <label className="text-xs font-bold text-[#0C1F78] block">
                    {t('checkin.optionalIndicatorsTitle')}
                  </label>
                  <span className="text-[10px] text-[#0B1713]/60">
                    {t('checkin.optionalIndicatorsHint')}
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Excess facial / body hair */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#0B1713]">
                      {t('checkin.excessHairLabel')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExcessHair(!excessHair)}
                      className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        excessHair
                          ? 'bg-[#FF6FAE] text-[#0C1F78] border border-[#FF6FAE] shadow-xs'
                          : 'bg-[#FFF5F9] text-[#0B1713]/70 border border-[#FF6FAE]/30'
                      }`}
                    >
                      {excessHair ? t('common.yes') : t('common.no')}
                    </button>
                  </div>

                  {/* Weight change (gained / same / lost) */}
                  <div>
                    <span className="text-xs font-medium text-[#0B1713] block mb-1.5">
                      {t('checkin.weightChangeLabel')}
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['gained', 'same', 'lost'] as const).map((w) => {
                        const isSelected = weightChange === w;
                        return (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setWeightChange(isSelected ? undefined : w)}
                            className={`min-h-[40px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#FF6FAE] text-[#0C1F78] border border-[#FF6FAE] shadow-xs'
                                : 'bg-[#FFF5F9] text-[#0B1713]/70 border border-[#FF6FAE]/30 hover:border-[#FF6FAE]'
                            }`}
                          >
                            {t(`checkin.weight${w.charAt(0).toUpperCase() + w.slice(1)}`)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dark skin patches */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-medium text-[#0B1713]">
                      {t('checkin.darkSkinPatchesLabel')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDarkSkinPatches(!darkSkinPatches)}
                      className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        darkSkinPatches
                          ? 'bg-[#FF6FAE] text-[#0C1F78] border border-[#FF6FAE] shadow-xs'
                          : 'bg-[#FFF5F9] text-[#0B1713]/70 border border-[#FF6FAE]/30'
                      }`}
                    >
                      {darkSkinPatches ? t('common.yes') : t('common.no')}
                    </button>
                  </div>
                </div>
              </section>

              {/* 8. OPTIONAL NOTE */}
              <section className="bg-white rounded-2xl p-4 shadow-xs border border-[#FF6FAE]/25 space-y-2">
                <label className="block text-xs font-bold text-[#0C1F78]">
                  {t('checkin.noteSection')}
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t('checkin.notePlaceholder')}
                  className="w-full p-3 rounded-xl border border-[#FF6FAE]/30 text-xs text-[#0B1713] focus:outline-none focus:ring-2 focus:ring-[#F73F8B] bg-[#FFF5F9]/40 resize-none"
                />
              </section>

              {/* SAVE BUTTON */}
              <div className="pt-2 pb-3">
                <button
                  type="submit"
                  className="w-full min-h-[48px] rounded-xl bg-[#F73F8B] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>{t('checkin.saveButton')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
