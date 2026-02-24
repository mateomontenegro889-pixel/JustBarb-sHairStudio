import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle, Platform } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface CardProps {
  elevation?: number;
  children: ReactNode;
  style?: ViewStyle;
  accentColor?: string;
}

export function Card({
  elevation = 1,
  children,
  style,
  accentColor,
}: CardProps) {
  const { theme, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundDefault,
          ...Platform.select({
            ios: {
              shadowColor: isDark ? "#000" : "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.08,
              shadowRadius: 8,
            },
            android: {
              elevation: 3,
            },
            web: {
              boxShadow: isDark
                ? "0 2px 8px rgba(0, 0, 0, 0.3)"
                : "0 2px 8px rgba(0, 0, 0, 0.08)",
            },
          }),
        },
        style,
      ]}
    >
      {accentColor ? (
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      ) : null}
      <View style={accentColor ? styles.cardContent : undefined}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: BorderRadius.md,
    borderBottomLeftRadius: BorderRadius.md,
  },
  cardContent: {
    paddingLeft: Spacing.lg,
  },
});
