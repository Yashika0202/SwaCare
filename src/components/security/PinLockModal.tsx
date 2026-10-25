import React, { useState } from 'react';
import { Lock, Delete, X, ShieldCheck, Check } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

interface PinLockModalProps {
  mode: 'unlock' | 'set';
  savedPin?: string | null;
  onSuccess: (newPin?: string) => void;
  onCancel?: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  mode,
  savedPin,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();

  const [enteredPin, setEnteredPin] = useState<string>('');
  const [firstPin, setFirstPin] = useState<string>('');
  const [step, setStep] = useState<'enter' | 'setFirst' | 'confirm'>('enter');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentPin = enteredPin;

  const handleKeyPress = (num: number) => {
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + num;
      setEnteredPin(nextPin);
      setErrorMsg(null);

      if (nextPin.length === 4) {
        processCompletedPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const processCompletedPin = (pin: string) => {
    if (mode === 'unlock') {
      if (pin === savedPin) {
        onSuccess();
      } else {
        setErrorMsg(t('pin.incorrectPin'));
        setTimeout(() => setEnteredPin(''), 400);
      }
    } else {
      // Set Mode
      if (step === 'enter' || step === 'setFirst') {
        setFirstPin(pin);
        setEnteredPin('');
        setStep('confirm');
      } else if (step === 'confirm') {
        if (pin === firstPin) {
          onSuccess(pin);
        } else {
          setErrorMsg(t('pin.pinsDoNotMatch'));
          setTimeout(() => {
            setEnteredPin('');
            setStep('setFirst');
          }, 600);
        }
      }
    }
  };

  const getTitle = () => {
    if (mode === 'unlock') return t('pin.enterPin');
    if (step === 'confirm') return t('pin.confirmPin');
    return t('pin.setNewPin');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#0B1713]/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-[#E6E8F3] text-center relative">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F7F8FC] border border-[#E6E8F3] flex items-center justify-center text-[#0C1F78] hover:bg-[#E6E8F3] cursor-pointer"
            aria-label={t('pin.cancel')}
          >
            <X className="w-5 h-5 text-[#0C1F78]" />
          </button>
        )}

        <div className="w-14 h-14 rounded-2xl bg-[#F73F8B] text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Lock className="w-7 h-7 text-white" />
        </div>

        <h3 className="text-lg font-bold text-[#0C1F78] mb-1">
          {getTitle()}
        </h3>
        <p className="text-xs text-[#0B1713]/70 mb-5">
          {t('settings.appLockSubtitle')}
        </p>

        {/* 4 PIN Dots */}
        <div className="flex justify-center items-center gap-4 mb-6">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = index < currentPin.length;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-[#F73F8B] scale-110 shadow-xs'
                    : 'bg-[#F7F8FC] border-2 border-[#E6E8F3]'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <div className="mb-4 text-xs font-semibold text-[#960045] bg-[#960045]/10 py-1.5 px-3 rounded-lg animate-fadeIn">
            {errorMsg}
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="min-h-[54px] min-w-[54px] rounded-2xl bg-[#F7F8FC] border border-[#E6E8F3] text-xl font-bold text-[#0C1F78] hover:bg-[#E6E8F3] active:scale-95 transition-all shadow-xs flex items-center justify-center cursor-pointer"
            >
              {num}
            </button>
          ))}

          {/* Empty spacer / cancel */}
          <div className="min-h-[54px] flex items-center justify-center">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-xs font-semibold text-[#0C1F78]/80 hover:text-[#0C1F78] cursor-pointer"
              >
                {t('pin.cancel')}
              </button>
            )}
          </div>

          {/* 0 */}
          <button
            type="button"
            onClick={() => handleKeyPress(0)}
            className="min-h-[54px] min-w-[54px] rounded-2xl bg-[#F7F8FC] border border-[#E6E8F3] text-xl font-bold text-[#0C1F78] hover:bg-[#E6E8F3] active:scale-95 transition-all shadow-xs flex items-center justify-center cursor-pointer"
          >
            0
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={handleDelete}
            className="min-h-[54px] min-w-[54px] rounded-2xl bg-[#F7F8FC] border border-[#E6E8F3] text-lg font-bold text-[#0C1F78] hover:bg-[#E6E8F3] active:scale-95 transition-all shadow-xs flex items-center justify-center cursor-pointer"
            aria-label="Delete"
          >
            <Delete className="w-5 h-5 text-[#0C1F78]" />
          </button>
        </div>
      </div>
    </div>
  );
};
