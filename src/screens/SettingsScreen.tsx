import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Trash2,
  Palette,
  Sliders,
  Check,
  Globe,
  RotateCcw,
  Bell,
  Lock,
  Download,
  AlertTriangle,
  Info,
  Database,
  KeyRound,
  Clock,
  Sparkles,
  NotebookText,
  BookOpen,
  Heart,
  Baby,
} from 'lucide-react';
import { useTranslation, Language } from '../context/LanguageContext';
import { storage } from '../storage/localStorage';
import { UserProfile, LifeStageMode } from '../types';
import { PinLockModal } from '../components/security/PinLockModal';
import { EmergencyCareCard } from '../components/emergency/EmergencyCareCard';
import { FactsScreen } from '../components/facts/FactsScreen';
import { generateSixCycleDemoData } from '../utils/demoData';

interface SettingsScreenProps {
  userProfile: UserProfile | null;
  onResetOnboarding: () => void;
  onLockApp: () => void;
  onDataModified?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  userProfile,
  onResetOnboarding,
  onLockApp,
  onDataModified,
}) => {
  const { language, setLanguage, t } = useTranslation();

  // Life Stage Mode
  const [currentLifeStage, setCurrentLifeStage] = useState<LifeStageMode>(() => {
    return userProfile?.lifeStage || 'adult';
  });

  // Discreet Mode State
  const [isDiscreet, setIsDiscreet] = useState<boolean>(() => {
    return storage.get<boolean>('discreet_mode_enabled', false);
  });

  // Facts Screen Modal
  const [isFactsOpen, setIsFactsOpen] = useState<boolean>(false);

  // Reminder State
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(() => {
    return storage.get<boolean>('reminder_enabled', true);
  });
  const [reminderTime, setReminderTime] = useState<string>(() => {
    return storage.get<string>('reminder_time', '20:30');
  });

  // PIN Lock State
  const [pinLockEnabled, setPinLockEnabled] = useState<boolean>(() => {
    return storage.get<boolean>('pin_lock_enabled', false);
  });
  const [savedPin, setSavedPin] = useState<string | null>(() => {
    return storage.get<string | null>('app_pin', null);
  });
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [pinModalMode, setPinModalMode] = useState<'set' | 'unlock'>('set');
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Demo Data State
  const [isDemoActive, setIsDemoActive] = useState<boolean>(() => {
    return storage.get<boolean>('demo_data_active', false);
  });

  // Delete Data Confirmation Modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const showTemporaryNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  // Life Stage Change Handler
  const handleLifeStageChange = (newStage: LifeStageMode) => {
    setCurrentLifeStage(newStage);
    const existing = storage.get<UserProfile | null>('user_profile', null) || {
      age: 25,
      averageCycleLength: 28,
      averagePeriodLength: 5,
      lastPeriodStartDate: new Date().toISOString().split('T')[0],
      completedOnboarding: true,
    };
    const updated: UserProfile = {
      ...existing,
      lifeStage: newStage,
    };
    storage.set('user_profile', updated);
    showTemporaryNotice(`Mode updated to ${newStage.toUpperCase()}`);
    if (onDataModified) onDataModified();
  };

  // Discreet Mode Toggle Handler
  const handleToggleDiscreet = (enabled: boolean) => {
    if (enabled && !savedPin) {
      // Prompt user to set a PIN first
      setPinModalMode('set');
      setIsPinModalOpen(true);
      showTemporaryNotice('Please create a 4-digit PIN to enable Discreet Mode');
      return;
    }

    storage.set('discreet_mode_enabled', enabled);
    setIsDiscreet(enabled);

    if (enabled) {
      storage.set('pin_lock_enabled', true);
      setPinLockEnabled(true);
    }

    window.dispatchEvent(new Event('luna_discreet_mode_changed'));
    if (typeof document !== 'undefined') {
      document.title = enabled
        ? t('discreet.appName')
        : `${t('app.name')} - Women's Health Companion`;
    }

    showTemporaryNotice(enabled ? t('discreet.statusNotice') : 'Discreet Mode disabled');
    if (onDataModified) onDataModified();
  };

  // Reminder Handler
  const handleToggleReminder = (enabled: boolean) => {
    setReminderEnabled(enabled);
    storage.set('reminder_enabled', enabled);
    showTemporaryNotice(enabled ? `Reminder set for ${reminderTime}` : 'Reminder disabled');
  };

  const handleTimeChange = (time: string) => {
    setReminderTime(time);
    storage.set('reminder_time', time);
    storage.set('reminder_enabled', true);
    setReminderEnabled(true);
    showTemporaryNotice(`Reminder updated to ${time}`);
  };

  // PIN Handlers
  const handleOpenSetPin = () => {
    setPinModalMode('set');
    setIsPinModalOpen(true);
  };

  const handlePinSuccess = (newPin?: string) => {
    if (newPin) {
      storage.set('app_pin', newPin);
      storage.set('pin_lock_enabled', true);
      setSavedPin(newPin);
      setPinLockEnabled(true);
      showTemporaryNotice(t('pin.pinSavedNotice'));
    }
    setIsPinModalOpen(false);
  };

  const handleDisablePin = () => {
    if (isDiscreet) {
      storage.set('discreet_mode_enabled', false);
      setIsDiscreet(false);
      window.dispatchEvent(new Event('luna_discreet_mode_changed'));
    }
    storage.set('pin_lock_enabled', false);
    storage.remove('app_pin');
    setPinLockEnabled(false);
    setSavedPin(null);
    showTemporaryNotice('PIN lock and Discreet Mode disabled');
  };

  // Demo Data Toggle Handler
  const handleToggleDemoData = () => {
    if (isDemoActive) {
      storage.remove('demo_data_active');
      storage.remove('daily_logs');
      setIsDemoActive(false);
      showTemporaryNotice(t('settings.clearDemoCTA'));
      if (onDataModified) onDataModified();
    } else {
      const { dailyLogs: demoLogs, profile: demoProfile } = generateSixCycleDemoData();
      storage.set('daily_logs', demoLogs);
      storage.set('user_profile', demoProfile);
      storage.set('demo_data_active', true);
      setIsDemoActive(true);
      showTemporaryNotice('6-cycle sample data loaded!');
      if (onDataModified) onDataModified();
    }
  };

  // Export Data as JSON
  const handleExportData = () => {
    const exportObject = {
      exportDate: new Date().toISOString(),
      appName: 'Luna Women’s Health Companion',
      userProfile,
      logs: storage.get('daily_logs', {}),
    };

    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `luna_health_export_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showTemporaryNotice('Health data backup downloaded successfully');
  };

  // Delete All Data
  const handleConfirmDeleteAll = () => {
    storage.clearAll();
    setShowDeleteConfirm(false);
    if (onResetOnboarding) onResetOnboarding();
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Notice Toast */}
      {noticeMessage && (
        <div className="bg-[#0C1F78] text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-md text-center animate-fadeIn">
          {noticeMessage}
        </div>
      )}

      {/* Screen Header */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#FF6FAE]/25">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#FF6FAE] text-[#0C1F78]">
              {t('settings.tag')}
            </span>
            <h2 className="text-xl font-bold text-[#0C1F78] mt-1.5">
              {t('settings.title')}
            </h2>
            <p className="text-xs text-[#0B1713]/80 mt-1 leading-relaxed">
              {t('settings.subtitle')}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#FFF5F9] border border-[#FF6FAE]/30 flex items-center justify-center shrink-0">
            <SettingsIcon className="w-5 h-5 text-[#0C1F78]" />
          </div>
        </div>
      </section>

      {/* 1. LIFE-STAGE MODE SELECTOR */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#FF6FAE]/25 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFF5F9] border border-[#FF6FAE]/30 flex items-center justify-center text-[#F73F8B] shrink-0">
            <Heart className="w-4 h-4 text-[#F73F8B]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0C1F78]">
              {t('lifestage.modeSelectorTitle')}
            </h3>
            <p className="text-[11px] text-[#0B1713]/70">
              {t('lifestage.modeSelectorSubtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {(
            [
              { id: 'teen', labelKey: 'lifestage.teenLabel', subKey: 'lifestage.teenSub' },
              { id: 'adult', labelKey: 'lifestage.adultLabel', subKey: 'lifestage.adultSub' },
              { id: 'pregnancy', labelKey: 'lifestage.pregnancyLabel', subKey: 'lifestage.pregnancySub' },
              { id: 'perimenopause', labelKey: 'lifestage.periLabel', subKey: 'lifestage.periSub' },
            ] as const
          ).map((m) => {
            const isSelected = currentLifeStage === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleLifeStageChange(m.id)}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer active:scale-98 ${
                  isSelected
                    ? 'bg-[#FF6FAE] border-[#F73F8B] shadow-xs text-[#0C1F78]'
                    : 'bg-[#FFF5F9] border-[#FF6FAE]/30 hover:border-[#FF6FAE] text-[#0B1713]'
                }`}
              >
                <div className="text-xs font-bold leading-tight">
                  {t(m.labelKey)}
                </div>
                <div className="text-[10px] text-[#0B1713]/70 truncate mt-0.5">
                  {t(m.subKey)}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. DISCREET MODE TOGGLE */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#FF6FAE]/25 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFF5F9] border border-[#FF6FAE]/30 flex items-center justify-center text-[#0C1F78] shrink-0">
              <NotebookText className="w-4 h-4 text-[#0C1F78]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0C1F78]">
                {t('discreet.settingsTitle')}
              </h3>
              <p className="text-[11px] text-[#0B1713]/70">
                {t('discreet.settingsSubtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleToggleDiscreet(!isDiscreet)}
            className={`min-h-[34px] px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDiscreet
                ? 'bg-[#0C1F78] text-white shadow-xs'
                : 'bg-[#FFF5F9] text-[#0C1F78] border border-[#FF6FAE]/40'
            }`}
          >
            {isDiscreet ? 'ACTIVE' : 'ENABLE'}
          </button>
        </div>

        {isDiscreet && (
          <div className="p-3 rounded-2xl bg-[#FFF5F9] border border-[#FF6FAE]/25 text-xs text-[#0B1713] space-y-1">
            <span className="font-bold text-[#0C1F78] block">
              {t('discreet.activeBadge')}
            </span>
            <p className="text-[11px] text-[#0B1713]/70">
              {t('discreet.statusNotice')}
            </p>
          </div>
        )}
      </section>

      {/* 3. KNOW THE FACTS: MYTH-BUSTING CTA */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#FF6FAE]/25 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFF5F9] border border-[#FF6FAE]/30 flex items-center justify-center text-[#0C1F78] shrink-0">
              <BookOpen className="w-4 h-4 text-[#0C1F78]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0C1F78]">
                {t('myths.screenTitle')}
              </h3>
              <p className="text-[11px] text-[#0B1713]/70">
                {t('myths.screenSubtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsFactsOpen(true)}
            className="min-h-[36px] px-3.5 rounded-xl bg-[#0C1F78] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#081552] transition-all cursor-pointer shadow-xs"
          >
            <span>{t('common.select')}</span> &rarr;
          </button>
        </div>
      </section>

      {/* 4. DAILY CHECK-IN REMINDER */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#FF6FAE]/25 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFF5F9] border border-[#FF6FAE]/30 flex items-center justify-center text-[#F73F8B] shrink-0">
            <Bell className="w-4 h-4 text-[#F73F8B]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0C1F78]">
              {t('settings.reminderSectionTitle')}
            </h3>
            <p className="text-[11px] text-[#0B1713]/70">
              {t('settings.reminderSectionSubtitle')}
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-4 gap-2">
            {['09:00', '14:00', '20:30', '21:30'].map((time) => {
              const isSelected = reminderEnabled && reminderTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleTimeChange(time)}
                  className={`min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-[#F73F8B] text-white shadow-xs'
                      : 'bg-[#FFF5F9] text-[#0C1F78] border border-[#FF6FAE]/30 hover:border-[#F73F8B]'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF5F9] border border-[#FF6FAE]/25">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0C1F78]" />
              <label className="text-xs font-semibold text-[#0C1F78]">
                {t('settings.reminderTimeLabel')}
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="px-2 py-1 rounded-lg border border-[#FF6FAE]/40 text-xs font-bold text-[#0C1F78] bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleToggleReminder(!reminderEnabled)}
                className={`min-h-[34px] px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  reminderEnabled
                    ? 'bg-[#FF6FAE] text-[#0C1F78]'
                    : 'bg-white border border-[#FF6FAE]/40 text-[#0B1713]/60'
                }`}
              >
                {reminderEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. APP LOCK (4-DIGIT PIN) */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#FF6FAE]/25 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFF5F9] border border-[#FF6FAE]/30 flex items-center justify-center text-[#F73F8B] shrink-0">
              <Lock className="w-4 h-4 text-[#F73F8B]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0C1F78]">
                {t('settings.securitySectionTitle')}
              </h3>
              <p className="text-[11px] text-[#0B1713]/70">
                {t('settings.securitySectionSubtitle')}
              </p>
            </div>
          </div>

          {pinLockEnabled && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#FF6FAE] text-[#0C1F78]">
              {t('settings.pinActiveBadge')}
            </span>
          )}
        </div>

        <div className="space-y-2 pt-1">
          {pinLockEnabled ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onLockApp}
                className="min-h-[44px] rounded-xl bg-[#0C1F78] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-[#081552] active:scale-95 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-white" />
                <span>{t('settings.lockAppNowCTA')}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenSetPin}
                className="min-h-[44px] rounded-xl bg-[#FFF5F9] border border-[#FF6FAE]/40 text-[#0C1F78] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#FF6FAE]/20 active:scale-95 transition-all cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#0C1F78]" />
                <span>{t('settings.changePinCTA')}</span>
              </button>

              <button
                type="button"
                onClick={handleDisablePin}
                className="col-span-2 min-h-[38px] rounded-xl border border-[#960045]/30 text-[#960045] font-semibold text-xs hover:bg-[#960045]/5 cursor-pointer"
              >
                {t('settings.disablePinCTA')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOpenSetPin}
              className="w-full min-h-[48px] rounded-xl bg-[#F73F8B] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-white" />
              <span>{t('settings.setPinCTA')}</span>
            </button>
          )}
        </div>
      </section>

      {/* 6. SAMPLE DEMO DATA (6 CYCLES) TOGGLE */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#FF6FAE]/25 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFF5F9] border border-[#FF6FAE]/30 flex items-center justify-center text-[#F73F8B] shrink-0">
              <Database className="w-4 h-4 text-[#F73F8B]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0C1F78]">
                {t('settings.demoSectionTitle')}
              </h3>
              <p className="text-[11px] text-[#0B1713]/70">
                {t('settings.demoSectionSubtitle')}
              </p>
            </div>
          </div>

          {isDemoActive && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#FF6FAE] text-[#0C1F78]">
              {t('settings.demoActiveBadge')}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleToggleDemoData}
          className={`w-full min-h-[48px] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-xs ${
            isDemoActive
              ? 'bg-[#FFF5F9] border border-[#FF6FAE]/40 text-[#0C1F78] hover:bg-[#FF6FAE]/20'
              : 'bg-[#F73F8B] text-white hover:opacity-95'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${isDemoActive ? 'text-[#F73F8B]' : 'text-white'}`} />
          <span>{isDemoActive ? t('settings.clearDemoCTA') : t('settings.loadDemoCTA')}</span>
        </button>
      </section>

      {/* 7. LANGUAGE SWITCHER */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#FF6FAE]/25 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFF5F9] border border-[#FF6FAE]/30 flex items-center justify-center text-[#0C1F78] shrink-0">
            <Globe className="w-4 h-4 text-[#0C1F78]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0C1F78]">
              {t('settings.languageSectionTitle')}
            </h3>
            <p className="text-[11px] text-[#0B1713]/70">
              {t('settings.languageSectionSubtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { id: 'en', label: t('settings.languageEnglish'), native: 'English' },
            { id: 'hi', label: t('settings.languageHindi'), native: 'हिन्दी' },
            { id: 'hinglish', label: t('settings.languageHinglish'), native: 'Hinglish' },
          ].map((lang) => {
            const isSelected = language === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => setLanguage(lang.id as Language)}
                className={`min-h-[50px] p-2 rounded-xl text-center border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FF6FAE] border-[#F73F8B] text-[#0C1F78] font-bold shadow-xs'
                    : 'bg-[#FFF5F9] border-[#FF6FAE]/30 text-[#0B1713]/80 hover:border-[#FF6FAE]'
                }`}
              >
                <div className="text-xs font-bold">{lang.native}</div>
                <div className="text-[10px] opacity-75">{lang.id.toUpperCase()}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 8. STORAGE & DATA MANAGEMENT */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#FF6FAE]/25 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFF5F9] border border-[#FF6FAE]/30 flex items-center justify-center text-[#0C1F78] shrink-0">
            <Shield className="w-4 h-4 text-[#0C1F78]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0C1F78]">
              {t('settings.storageSectionTitle')}
            </h3>
            <p className="text-[11px] text-[#0B1713]/70">
              {t('settings.storageDesc')}
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleExportData}
            className="w-full min-h-[46px] rounded-xl bg-[#FFF5F9] border border-[#FF6FAE]/40 text-[#0C1F78] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#FF6FAE]/20 active:scale-98 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#F73F8B]" />
            <span>{t('settings.exportCTA')}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full min-h-[46px] rounded-xl border border-[#960045]/30 text-[#960045] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#960045]/5 active:scale-98 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-[#960045]" />
            <span>{t('settings.deleteCTA')}</span>
          </button>
        </div>
      </section>

      {/* 9. EMERGENCY CARE GUIDANCE */}
      <section className="space-y-2">
        <EmergencyCareCard />
      </section>

      {/* 10. MEDICAL DISCLAIMER CARD */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#FF6FAE]/25 space-y-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#0C1F78]" />
          <h3 className="text-sm font-bold text-[#0C1F78]">
            {t('disclaimer.title')}
          </h3>
        </div>
        <p className="text-xs text-[#0B1713] leading-relaxed">
          {t('disclaimer.text')}
        </p>
      </section>

      {/* Delete Data Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-[#0B1713]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-[#960045]/30">
            <div className="w-12 h-12 rounded-2xl bg-[#960045]/10 text-[#960045] flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-[#960045]" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#0C1F78]">
                {t('settings.deleteConfirmTitle')}
              </h3>
              <p className="text-xs text-[#0B1713]/80 mt-1.5 leading-relaxed">
                {t('settings.deleteConfirmDesc')}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmDeleteAll}
                className="w-full min-h-[46px] rounded-xl bg-[#960045] text-white font-bold text-xs shadow-xs hover:bg-[#7e003a] active:scale-95 transition-all cursor-pointer"
              >
                {t('settings.deleteConfirmButton')}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full min-h-[42px] rounded-xl border border-[#FF6FAE]/30 text-[#0C1F78] font-semibold text-xs hover:bg-[#FFF5F9] cursor-pointer"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN Configuration Modal */}
      {isPinModalOpen && (
        <PinLockModal
          mode={pinModalMode}
          savedPin={savedPin}
          onSuccess={handlePinSuccess}
          onCancel={() => setIsPinModalOpen(false)}
        />
      )}

      {/* Facts Screen Modal */}
      <FactsScreen
        isOpen={isFactsOpen}
        onClose={() => setIsFactsOpen(false)}
      />
    </div>
  );
};
