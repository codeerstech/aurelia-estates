import type { CSSProperties } from 'react'
import type { ThemeTokens } from './types'

export const theme: ThemeTokens = {
  colors: {
    background: '#f7f3ec',
    surface: '#ffffff',
    surfaceSoft: '#fbf7ef',
    text: '#4f473e',
    muted: '#7c7065',
    heading: '#1f1a16',
    line: '#e4d8c8',
    accent: '#b48443',
    accentDark: '#805b2d',
    accentSoft: '#ead7b8',
    dark: '#17120e',
    darkSoft: '#2b2119',
    gold: '#d2a65f',
  },
  radii: {
    card: '8px',
    control: '8px',
    pill: '999px',
  },
  shadows: {
    card: '0 18px 50px rgba(31, 26, 22, 0.10)',
    lift: '0 26px 70px rgba(31, 26, 22, 0.18)',
  },
  layout: {
    container: '1180px',
  },
}

export function themeStyle() {
  return {
    '--color-background': theme.colors.background,
    '--color-surface': theme.colors.surface,
    '--color-surface-soft': theme.colors.surfaceSoft,
    '--color-text': theme.colors.text,
    '--color-muted': theme.colors.muted,
    '--color-heading': theme.colors.heading,
    '--color-line': theme.colors.line,
    '--color-accent': theme.colors.accent,
    '--color-accent-dark': theme.colors.accentDark,
    '--color-accent-soft': theme.colors.accentSoft,
    '--color-dark': theme.colors.dark,
    '--color-dark-soft': theme.colors.darkSoft,
    '--color-gold': theme.colors.gold,
    '--radius-card': theme.radii.card,
    '--radius-control': theme.radii.control,
    '--radius-pill': theme.radii.pill,
    '--shadow-card': theme.shadows.card,
    '--shadow-lift': theme.shadows.lift,
    '--container': theme.layout.container,
  } as CSSProperties
}
