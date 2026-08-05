import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { Platform } from 'react-native';

export const colors = {
  // Paleta principal
  primary: '#28563d',
  primaryHover: '#1c422e',
  headerGreen: '#173526',
  highlightText: '#23432f',
  focusGreen: '#4d855f',
  accentGreen: '#79a04c',
  secondaryButton: '#e3ebe2',
  panelSurface: '#f1f4ed',
  borderLight: '#dce3db',
  borderDark: '#c9d2c9',
  textPrimary: '#1b2d26',
  textSecondary: '#657068',
  textSecondaryAlt: '#68756c',
  textOnGreen: '#d7e6d8',

  // Fondos
  background: '#eef2e8',
  mainSurface: '#fffdf7',

  // Estados
  positiveText: '#5f8d43',
  positiveBg: '#eef7e8',

  warningText: '#d4992f',
  warningBg: '#fff8e7',

  errorBorder: '#b04030',
  errorBg: '#fff1ed',
  errorText: '#852c20',
};

export const fonts = {
  base: Platform.select({
    web: 'Aptos, "Segoe UI", ui-sans-serif, system-ui, sans-serif',
    ios: 'Aptos',
    android: 'Aptos',
    default: 'sans-serif',
  }),
  display: Platform.select({
    web: '"Aptos Display", Aptos, "Segoe UI", sans-serif',
    ios: 'Aptos Display',
    android: 'Aptos Display',
    default: 'sans-serif',
  }),
};

export const spacing = {
  xs: 4,     // 0.25rem
  sm: 8,     // 0.5rem
  md: 12,    // 0.75rem
  lg: 16,    // 1rem
  xl: 20,    // 1.25rem
  xxl: 24,   // 1.5rem
  xxxl: 32,  // 2rem
  huge: 48,  // 3rem
};

export const borderRadius = {
  input: 8,       // 0.5rem
  button: 8,      // 0.5rem
  select: 12,     // 0.75rem
  modal: 16,      // 1rem
  card: 16,       // 1rem
  pill: 24,
  circle: 9999,   // circulares
};

export const layout = {
  breakpoint: 720,
  contentMaxWidthUnauth: 928, // 58rem
  contentMaxWidthAuth: 1440,  // 90rem
  mobileBrandPanelMinHeight: 260,
  desktopLoginMinCols: { left: 320, right: 280 },
  panelAccentBorderWidth: 3,
};

export const shadows = {
  modal: {
    shadowColor: 'rgb(23, 53, 38)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 32,
    elevation: 12,
  },
  focusRing: {
    borderColor: '#4d855f',
    borderWidth: 3,
  },
};

export const paperTheme = {
  ...DefaultTheme,
  roundness: borderRadius.button,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.secondaryButton,
    secondary: colors.accentGreen,
    secondaryContainer: colors.panelSurface,
    error: colors.errorBorder,
    errorContainer: colors.errorBg,
    warning: colors.warningText,
    warningContainer: colors.warningBg,
    background: colors.background,
    surface: colors.mainSurface,
    surfaceVariant: colors.panelSurface,
    onPrimary: '#FFFFFF',
    onSurface: colors.textPrimary,
    outline: colors.borderLight,
  },
};
