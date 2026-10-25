import React, { useState } from 'react';
import {
  X,
  BookOpen,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Share2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { MYTH_FACTS } from '../../utils/mythData';

interface FactsScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FactsScreen: React.FC<FactsScreenProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(MYTH_FACTS[0].id);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', labelKey: 'myths.catAll' },
    { id: 'periods', labelKey: 'myths.catPeriods' },
    { id: 'pain', labelKey: 'myths.catPain' },
    { id: 'fertility', labelKey: 'myths.catFertility' },
    { id: 'hormones', labelKey: 'myths.catHormones' },
  ];

  const filteredMyths =
    selectedCategory === 'all'
      ? MYTH_FACTS
      : MYTH_FACTS.filter((m) => m.category === selectedCategory);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#0B1713]/80 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fadeIn"
    >
      <div className="bg-[#F7F8FC] w-full max-w-lg max-h-[96vh] sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-[#E6E8F3]">
        {/* HEADER */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-[#E6E8F3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F73F8B] text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0C1F78]">
                {t('myths.screenTitle')}
              </h2>
              <p className="text-[11px] text-[#0B1713]/70">
                {t('myths.screenSubtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F7F8FC] border border-[#E6E8F3] text-[#0C1F78] flex items-center justify-center hover:bg-[#E6E8F3] active:scale-95 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-[#0C1F78]" />
          </button>
        </div>

        {/* CATEGORY TABS */}
        <div className="bg-white/80 px-4 py-2.5 border-b border-[#E6E8F3] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[34px] px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FF6FAE] text-[#0C1F78] font-bold shadow-xs'
                    : 'bg-white text-[#0B1713]/70 border border-[#E6E8F3] hover:border-[#FF6FAE]'
                }`}
              >
                {t(cat.labelKey)}
              </button>
            );
          })}
        </div>

        {/* FACT CARDS LIST */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {filteredMyths.map((item, idx) => {
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E6E8F3] shadow-xs overflow-hidden transition-all"
              >
                {/* Header Row: Myth preview */}
                <button
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                  className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-[#F7F8FC] transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#960045]/10 text-[#960045] uppercase tracking-wider">
                        {t('myths.mythBadge')} #{idx + 1}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#0C1F78] leading-snug">
                      "{t(item.mythKey)}"
                    </h3>
                  </div>

                  <div className="w-7 h-7 rounded-lg bg-[#F7F8FC] border border-[#E6E8F3] text-[#0C1F78] flex items-center justify-center shrink-0 mt-0.5">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#0C1F78]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#0C1F78]" />
                    )}
                  </div>
                </button>

                {/* Expanded Fact & Scientific Explanation */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 space-y-2.5 border-t border-[#E6E8F3] bg-[#F7F8FC]/50 animate-fadeIn">
                    {/* Fact Box */}
                    <div className="p-3 rounded-xl bg-white border border-[#E6E8F3] flex items-start gap-2.5 shadow-2xs">
                      <div className="w-6 h-6 rounded-md bg-[#0C1F78] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0C1F78] block">
                          {t('myths.factBadge')}
                        </span>
                        <p className="text-xs font-bold text-[#0B1713] mt-0.5 leading-snug">
                          {t(item.factKey)}
                        </p>
                      </div>
                    </div>

                    {/* Detailed Explanation */}
                    <div className="p-3 rounded-xl bg-white border border-[#E6E8F3] text-xs text-[#0B1713] leading-relaxed">
                      <strong className="text-[#0C1F78] block mb-1">
                        {t('myths.whyItMatters')}
                      </strong>
                      <p className="text-[#0B1713]/85">
                        {t(item.explanationKey)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="p-3.5 bg-white border-t border-[#E6E8F3] text-center">
          <p className="text-[11px] text-[#0B1713]/60">
            {t('myths.disclaimerNote')}
          </p>
        </div>
      </div>
    </div>
  );
};
