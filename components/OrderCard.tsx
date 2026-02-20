import React from "react";
import { View, Pressable, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { ORDER_STATUS_CONFIG } from "@/types/order";

interface OrderCardProps {
  orderText: string;
  timestamp: string;
  staffName: string;
  tableNumber?: number | null;
  guestCount?: number | null;
  status?: string;
  onPress: () => void;
}

export function OrderCard({
  orderText,
  timestamp,
  staffName,
  tableNumber,
  guestCount,
  status = 'new',
  onPress,
}: OrderCardProps) {
  const { theme } = useTheme();
  const statusConfig = ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG['new'];

  return (
    <Pressable 
      onPress={onPress} 
      style={({ pressed }) => [
        { opacity: pressed ? 0.8 : 1 },
        Platform.OS === 'web' ? { cursor: 'pointer' } : {},
      ]}
    >
      <Card style={styles.card}>
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.headerRow}>
              <View style={styles.tableInfo}>
                {tableNumber ? (
                  <View style={[styles.tableBadge, { backgroundColor: theme.primarySoft }]}>
                    <Feather name="grid" size={11} color={theme.primary} />
                    <ThemedText style={[styles.badgeText, { color: theme.primary }]}>
                      T{tableNumber}
                    </ThemedText>
                  </View>
                ) : null}
                {guestCount ? (
                  <View style={[styles.tableBadge, { backgroundColor: theme.backgroundSecondary }]}>
                    <Feather name="users" size={11} color={theme.textSecondary} />
                    <ThemedText style={[styles.badgeText, { color: theme.textSecondary }]}>
                      {guestCount}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                <Feather name={statusConfig.icon as any} size={10} color={statusConfig.color} />
                <ThemedText style={[styles.statusText, { color: statusConfig.color }]}>
                  {statusConfig.label}
                </ThemedText>
              </View>
            </View>
            <ThemedText numberOfLines={2} style={styles.orderText}>
              {orderText}
            </ThemedText>
            <View style={styles.metadata}>
              <Feather name="clock" size={11} color={theme.textTertiary} />
              <ThemedText type="caption" style={{ color: theme.textTertiary }}>
                {timestamp}
              </ThemedText>
              <View style={[styles.dot, { backgroundColor: theme.textTertiary }]} />
              <Feather name="user" size={11} color={theme.textTertiary} />
              <ThemedText type="caption" style={{ color: theme.textTertiary }}>
                {staffName}
              </ThemedText>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color={theme.textTertiary} />
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
    gap: 6,
  },
  tableBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontWeight: "600",
    fontSize: 11,
  },
  orderText: {
    fontSize: 15,
    lineHeight: 21,
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
  },
});
