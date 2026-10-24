/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TabId, UserProfile } from './types';
import { LanguageProvider } from './context/LanguageContext';
import { storage } from './storage/localStorage';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { PinLockModal } from './components/security/PinLockModal';
import { HomeScreen } from './screens/HomeScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { InsightsScreen } from './screens/InsightsScreen';
import { SettingsScreen } from './screens/SettingsScreen';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<TabId>('home');
  const [dataVersion, setDataVersion] = useState<number>(0);

  const [isOnboarding, setIsOnboarding] = useState<boolean>(() => {
    const completed = storage.get<boolean>('onboarding_completed', false);
    return !completed;
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    return storage.get<UserProfile | null>('user_profile', null);
  });

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const pinEnabled = storage.get<boolean>('pin_lock_enabled', false);
    const pin = storage.get<string | null>('app_pin', null);
    return Boolean(pinEnabled && pin);
  });

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsOnboarding(false);
  };

  const handleResetOnboarding = () => {
    storage.set('onboarding_completed', false);
    setUserProfile(null);
    setIsOnboarding(true);
  };

  const handleDataModified = () => {
    setDataVersion((v) => v + 1);
    setUserProfile(storage.get<UserProfile | null>('user_profile', null));
  };

  if (isLocked) {
    const savedPin = storage.get<string | null>('app_pin', null);
    return (
      <PinLockModal
        mode="unlock"
        savedPin={savedPin}
        onSuccess={() => setIsLocked(false)}
      />
    );
  }

  if (isOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  const renderActiveScreen = () => {
    switch (currentTab) {
      case 'home':
        return <HomeScreen key={`home-${dataVersion}`} />;
      case 'calendar':
        return <CalendarScreen key={`cal-${dataVersion}`} />;
      case 'insights':
        return <InsightsScreen key={`ins-${dataVersion}`} />;
      case 'settings':
        return (
          <SettingsScreen
            key={`set-${dataVersion}`}
            userProfile={userProfile}
            onResetOnboarding={handleResetOnboarding}
            onLockApp={() => setIsLocked(true)}
            onDataModified={handleDataModified}
          />
        );
      default:
        return <HomeScreen key={`home-${dataVersion}`} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F9] text-[#0B1713] flex flex-col justify-between selection:bg-[#FF6FAE] selection:text-[#0C1F78]">
      {/* Centered Mobile-First Container */}
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col bg-[#FFF5F9] relative sm:border-x sm:border-[#FF6FAE]/20 sm:shadow-lg sm:shadow-[#F73F8B]/5">
        {/* Sticky App Header */}
        <AppHeader currentTab={currentTab} />

        {/* Scrollable Screen Content */}
        <main className="flex-1 px-4 py-4 overflow-y-auto">
          {renderActiveScreen()}
        </main>

        {/* Fixed Bottom Navigation (4 Tabs) */}
        <BottomNavigation
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
