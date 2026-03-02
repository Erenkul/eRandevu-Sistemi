// eRandevu Renk Paleti - Material Design 3 uyumlu

export const colors = {
    // Primary Colors - Mavi tonları
    primary: '#1E3A8A',
    primaryLight: '#3B82F6',
    primaryDark: '#1E40AF',
    primaryContainer: '#DBEAFE',

    // Secondary Colors
    secondary: '#0EA5E9',
    secondaryLight: '#38BDF8',
    secondaryContainer: '#E0F2FE',

    // Accent Colors
    accent: '#10B981',
    accentLight: '#34D399',
    accentContainer: '#D1FAE5',

    // Neutral Colors
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceVariant: '#F1F5F9',
    outline: '#E2E8F0',
    outlineVariant: '#CBD5E1',

    // Text Colors
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textTertiary: '#94A3B8',
    textOnPrimary: '#FFFFFF',

    // Status Colors
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',

    // Chart Colors
    chartBlue: '#3B82F6',
    chartGreen: '#10B981',
    chartYellow: '#F59E0B',
    chartPurple: '#8B5CF6',
    chartPink: '#EC4899',

    // WhatsApp
    whatsapp: '#25D366',
} as const;

export type ColorKey = keyof typeof colors;
