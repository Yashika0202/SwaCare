import React from 'react';
import { Home, Calendar, LineChart, Settings } from 'lucide-react';
import { TabId } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

interface BottomNavigationProps {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
}

interface NavItemConfig {
  id: TabId;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'home', labelKey: 'nav.home', icon: Home },
  { id: 'calendar', labelKey: 'nav.calendar', icon: Calendar },
  { id: 'insights', labelKey: 'nav.insights', icon: LineChart },
  { id: 'settings', labelKey: 'nav.settings', icon: Settings },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onTabChange,
}) => {
  const { t } = useTranslation();

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#FF6FAE]/25 shadow-[0_-4px_20px_rgba(247,63,139,0.06)]"
    >
      <div className="max-w-xl mx-auto px-2">
        <ul className="grid grid-cols-4 items-center h-16 m-0 p-0 list-none">
          {NAV_ITEMS.map((item) => {
            const isActive = currentTab === item.id;
            const IconComponent = item.icon;

            return (
              <li key={item.id} className="flex justify-center">
                <button
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  aria-selected={isActive}
                  role="tab"
                  className={`group relative flex flex-col items-center justify-center w-full min-h-[48px] min-w-[48px] py-1 px-2 rounded-xl transition-all duration-150 active:scale-95 ${
                    isActive ? 'text-[#F73F8B]' : 'text-[#0C1F78]/70 hover:text-[#0C1F78]'
                  }`}
                >
                  {/* Subtle active pill behind icon */}
                  <div
                    className={`flex items-center justify-center w-10 h-7 rounded-full transition-colors ${
                      isActive
                        ? 'bg-[#FF6FAE]/30 text-[#F73F8B]'
                        : 'bg-transparent text-current group-hover:bg-[#FFF5F9]'
                    }`}
                  >
                    <IconComponent
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isActive ? 'scale-110 text-[#F73F8B]' : 'text-[#0C1F78]'
                      }`}
                    />
                  </div>

                  {/* Label from translation helper */}
                  <span
                    className={`text-[11px] font-medium tracking-tight mt-0.5 leading-none transition-colors ${
                      isActive
                        ? 'font-bold text-[#F73F8B]'
                        : 'text-[#0C1F78] group-hover:text-[#0C1F78]'
                    }`}
                  >
                    {t(item.labelKey)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
