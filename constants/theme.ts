import { Platform } from "react-native";

const tintColorLight = "#7C3AED";
const tintColorDark = "#A78BFA";

export const Colors = {
  light: {
    text: "#1F2937",
    textSecondary: "#6B7280",
    textTertiary: "#9CA3AF",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: tintColorLight,
    link: "#7C3AED",
    primary: "#7C3AED",
    primaryLight: "#A78BFA",
    secondary: "#6366F1",
    success: "#10B981",
    warning: "#F59E0B",
    recording: "#EF4444",
    error: "#EF4444",
    border: "#E5E7EB",
    backgroundRoot: "#F8F9FA",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F3F4F6",
    backgroundTertiary: "#E5E7EB",
    cardShadow: "rgba(0, 0, 0, 0.05)",
  },
  dark: {
    text: "#F9FAFB",
    textSecondary: "#D1D5DB",
    textTertiary: "#9CA3AF",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B7280",
    tabIconSelected: tintColorDark,
    link: "#A78BFA",
    primary: "#A78BFA",
    primaryLight: "#C4B5FD",
    secondary: "#818CF8",
    success: "#34D399",
    warning: "#FBBF24",
    recording: "#F87171",
    error: "#F87171",
    border: "#374151",
    backgroundRoot: "#111827",
    backgroundDefault: "#1F2937",
    backgroundSecondary: "#374151",
    backgroundTertiary: "#4B5563",
    cardShadow: "rgba(0, 0, 0, 0.3)",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 52,
  buttonHeight: 56,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  full: 9999,
};

export const Typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: "700" as const,
  },
  title1: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  title2: {
    fontSize: 22,
    fontWeight: "600" as const,
  },
  header: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  headline: {
    fontSize: 17,
    fontWeight: "600" as const,
  },
  title: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 17,
    fontWeight: "400" as const,
  },
  callout: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  subheadline: {
    fontSize: 15,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 17,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
