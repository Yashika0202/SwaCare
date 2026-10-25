import React from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, HeartPulse, X } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

interface EmergencyCareCardProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const EmergencyCareCard: React.FC<EmergencyCareCardProps> = ({
  onClose,
  isModal = false,
}) => {
  const { t } = useTranslation();

  const content = (
    <div className="bg-[#960045]/5 border-2 border-[#960045]/40 rounded-3xl p-5 shadow-sm space-y-3.5 text-left relative">
      {onClose && isModal && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-[#960045]/30 flex items-center justify-center text-[#960045] hover:bg-[#960045]/10 cursor-pointer"
          aria-label={t('emergency.dismiss')}
        >
          <X className="w-4 h-4 text-[#960045]" />
        </button>
      )}

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#960045] text-white flex items-center justify-center shrink-0 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div className="pr-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#960045]">
            Urgent Health Advice
          </span>
          <h3 className="text-base font-bold text-[#960045] leading-tight">
            {t('emergency.title')}
          </h3>
          <p className="text-xs text-[#0B1713] mt-1 leading-snug">
            {t('emergency.bannerText')}
          </p>
        </div>
      </div>

      <div className="bg-white/90 rounded-2xl p-3.5 border border-[#960045]/20 space-y-2 text-xs text-[#0B1713]">
        <strong className="text-[#960045] block font-bold mb-1">
          Seek Immediate Medical Attention If You Experience:
        </strong>
        <div className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#960045] shrink-0 mt-1.5" />
          <span>{t('emergency.bullet1')}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#960045] shrink-0 mt-1.5" />
          <span>{t('emergency.bullet2')}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#960045] shrink-0 mt-1.5" />
          <span>{t('emergency.bullet3')}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#960045] shrink-0 mt-1.5" />
          <span>{t('emergency.bullet4')}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <a
          href="tel:112"
          className="flex-1 min-h-[44px] rounded-xl bg-[#960045] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:bg-[#7e003a] active:scale-95 transition-all text-center"
        >
          <PhoneCall className="w-4 h-4 text-white" />
          <span>{t('emergency.actionCall')}</span>
        </a>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 rounded-xl border border-[#960045]/30 text-[#960045] bg-white font-semibold text-xs hover:bg-[#960045]/10 transition-all cursor-pointer"
          >
            {t('emergency.dismiss')}
          </button>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 bg-[#0B1713]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      >
        <div className="w-full max-w-md">{content}</div>
      </div>
    );
  }

  return content;
};
