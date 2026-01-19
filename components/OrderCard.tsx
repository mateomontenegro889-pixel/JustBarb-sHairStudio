import React from "react";
import { View, Pressable, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface OrderCardProps {
  orderText: string;
  timestamp: string;
  staffName: string;
  tableNumber?: number | null;
  guestCount?: number | null;
  status?: 'open' | 'closed';
  onPress: () => void;
}

export function OrderCard({
  orderText,
  timestamp,
  staffName,
  tableNumber,
  guestCount,
  status = 'open',
  onPress,
}: OrderCardProps) {
  const { theme } = useTheme();
  const isOpen = status === 'open';
  const accentColor = isOpen ? theme.primary : theme.success;

  return (
    <Pressable 
      onPress={onPress} 
      style={({ pressed }) => [
        { opacity: pressed ? 0.8 : 1 },
        Platform.OS === 'web' ? { cursor: 'pointer' } : {},
      ]}
    >
      <Card accentColor={accentColor} style={styles.card}>
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.headerRow}>
              <View style={styles.tableInfo}>
                {tableNumber ? (
                  <View style={[styles.tableBadge, { backgroundColor: theme.backgroundSecondary }]}>
                    <Feather name="grid" size={12} color={theme.primary} />
                    <ThemedText style={[styles.badgeText, { color: theme.primary }]}>
                      Table {tableNumber}
                    </ThemedText>
                  </View>
                ) : null}
                {guestCount ? (
                  <View style={[styles.tableBadge, { backgroundColor: theme.backgroundSecondary }]}>
                    <Feather name="users" size={12} color={theme.textSecondary} />
                    <ThemedText style={[styles.badgeText, { color: theme.textSecondary }]}>
                      {guestCount}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: isOpen ? '#7C3AED20' : '#10B98120' }
              ]}>
                <ThemedText style={[
                  styles.statusText,
                  { color: isOpen ? theme.primary : theme.success }
                ]}>
                  {isOpen ? 'Open' : 'Completed'}
                </ThemedText>
              </View>
            </View>
            <ThemedText numberOfLines={2} style={styles.orderText}>
              {orderText}
            </ThemedText>
            <View style={styles.metadata}>
              <ThemedText type="caption" style={{ color: theme.textTertiary }}>
                {timestamp}
              </ThemedText>
              <View style={[styles.dot, { backgroundColor: theme.textTertiary }]} />
              <ThemedText type="caption" style={{ color: theme.textTertiary }}>
                {staffName}
              </ThemedText>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textTertiary} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  content: {
    flex: 1,
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tableInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  tableBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontWeight: "600",
    fontSize: 12,
  },
  orderText: {
    fontSize: 16,
    lineHeight: 22,
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
  },
});
