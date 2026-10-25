import React, { useState } from 'react';
import {
  Printer,
  Share2,
  X,
  FileText,
  AlertTriangle,
  Calendar,
  Activity,
  Heart,
  Droplets,
  Check,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts';
import { useTranslation } from '../../context/LanguageContext';
import { DailyCheckIn, UserProfile } from '../../types';
import { calculateCycleData, formatDate, addDays, diffDays } from '../../utils/cycleCalculator';
import { runHealthPatternScreening, ScreeningResult } from '../../utils/screeningEngine';

interface DoctorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyLogs: Record<string, DailyCheckIn>;
  userProfile: UserProfile | null;
}

export const DoctorReportModal: React.FC<DoctorReportModalProps> = ({
  isOpen,
  onClose,
  dailyLogs,
  userProfile,
}) => {
  const { t } = useTranslation();
  const [copiedToast, setCopiedToast] = useState(false);

  if (!isOpen) return null;

  const todayStr = formatDate(new Date());
  const threeMonthsAgoStr = addDays(todayStr, -90);

  const cycleData = calculateCycleData(dailyLogs, userProfile, todayStr);
  const screening = runHealthPatternScreening(dailyLogs, userProfile, todayStr);

  // Filter logs for last 3 months
  const recentLogs = Object.entries(dailyLogs)
    .filter(([date]) => diffDays(date, threeMonthsAgoStr) >= 0)
    .sort(([a], [b]) => a.localeCompare(b));

  // Compute 3-month cycle summary
  const cycleStarts = cycleData.cycleStartDates.filter((d) => diffDays(d, threeMonthsAgoStr) >= -30);
  const completedCycles: {
    start: string;
    end: string;
    length: number;
    bleedingDays: number;
    maxPain: number;
    heavyDays: number;
  }[] = [];

  for (let i = 0; i < cycleStarts.length; i++) {
    const start = cycleStarts[i];
    const nextStart = cycleStarts[i + 1] || addDays(start, cycleData.cycleLength);
    const length = diffDays(nextStart, start);
    const end = addDays(nextStart, -1);

    const logsInThisCycle = Object.entries(dailyLogs).filter(
      ([d]) => diffDays(d, start) >= 0 && diffDays(end, d) >= 0
    );

    const bleedingDays = Math.max(
      logsInThisCycle.filter(([_, l]) => l.flow && l.flow !== 'none').length,
      userProfile?.averagePeriodLength || 5
    );
    const heavyDays = logsInThisCycle.filter(([_, l]) => l.flow === 'heavy').length;
    const pains = logsInThisCycle.map(([_, l]) => l.painLevel);
    const maxPain = pains.length > 0 ? Math.max(...pains) : 0;

    completedCycles.push({
      start,
      end,
      length,
      bleedingDays,
      maxPain,
      heavyDays,
    });
  }

  // Symptoms frequency in last 3 months
  const symptomCounts: Record<string, number> = {};
  let totalHeavyDays = 0;
  let maxPainRecorded = 0;
  let painSum = 0;
  let painCount = 0;

  recentLogs.forEach(([_, l]) => {
    if (l.flow === 'heavy') totalHeavyDays++;
    if (l.painLevel !== undefined) {
      painSum += l.painLevel;
      painCount++;
      if (l.painLevel > maxPainRecorded) maxPainRecorded = l.painLevel;
    }
    (l.symptoms || []).forEach((s) => {
      symptomCounts[s] = (symptomCounts[s] || 0) + 1;
    });
  });

  const avgRecentPain = painCount > 0 ? +(painSum / painCount).toFixed(1) : 0;
  const sortedSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Mini chart data
  const miniChartData = completedCycles.slice(-4).map((c, idx) => ({
    name: `C${idx + 1}`,
    length: c.length,
  }));

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const summaryText = `SwaCare Health Report (3 Months):
- Average Cycle Length: ${cycleData.cycleLength} days
- Average Period: ${cycleData.periodLength} days
- Max Pain Recorded: ${maxPainRecorded}/10
- Heavy Flow Days: ${totalHeavyDays}
- Active Pattern Flags: ${screening.flags.length > 0 ? screening.flags.map((f) => t(f.titleKey)).join(', ') : 'None'}
Generated from self-reported data.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SwaCare Doctor Report',
          text: summaryText,
        });
      } catch {
        // Fallback to clipboard
        copyToClipboard(summaryText);
      }
    } else {
      copyToClipboard(summaryText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#0B1713]/85 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-y-auto print:p-0 print:bg-white"
    >
      <div className="bg-white w-full max-w-2xl max-h-[96vh] sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
        {/* MODAL CONTROL HEADER (HIDDEN ON PRINT) */}
        <div className="print:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-[#E6E8F3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F73F8B] text-white flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0C1F78]">
                {t('report.modalTitle')}
              </h2>
              <p className="text-[11px] text-[#0B1713]/60">
                {t('report.modalSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="min-h-[38px] px-3 rounded-xl bg-[#0C1F78] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#081552] transition-all cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('report.downloadPdfCTA')}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="min-h-[38px] px-3 rounded-xl border border-[#E6E8F3] bg-[#F7F8FC] text-[#0C1F78] font-semibold text-xs flex items-center gap-1.5 hover:bg-[#E6E8F3] transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#0C1F78]" />
              <span>{t('report.shareCTA')}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#F7F8FC] border border-[#E6E8F3] text-[#0C1F78] flex items-center justify-center hover:bg-[#E6E8F3] transition-all cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-[#0C1F78]" />
            </button>
          </div>
        </div>

        {copiedToast && (
          <div className="print:hidden bg-[#0C1F78] text-white text-xs font-semibold py-1.5 px-4 text-center">
            {t('report.copiedNotice')}
          </div>
        )}

        {/* PRINTABLE CLINICAL SUMMARY CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-[#0B1713] print:p-6 print:overflow-visible">
          {/* 1. DOCUMENT HEADER */}
          <div className="border-b-2 border-[#E6E8F3] pb-4 flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F73F8B]">
                {t('report.headerBadge')}
              </span>
              <h1 className="text-xl font-extrabold text-[#0C1F78] mt-0.5">
                {t('report.documentTitle')}
              </h1>
              <p className="text-xs text-[#0B1713]/70 mt-1">
                {t('report.periodRange', {
                  start: threeMonthsAgoStr,
                  end: todayStr,
                })}
              </p>
            </div>

            <div className="text-right">
              <div className="text-base font-bold text-[#F73F8B] leading-none">
                SwaCare
              </div>
              <div className="text-[10px] text-[#0B1713]/60 mt-1">
                {userProfile?.age ? `${userProfile.age} ${t('common.years')}` : 'Companion Log'}
              </div>
              <div className="text-[10px] text-[#0B1713]/50">
                {todayStr}
              </div>
            </div>
          </div>

          {/* 2. THREE-MONTH CYCLE & BLEEDING METRICS STRIP */}
          <div className="grid grid-cols-4 gap-2.5 text-center">
            <div className="p-3 rounded-2xl bg-[#F7F8FC] border border-[#E6E8F3]">
              <span className="text-[10px] font-bold text-[#0B1713]/60 uppercase block">
                {t('report.avgCycleLength')}
              </span>
              <div className="text-lg font-extrabold text-[#0C1F78] mt-1 tabular-nums">
                {cycleData.cycleLength} <span className="text-xs font-normal">d</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7F8FC] border border-[#E6E8F3]">
              <span className="text-[10px] font-bold text-[#0B1713]/60 uppercase block">
                {t('report.avgPeriodDuration')}
              </span>
              <div className="text-lg font-extrabold text-[#0C1F78] mt-1 tabular-nums">
                {cycleData.periodLength} <span className="text-xs font-normal">d</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7F8FC] border border-[#E6E8F3]">
              <span className="text-[10px] font-bold text-[#0B1713]/60 uppercase block">
                {t('report.maxPainScore')}
              </span>
              <div className={`text-lg font-extrabold mt-1 tabular-nums ${maxPainRecorded >= 7 ? 'text-[#960045]' : 'text-[#0C1F78]'}`}>
                {maxPainRecorded} <span className="text-xs font-normal">/10</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7F8FC] border border-[#E6E8F3]">
              <span className="text-[10px] font-bold text-[#0B1713]/60 uppercase block">
                {t('report.heavyFlowDaysCount')}
              </span>
              <div className={`text-lg font-extrabold mt-1 tabular-nums ${totalHeavyDays >= 7 ? 'text-[#960045]' : 'text-[#0C1F78]'}`}>
                {totalHeavyDays} <span className="text-xs font-normal">days</span>
              </div>
            </div>
          </div>

          {/* 3. CYCLE HISTORY TABLE & MINI CHART */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Table */}
            <div className="md:col-span-2 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0C1F78]">
                {t('report.cycleHistoryTableTitle')}
              </h3>
              <div className="border border-[#E6E8F3] rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F7F8FC] text-[#0C1F78] font-bold border-b border-[#E6E8F3]">
                      <th className="p-2.5">{t('report.tableCycle')}</th>
                      <th className="p-2.5">{t('report.tableDates')}</th>
                      <th className="p-2.5 text-center">{t('report.tableLength')}</th>
                      <th className="p-2.5 text-center">{t('report.tableBleeding')}</th>
                      <th className="p-2.5 text-center">{t('report.tableMaxPain')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E8F3]">
                    {completedCycles.map((c, i) => (
                      <tr key={c.start} className="hover:bg-[#F7F8FC]">
                        <td className="p-2.5 font-bold text-[#0C1F78]">Cycle {i + 1}</td>
                        <td className="p-2.5 text-[11px] text-[#0B1713]/80">
                          {c.start} → {c.end}
                        </td>
                        <td className="p-2.5 text-center font-bold text-[#0C1F78] tabular-nums">
                          {c.length}d
                        </td>
                        <td className="p-2.5 text-center tabular-nums">
                          {c.bleedingDays}d {c.heavyDays > 0 ? `(${c.heavyDays}h)` : ''}
                        </td>
                        <td className={`p-2.5 text-center font-bold tabular-nums ${c.maxPain >= 7 ? 'text-[#960045]' : 'text-[#0C1F78]'}`}>
                          {c.maxPain}/10
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mini Chart */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0C1F78]">
                {t('report.cycleLengthChartTitle')}
              </h3>
              <div className="h-36 p-2 rounded-2xl bg-[#F7F8FC] border border-[#E6E8F3] flex flex-col justify-end">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={miniChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#0C1F78' }} />
                    <YAxis domain={[20, 42]} tick={{ fontSize: 9, fill: '#0C1F78' }} />
                    <ReferenceLine y={cycleData.cycleLength} stroke="#F73F8B" strokeDasharray="3 3" />
                    <Bar dataKey="length" fill="#0C1F78" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 4. SYMPTOMS & PAIN PROFILE */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-[#F7F8FC] border border-[#E6E8F3] space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0C1F78]">
                {t('report.topSymptomsTitle')}
              </h3>
              {sortedSymptoms.length > 0 ? (
                <div className="space-y-1 text-xs">
                  {sortedSymptoms.map(([sym, count]) => (
                    <div key={sym} className="flex justify-between items-center py-0.5">
                      <span className="font-medium text-[#0B1713]">
                        {t(`checkin.symptom${sym.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`)}
                      </span>
                      <span className="font-bold text-[#0C1F78] bg-white px-2 py-0.5 rounded border border-[#E6E8F3] text-[11px]">
                        {count} days
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#0B1713]/60 italic">
                  {t('report.noSymptomsLogged')}
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F8FC] border border-[#E6E8F3] space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0C1F78]">
                {t('report.painSummaryTitle')}
              </h3>
              <div className="space-y-1 text-xs text-[#0B1713]">
                <div className="flex justify-between">
                  <span>{t('report.averagePainLabel')}:</span>
                  <span className="font-bold text-[#0C1F78]">{avgRecentPain} / 10</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('report.peakPainLabel')}:</span>
                  <span className={`font-bold ${maxPainRecorded >= 7 ? 'text-[#960045]' : 'text-[#0C1F78]'}`}>
                    {maxPainRecorded} / 10
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t('report.heavyBleedingDaysLabel')}:</span>
                  <span className={`font-bold ${totalHeavyDays >= 7 ? 'text-[#960045]' : 'text-[#0C1F78]'}`}>
                    {totalHeavyDays} days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. ACTIVE HEALTH PATTERN SCREENING FLAGS (CLINICAL DISCUSSION TOPICS) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0C1F78] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#F73F8B]" />
              <span>{t('report.screeningFlagsTitle')}</span>
            </h3>

            {screening.flags.length > 0 ? (
              <div className="space-y-2">
                {screening.flags.map((flag) => {
                  const isCritical = flag.severity === 'see_doctor';
                  return (
                    <div
                      key={flag.id}
                      className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                        isCritical
                          ? 'bg-[#960045]/5 border-[#960045]/40 text-[#0B1713]'
                          : 'bg-[#F7F8FC] border-[#E6E8F3] text-[#0B1713]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className={`font-bold ${isCritical ? 'text-[#960045]' : 'text-[#0C1F78]'}`}>
                          {t(flag.titleKey)}
                        </strong>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isCritical ? 'bg-[#960045] text-white' : 'bg-[#FF6FAE] text-[#0C1F78]'
                          }`}
                        >
                          {isCritical ? t('screening.severityDoctor') : t('screening.severityAttention')}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#0B1713]/90 leading-snug">
                        {t(flag.whatWeNoticedKey, flag.whatWeNoticedParams)}
                      </p>
                      <div className="text-[10px] text-[#0B1713]/70 pt-0.5">
                        <strong className="text-[#0C1F78]">Next Step:</strong> {t(flag.nextStepKey)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#F7F8FC] border border-[#E6E8F3] text-xs text-[#0B1713] flex items-center gap-2">
                <Check className="w-4 h-4 text-[#0C1F78]" />
                <span>{t('report.noActiveFlagsNotice')}</span>
              </div>
            )}
          </div>

          {/* 6. MANDATORY LEGAL / MEDICAL DISCLAIMER FOOTER */}
          <div className="pt-4 border-t-2 border-[#E6E8F3] text-center">
            <p className="text-[11px] font-bold text-[#0C1F78] uppercase tracking-wider">
              {t('report.mandatoryFooter')}
            </p>
            <p className="text-[10px] text-[#0B1713]/60 mt-0.5">
              {t('disclaimer.text')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
