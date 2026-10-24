import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, NotebookText } from 'lucide-react';
import { TabId } from '../../types';
import { useTranslation } from '../../context/LanguageContext';
import { storage } from '../../storage/localStorage';

interface AppHeaderProps {
  currentTab: TabId;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ currentTab }) => {
  const { t } = useTranslation();
  const [isDiscreet, setIsDiscreet] = useState<boolean>(() => {
    return storage.get<boolean>('discreet_mode_enabled', false);
  });

  useEffect(() => {
    const checkDiscreet = () => {
      const val = storage.get<boolean>('discreet_mode_enabled', false);
      setIsDiscreet(val);
      if (typeof document !== 'undefined') {
        document.title = val ? t('discreet.appName') : `${t('app.name')} - Women's Health Companion`;
      }
    };

    checkDiscreet();
    window.addEventListener('storage', checkDiscreet);
    window.addEventListener('luna_discreet_mode_changed', checkDiscreet);
    return () => {
      window.removeEventListener('storage', checkDiscreet);
      window.removeEventListener('luna_discreet_mode_changed', checkDiscreet);
    };
  }, [t]);

  const getTabTitle = (tab: TabId): string => {
    if (isDiscreet) {
      switch (tab) {
        case 'home':
          return t('discreet.todayTitle');
        case 'calendar':
          return t('header.cycleCalendar');
        case 'insights':
          return t('header.healthInsights');
        case 'settings':
          return t('header.preferences');
        default:
          return t('discreet.todayTitle');
      }
    }

    switch (tab) {
      case 'home':
        return t('header.today');
      case 'calendar':
        return t('header.cycleCalendar');
      case 'insights':
        return t('header.healthInsights');
      case 'settings':
        return t('header.preferences');
      default:
        return t('header.today');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FFF5F9]/90 backdrop-blur-md border-b border-[#FF6FAE]/20 px-4 py-3 transition-colors">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Companion Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm shrink-0 ${
              isDiscreet ? 'bg-[#0C1F78]' : 'bg-[#F73F8B]'
            }`}
          >
            {isDiscreet ? (
              <NotebookText className="w-4 h-4 text-white" />
            ) : (
              <Sparkles className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-[#0C1F78] leading-tight truncate">
                {isDiscreet ? t('discreet.appName') : t('app.name')}
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FF6FAE] text-[#0C1F78]">
                {isDiscreet ? t('discreet.appCompanion') : t('app.companion')}
              </span>
            </div>
            <p className="text-xs text-[#0B1713]/70 truncate">
              {getTabTitle(currentTab)}
            </p>
          </div>
        </div>

        {/* Right Action: Privacy indicator (local data only) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/70 border border-[#FF6FAE]/20 text-[#0C1F78] shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#F73F8B]" />
          <span className="text-xs font-semibold text-[#0C1F78]">
            {t('app.onDeviceOnly')}
          </span>
        </div>
      </div>
    </header>
  );
};
