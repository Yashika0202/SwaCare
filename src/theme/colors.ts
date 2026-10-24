/**
 * Strict Design System Colors for Women's Health Companion
 * 
 * Rules:
 * - Primary: hot pink #F73F8B (buttons, active states, period days)
 * - Secondary accent: light pink #FF6FAE (highlights, chips, predicted period)
 * - Navy #0C1F78 (headings, app bar, icons)
 * - Crimson #960045 (alerts, warnings, high pain or heavy flow only)
 * - Ink #0B1713 (body text)
 * - App background: very soft pink #FFF5F9
 * 
 * CRITICAL RULE: Use navy or ink text on light pink, NEVER white.
 */

export const THEME_COLORS = {
  primary: '#F73F8B',      // Hot pink: buttons, active states, period days
  secondary: '#FF6FAE',    // Light pink: highlights, chips, predicted period
  navy: '#0C1F78',         // Navy: headings, app bar, icons
  crimson: '#960045',      // Crimson: alerts, warnings, high pain or heavy flow only
  ink: '#0B1713',          // Ink: body text
  appBg: '#FFF5F9',        // Very soft pink: app background
} as const;

export type ThemeColorKey = keyof typeof THEME_COLORS;

/**
 * Pre-composed Tailwind class combinations enforcing contrast guidelines:
 * Specifically ensuring light pink surfaces always pair with navy or ink text.
 */
export const THEME_STYLES = {
  primaryButton: 'bg-[#F73F8B] text-white hover:bg-[#e02f78] active:scale-[0.98] transition-all shadow-sm font-semibold',
  secondaryChip: 'bg-[#FF6FAE] text-[#0C1F78] font-medium transition-colors', // Navy on light pink
  secondaryChipInk: 'bg-[#FF6FAE] text-[#0B1713] font-medium transition-colors', // Ink on light pink
  warningAlert: 'bg-[#960045]/10 border border-[#960045]/20 text-[#960045]',
  headingText: 'text-[#0C1F78] font-bold tracking-tight',
  subheadingText: 'text-[#0C1F78]/80 font-semibold',
  bodyText: 'text-[#0B1713]',
  mutedText: 'text-[#0B1713]/65',
  card: 'bg-white rounded-2xl shadow-sm border border-[#FF6FAE]/20 p-4 transition-all',
  highlightCard: 'bg-[#FFF5F9] rounded-2xl border border-[#FF6FAE]/30 p-4',
} as const;
