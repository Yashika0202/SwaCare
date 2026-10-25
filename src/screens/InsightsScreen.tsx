import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  LineChart as LineChartIcon,
  TrendingUp,
  Shield,
  Sparkles,
  AlertCircle,
  Activity,
  Heart,
  Moon,
  Zap,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  Eye,
  FileText,
  Check,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { storage } from '../storage/localStorage';
import { DailyCheckIn, UserProfile } from '../types';
import {
  computeInsightsAnalytics,
  getSampleInsightsData,
  InsightsData,
} from '../utils/insightsAnalytics';
import { runHealthPatternScreening } from '../utils/screeningEngine';
import { DoctorReportModal } from '../components/report/DoctorReportModal';
import { generateSixCycleDemoData } from '../utils/demoData';

export const InsightsScreen: React.FC = () => {
  const { t } = useTranslation();

  const [useSampleData, setUseSampleData] = useState<boolean>(false);
  const [simulateAwarenessAlert, setSimulateAwarenessAlert] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [allLogs, setAllLogs] = useState<Record<string, DailyCheckIn>>({});
  const [isDoctorReportOpen, setIsDoctorReportOpen] = useState<boolean>(false);

  useEffect(() => {
    const logs = storage.get<Record<string, DailyCheckIn>>('daily_logs', {});
    const profile = storage.get<UserProfile | null>('user_profile', null);
    setAllLogs(logs);
    setUserProfile(profile);

    // If user has no logs yet, default to sample data so charts and features are immediately visible and testable
    if (Object.keys(logs).length < 3) {
      setUseSampleData(true);
    }
  }, []);

  const demoData = generateSixCycleDemoData();
  const activeLogs = useSampleData ? demoData.dailyLogs : allLogs;
  const activeProfile = useSampleData ? demoData.profile : userProfile;

  const realData = computeInsightsAnalytics(allLogs, userProfile);
  const sampleData = getSampleInsightsData();

  // Active data to render
  const activeData: InsightsData = useSampleData ? sampleData : realData;

  // Screening engine run on active data
  const screening = runHealthPatternScreening(activeLogs, activeProfile);

  // Modify awareness triggers if test simulation is active
  const isAwarenessTriggered =
    simulateAwarenessAlert || activeData.awarenessNotice.isTriggered;
  const activeTriggers = simulateAwarenessAlert
    ? [
        'insights.awareness.triggerHighVariance',
        'insights.awareness.triggerSeverePain',
      ]
    : activeData.awarenessNotice.triggers;

  // Custom Recharts Tooltip styled with design system
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl border border-[#E6E8F3] shadow-md text-xs space-y-1">
          <p className="font-bold text-[#0C1F78]">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-semibold flex items-center gap-1.5">
              <span>{entry.name}:</span>
              <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5 pb-20 animate-fadeIn">
      {/* 1. SCREEN HEADER & DEMO SWITCHER */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#E6E8F3]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#FF6FAE] text-[#0C1F78]">
              {t('insights.tag')}
            </span>
            <h2 className="text-xl font-bold text-[#0C1F78] mt-1.5">
              {t('insights.title')}
            </h2>
            <p className="text-xs text-[#0B1713]/80 mt-1 leading-relaxed">
              {t('insights.subtitle')}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#F7F8FC] border border-[#E6E8F3] flex items-center justify-center shrink-0">
            <LineChartIcon className="w-5 h-5 text-[#0C1F78]" />
          </div>
        </div>

        {/* Doctor Report CTA Action Strip */}
        <div className="mt-4 pt-3.5 border-t border-[#E6E8F3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F7F8FC] border border-[#E6E8F3] text-[#0C1F78] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-[#0C1F78]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0C1F78]">
                {t('report.doctorReportCTA')}
              </h4>
              <p className="text-[11px] text-[#0B1713]/70">
                {t('report.doctorReportSubtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDoctorReportOpen(true)}
            className="min-h-[40px] px-4 rounded-xl bg-[#F73F8B] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#e02f78] active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t('report.modalTitle')}</span>
          </button>
        </div>

        {/* Data mode banner / toggle */}
        <div className="mt-3 pt-3 border-t border-[#E6E8F3] flex flex-wrap items-center justify-between gap-2">
          {useSampleData ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#FF6FAE] text-[#0C1F78]">
                {t('insights.emptyState.showingSampleBadge')}
              </span>
              <button
                type="button"
                onClick={() => setUseSampleData(false)}
                className="text-xs font-semibold text-[#0C1F78] underline hover:text-[#F73F8B] cursor-pointer"
              >
                {t('insights.emptyState.switchToMyDataCTA')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#0C1F78]">
                {Object.keys(allLogs).length} check-ins recorded
              </span>
              <button
                type="button"
                onClick={() => setUseSampleData(true)}
                className="text-xs font-semibold text-[#0C1F78] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{t('insights.emptyState.exploreSampleCTA')}</span>
              </button>
            </div>
          )}

          {/* Simulate Alert toggle for testing the crimson awareness card */}
          <button
            type="button"
            onClick={() => setSimulateAwarenessAlert((prev) => !prev)}
            className={`text-[11px] font-semibold px-2 py-1 rounded-md border transition-all cursor-pointer ${
              simulateAwarenessAlert
                ? 'bg-[#960045] text-white border-[#960045]'
                : 'bg-[#F7F8FC] text-[#960045] border-[#960045]/30 hover:bg-[#960045]/10'
            }`}
          >
            {simulateAwarenessAlert ? 'Simulated Alert Active' : 'Test Awareness Card'}
          </button>
        </div>
      </section>

      {/* 2. HEALTH PATTERN SCREENING SECTION (TOP OF INSIGHTS TAB) */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#E6E8F3] space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                screening.hasCriticalFlags
                  ? 'bg-[#960045] text-white shadow-xs'
                  : 'bg-[#F7F8FC] border border-[#E6E8F3] text-[#0C1F78]'
              }`}
            >
              {screening.hasCriticalFlags ? (
                <AlertTriangle className="w-4 h-4 text-white" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-[#0C1F78]" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0C1F78]">
                {t('screening.sectionTitle')}
              </h3>
              <p className="text-[11px] text-[#0B1713]/70">
                {t('screening.sectionSubtitle')}
              </p>
            </div>
          </div>

          {screening.flags.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#FF6FAE] text-[#0C1F78] shrink-0">
              {t('screening.activeFlagsCount', { count: screening.flags.length })}
            </span>
          )}
        </div>

        {/* Screening Flags or Positive Reassurance Message */}
        {screening.flags.length > 0 ? (
          <div className="space-y-3 pt-1">
            {screening.flags.map((flag) => {
              const isSeeDoctor = flag.severity === 'see_doctor';
              return (
                <div
                  key={flag.id}
                  className={`p-4 rounded-2xl border space-y-2 transition-all ${
                    isSeeDoctor
                      ? 'bg-[#960045]/10 border-2 border-[#960045]/40 text-[#0B1713]'
                      : 'bg-[#F7F8FC] border border-[#E6E8F3] text-[#0B1713]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs font-bold ${
                        isSeeDoctor ? 'text-[#960045]' : 'text-[#0C1F78]'
                      }`}
                    >
                      {t(flag.titleKey)}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                        isSeeDoctor
                          ? 'bg-[#960045] text-white'
                          : 'bg-[#FF6FAE] text-[#0C1F78]'
                      }`}
                    >
                      {isSeeDoctor
                        ? t('screening.severityDoctor')
                        : flag.severity === 'attention'
                        ? t('screening.severityAttention')
                        : t('screening.severityInfo')}
                    </span>
                  </div>

                  <div className="text-xs text-[#0B1713] space-y-1">
                    <p>
                      <strong className={isSeeDoctor ? 'text-[#960045]' : 'text-[#0C1F78]'}>
                        {t('screening.whatWeNoticedLabel')}{' '}
                      </strong>
                      <span>{t(flag.whatWeNoticedKey, flag.whatWeNoticedParams)}</span>
                    </p>
                    <p className="text-[11px] text-[#0B1713]/80">
                      <strong className="text-[#0C1F78]">
                        {t('screening.timeframeLabel')}{' '}
                      </strong>
                      <span>{t(flag.timeframeKey, flag.timeframeParams)}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E6E8F3] text-xs text-[#0B1713]">
                    <strong className="text-[#0C1F78]">{t('screening.nextStepLabel')}{' '}</strong>
                    <span>{t(flag.nextStepKey)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#F7F8FC] border border-[#E6E8F3] flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FF6FAE] text-[#0C1F78] flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-[#0C1F78]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0C1F78]">
                {t('screening.positiveReassuranceTitle')}
              </h4>
              <p className="text-[11px] text-[#0B1713]/80 mt-0.5 leading-relaxed">
                {t('screening.positiveReassuranceDesc')}
              </p>
            </div>
          </div>
        )}

        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={() => setIsDoctorReportOpen(true)}
            className="text-xs font-bold text-[#0C1F78] hover:text-[#F73F8B] flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#0C1F78]" />
            <span>{t('report.modalTitle')} &rarr;</span>
          </button>
        </div>
      </section>

      {/* 2. RULE-BASED CRIMSON AWARENESS CARD (NO DIAGNOSIS, NO AI CLAIMS) */}
      {isAwarenessTriggered && (
        <section className="bg-[#960045]/5 border-2 border-[#960045]/40 rounded-3xl p-5 shadow-sm space-y-3 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#960045] text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#960045]">
                {t('insights.awareness.badge')}
              </span>
              <h3 className="text-base font-bold text-[#960045] leading-snug">
                {t('insights.awareness.crimsonTitle')}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-[#960045]/20 space-y-1.5 text-xs">
            <strong className="text-[#0C1F78] block mb-1">
              Observed Cycle Patterns:
            </strong>
            {activeTriggers.map((trigKey) => (
              <div key={trigKey} className="flex items-start gap-2 text-[#0B1713]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#960045] shrink-0 mt-1.5" />
                <span>{t(trigKey)}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-[#0B1713]/70 leading-relaxed italic">
            {t('insights.awareness.disclaimer')}
          </p>
        </section>
      )}

      {/* 3. KEY INSIGHT CARDS (PLAIN SIMPLE LANGUAGE GENERATED FROM DATA) */}
      <section className="space-y-2.5">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="w-4 h-4 text-[#0C1F78]" />
          <h3 className="text-sm font-bold text-[#0C1F78]">
            {t('insights.cards.sectionTitle')}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeData.insightCards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-2xl p-4 border border-[#E6E8F3] shadow-xs flex items-start gap-3 hover:shadow-sm transition-all"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white shadow-2xs"
                style={{ backgroundColor: card.accentColor }}
              >
                {card.type === 'cycle' && <Calendar className="w-4 h-4" />}
                {card.type === 'pain' && <Heart className="w-4 h-4" />}
                {card.type === 'energy' && <Zap className="w-4 h-4" />}
                {card.type === 'sleep' && <Moon className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#0B1713] leading-relaxed">
                  {t(card.textKey, card.params)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CHART 1: CYCLE LENGTH TREND (BAR CHART OF LAST 6 CYCLES WITH AVERAGE LINE) */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#E6E8F3] space-y-3">
        <div>
          <h3 className="text-base font-bold text-[#0C1F78]">
            {t('insights.charts.chart1Title')}
          </h3>
          <p className="text-xs text-[#0B1713]/70">
            {t('insights.charts.chart1Subtitle')}
          </p>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activeData.cycles}
              margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E8F3" />
              <XAxis
                dataKey="cycleName"
                tick={{ fill: '#0C1F78', fontSize: 11, fontWeight: 500 }}
                axisLine={{ stroke: '#E6E8F3' }}
                tickLine={false}
              />
              <YAxis
                domain={[20, 38]}
                tick={{ fill: '#0C1F78', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <ReferenceLine
                y={activeData.averageCycleLength}
                stroke="#F73F8B"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: t('insights.charts.chart1Average', { avg: activeData.averageCycleLength }),
                  fill: '#0C1F78',
                  position: 'top',
                  fontSize: 11,
                  fontWeight: 'bold',
                }}
              />
              {/* Navy main series */}
              <Bar
                dataKey="length"
                name="Cycle Length (Days)"
                fill="#0C1F78"
                radius={[8, 8, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 5. CHART 2: PERIOD DURATION & FLOW PER CYCLE */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#E6E8F3] space-y-3">
        <div>
          <h3 className="text-base font-bold text-[#0C1F78]">
            {t('insights.charts.chart2Title')}
          </h3>
          <p className="text-xs text-[#0B1713]/70">
            {t('insights.charts.chart2Subtitle')}
          </p>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activeData.cycles}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E8F3" />
              <XAxis
                dataKey="cycleName"
                tick={{ fill: '#0C1F78', fontSize: 11, fontWeight: 500 }}
                axisLine={{ stroke: '#E6E8F3' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 8]}
                tick={{ fill: '#0C1F78', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
              {/* Main series: Navy #0C1F78 */}
              <Bar
                dataKey="periodDuration"
                name={t('insights.charts.chart2BleedingDays')}
                fill="#0C1F78"
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
              {/* Secondary series: Crimson #960045 */}
              <Bar
                dataKey="heavyFlowDays"
                name={t('insights.charts.chart2HeavyDays')}
                fill="#960045"
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 6. CHART 3: PAIN TREND ACROSS CYCLE DAYS */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#E6E8F3] space-y-3">
        <div>
          <h3 className="text-base font-bold text-[#0C1F78]">
            {t('insights.charts.chart3Title')}
          </h3>
          <p className="text-xs text-[#0B1713]/70">
            {t('insights.charts.chart3Subtitle')}
          </p>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={activeData.painByDay}
              margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E8F3" />
              <XAxis
                dataKey="cycleDay"
                tick={{ fill: '#0C1F78', fontSize: 10 }}
                tickFormatter={(val) => `D${val}`}
                interval={3}
                axisLine={{ stroke: '#E6E8F3' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
                tick={{ fill: '#0C1F78', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <ReferenceLine
                y={8}
                stroke="#960045"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: t('insights.charts.chart3SevereThreshold'),
                  fill: '#960045',
                  position: 'insideTopRight',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
              />
              {/* Navy main series */}
              <Area
                type="monotone"
                dataKey="averagePain"
                name="Average Pain Score"
                stroke="#0C1F78"
                strokeWidth={2.5}
                fill="#0C1F78"
                fillOpacity={0.12}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 7. CHART 4: MOOD, ENERGY & SLEEP PATTERNS BY CYCLE PHASE */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#E6E8F3] space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#0C1F78]">
            {t('insights.charts.chart4Title')}
          </h3>
          <p className="text-xs text-[#0B1713]/70">
            {t('insights.charts.chart4Subtitle')}
          </p>
        </div>

        {/* Phase Breakdown Cards with Dominant Mood */}
        <div className="grid grid-cols-2 gap-2.5">
          {activeData.phasePatterns.map((p) => (
            <div
              key={p.phase}
              className="bg-[#F7F8FC] rounded-2xl p-3 border border-[#E6E8F3] space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0C1F78]">
                  {t(p.phaseNameKey)}
                </span>
                <span className="text-base" role="img" aria-label="mood">
                  {p.dominantMoodEmoji}
                </span>
              </div>

              <div className="text-[11px] text-[#0B1713]/70 space-y-0.5">
                <div className="flex justify-between">
                  <span>{t('insights.charts.chart4Sleep')}:</span>
                  <span className="font-bold text-[#0C1F78]">{p.avgSleepHours}h</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('insights.charts.chart4Energy')}:</span>
                  <span className="font-bold text-[#0C1F78]">{p.avgEnergyScore}/3</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparative Chart of Sleep and Energy across phases */}
        <div className="h-52 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activeData.phasePatterns}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E8F3" />
              <XAxis
                dataKey="phase"
                tick={{ fill: '#0C1F78', fontSize: 10, fontWeight: 500 }}
                tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1, 4)}
                axisLine={{ stroke: '#E6E8F3' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fill: '#0C1F78', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
              {/* Navy main series */}
              <Bar
                dataKey="avgSleepHours"
                name={t('insights.charts.chart4Sleep')}
                fill="#0C1F78"
                radius={[6, 6, 0, 0]}
                barSize={18}
              />
              {/* Light pink secondary series */}
              <Bar
                dataKey="avgEnergyScore"
                name={t('insights.charts.chart4Energy')}
                fill="#FF6FAE"
                radius={[6, 6, 0, 0]}
                barSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PMS & Mood Cycle Relationship Callout */}
        <div className="p-4 rounded-2xl bg-[#F7F8FC] border border-[#E6E8F3] space-y-1.5 pt-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0C1F78]" />
            <h4 className="text-xs font-bold text-[#0C1F78]">
              {t('insights.pms.sectionTitle')}
            </h4>
          </div>
          <p className="text-xs font-bold text-[#0B1713] leading-relaxed">
            {t('insights.cards.pmsMoodDip')}
          </p>
          <p className="text-[11px] text-[#0B1713]/70 leading-snug">
            {t('insights.pms.sectionSubtitle')}
          </p>
        </div>
      </section>

      {/* 8. MOST FREQUENT SYMPTOMS: RANKED LIST */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#E6E8F3] space-y-3">
        <div>
          <h3 className="text-base font-bold text-[#0C1F78]">
            {t('insights.charts.chart5Title')}
          </h3>
          <p className="text-xs text-[#0B1713]/70">
            {t('insights.charts.chart5Subtitle')}
          </p>
        </div>

        <div className="space-y-3 pt-1">
          {activeData.topSymptoms.map((item, idx) => (
            <div key={item.symptomKey} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0C1F78] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-[#F7F8FC] text-[#0C1F78] font-bold text-[10px] flex items-center justify-center border border-[#E6E8F3]">
                    #{idx + 1}
                  </span>
                  <span>
                    {t(
                      `checkin.symptom${item.symptomKey.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`
                    )}
                  </span>
                </span>
                <span className="font-semibold text-[#0B1713]/70 tabular-nums">
                  {t('insights.charts.symptomFrequency', {
                    count: item.count,
                    percent: item.percentage,
                  })}
                </span>
              </div>

              {/* Progress bar with Navy (#0C1F78) for main series */}
              <div className="w-full h-2.5 bg-[#F7F8FC] rounded-full overflow-hidden border border-[#E6E8F3]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    idx === 0 ? 'bg-[#0C1F78]' : 'bg-[#0C1F78]/50'
                  }`}
                  style={{ width: `${Math.max(8, item.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. MEDICAL DISCLAIMER CARD */}
      <section className="bg-white rounded-3xl p-4 border border-[#E6E8F3] shadow-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-[#0C1F78] shrink-0 mt-0.5" />
        <div className="text-xs text-[#0B1713] leading-relaxed">
          <strong className="text-[#0C1F78] block mb-0.5">
            {t('disclaimer.title')}
          </strong>
          {t('disclaimer.text')}
        </div>
      </section>

      {/* 10. DEVICE PRIVACY GUARANTEE */}
      <section className="rounded-3xl p-4 bg-[#F7F8FC] border border-[#E6E8F3] flex items-center gap-3">
        <Shield className="w-5 h-5 text-[#0C1F78] shrink-0" />
        <p className="text-xs text-[#0B1713] leading-tight">
          {t('insights.privacyNote')}
        </p>
      </section>

      {/* 11. DOCTOR REPORT MODAL (PRINTABLE 3-MONTH SUMMARY) */}
      <DoctorReportModal
        isOpen={isDoctorReportOpen}
        onClose={() => setIsDoctorReportOpen(false)}
        dailyLogs={activeLogs}
        userProfile={activeProfile}
      />
    </div>
  );
};
