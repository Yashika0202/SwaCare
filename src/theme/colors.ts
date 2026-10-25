/**
 * Balanced and Premium Design System for Women's Health Companion
 * 
 * Strict proportion:
 * - 60% Neutral: App background #F7F8FC, cards #FFFFFF, dividers #E6E8F3
 * - 30% Navy & Ink: Navy #0C1F78 (app bar, headings, bottom nav, icons, dark hero card), Ink #0B1713 (body text)
 * - 10% Accents:
 *   - Hot pink #F73F8B: ONLY primary action buttons, logged period days, active tab indicator
 *   - Light pink #FF6FAE: small chips, predicted period days, secondary chart series
 *   - Crimson #960045: ONLY warnings and "see a doctor" flags
 * 
 * CRITICAL RULE: Never use pink as a large background colour anywhere.
 * Always pair light pink surfaces with navy (#0C1F78) or ink (#0B1713) text, NEVER white.
 */

export const THEME_COLORS = {
  primary: '#F73F8B',      // Hot pink: ONLY primary action buttons, logged period days, active tab indicator
  secondary: '#FF6FAE',    // Light pink: small chips, predicted period days, secondary chart series
  navy: '#0C1F78',         // Navy: app bar, headings, bottom navigation, icons, dark hero card
  crimson: '#960045',      // Crimson: ONLY warnings and "see a doctor" flags
  ink: '#0B1713',          // Ink: body text
  appBg: '#F7F8FC',        // Cool neutral off-white app background (60%)
  cardBg: '#FFFFFF',       // Clean white cards
  divider: '#E6E8F3',      // Soft dividers and borders
} as const;

export type ThemeColorKey = keyof typeof THEME_COLORS;

/**
 * Pre-composed Tailwind class combinations enforcing contrast and proportion guidelines:
 */
export const THEME_STYLES = {
  primaryButton: 'bg-[#F73F8B] text-white hover:bg-[#e02f78] active:scale-[0.98] transition-all shadow-sm font-bold',
  secondaryChip: 'bg-[#FF6FAE] text-[#0C1F78] font-bold transition-colors', // Navy on light pink
  secondaryChipInk: 'bg-[#FF6FAE] text-[#0B1713] font-bold transition-colors', // Ink on light pink
  neutralChip: 'bg-[#F7F8FC] border border-[#E6E8F3] text-[#0C1F78] font-medium transition-colors',
  warningAlert: 'bg-[#960045]/10 border border-[#960045]/30 text-[#960045]',
  headingText: 'text-[#0C1F78] font-bold tracking-tight',
  subheadingText: 'text-[#0C1F78]/80 font-semibold',
  bodyText: 'text-[#0B1713]',
  mutedText: 'text-[#0B1713]/65',
  card: 'bg-white rounded-3xl shadow-sm border border-[#E6E8F3] p-5 transition-all',
  darkHeroCard: 'bg-[#0C1F78] text-white rounded-3xl shadow-md p-6 relative overflow-hidden',
} as const;

