import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { orderStore } from "@/utils/orderStore";
import { Order, ORDER_STATUS_CONFIG } from "@/types/order";

function StatCard({
  icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}) {
  const { theme } = useTheme();
  return (
    <Card style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: bgColor }]}>
        <Feather name={icon as any} size={18} color={color} />
      </View>
      <ThemedText style={[styles.statValue, { color: theme.text }]}>
        {value}
      </ThemedText>
      <ThemedText type="caption" style={{ color: theme.textSecondary }}>
        {label}
      </ThemedText>
    </Card>
  );
}

function TableCell({
  number,
  isActive,
  order,
  onPress,
}: {
  number: number;
  isActive: boolean;
  order?: Order;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const status = order?.status || "";
  const config = ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG["new"];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tableCell,
        {
          backgroundColor: isActive
            ? config.bgColor
            : theme.backgroundSecondary,
          borderColor: isActive ? config.color : "transparent",
          borderWidth: isActive ? 1.5 : 0,
          opacity: pressed ? 0.8 : 1,
        },
        Platform.OS === "web" ? { cursor: "pointer" } : {},
      ]}
    >
      <ThemedText
        style={[
          styles.tableNum,
          { color: isActive ? config.color : theme.textTertiary },
        ]}
      >
        {number}
      </ThemedText>
      {isActive ? (
        <View style={[styles.tableDot, { backgroundColor: config.color }]} />
      ) : null}
      {order?.guestCount ? (
        <ThemedText
          style={[
            styles.tableGuests,
            { color: isActive ? config.color : theme.textTertiary },
          ]}
        >
          {order.guestCount}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

export default function DashboardScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    activeTables: [] as number[],
    totalGuests: 0,
    avgOrdersPerHour: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [activeOrdersByTable, setActiveOrdersByTable] = useState<
    Map<number, Order>
  >(new Map());

  const loadData = useCallback(async () => {
    const [statsData, allOrders] = await Promise.all([
      orderStore.getStats(),
      orderStore.getAll(),
    ]);
    setStats(statsData);
    setRecentOrders(allOrders.slice(0, 5));

    const tableMap = new Map<number, Order>();
    allOrders.forEach((order) => {
      if (
        order.tableNumber &&
        order.status !== "completed" &&
        order.status !== "closed"
      ) {
        if (!tableMap.has(order.tableNumber)) {
          tableMap.set(order.tableNumber, order);
        }
      }
    });
    setActiveOrdersByTable(tableMap);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <ScreenScrollView contentContainerStyle={styles.container}>
      <LinearGradient
        colors={[theme.gradientStart, theme.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroContent}>
          <ThemedText style={styles.greeting}>{getTimeGreeting()}</ThemedText>
          <ThemedText style={styles.heroTitle}>
            {stats.activeOrders > 0
              ? `${stats.activeOrders} Active Order${stats.activeOrders !== 1 ? "s" : ""}`
              : "No Active Orders"}
          </ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            {stats.todayOrders} orders today | {stats.totalGuests} guests served
          </ThemedText>
        </View>
      </LinearGradient>

      <View style={styles.statsGrid}>
        <StatCard
          icon="clipboard"
          label="Today"
          value={stats.todayOrders}
          color="#6D28D9"
          bgColor="#EDE9FE"
        />
        <StatCard
          icon="activity"
          label="Active"
          value={stats.activeOrders}
          color="#D97706"
          bgColor="#FEF3C7"
        />
        <StatCard
          icon="check-circle"
          label="Done"
          value={stats.completedOrders}
          color="#059669"
          bgColor="#D1FAE5"
        />
        <StatCard
          icon="users"
          label="Guests"
          value={stats.totalGuests}
          color="#0284C7"
          bgColor="#E0F2FE"
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="title" style={{ color: theme.text }}>
            Table Overview
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {stats.activeTables.length}/12 active
          </ThemedText>
        </View>
        <Card style={styles.tableGrid}>
          <View style={styles.tableGridInner}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
              <TableCell
                key={num}
                number={num}
                isActive={stats.activeTables.includes(num)}
                order={activeOrdersByTable.get(num)}
                onPress={() => {
                  const order = activeOrdersByTable.get(num);
                  if (order) {
                    navigation.getParent()?.navigate("HistoryTab", {
                      screen: "OrderDetail",
                      params: { orderId: order.id },
                    });
                  }
                }}
              />
            ))}
          </View>
        </Card>
      </View>

      {recentOrders.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="title" style={{ color: theme.text }}>
              Recent Activity
            </ThemedText>
            <Pressable
              onPress={() => navigation.getParent()?.navigate("HistoryTab")}
              style={({ pressed }) => [
                { opacity: pressed ? 0.6 : 1 },
                Platform.OS === "web" ? { cursor: "pointer" } : {},
              ]}
            >
              <ThemedText
                style={{
                  color: theme.primary,
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                View All
              </ThemedText>
            </Pressable>
          </View>
          {recentOrders.map((order, index) => {
            const statusConfig =
              ORDER_STATUS_CONFIG[order.status || "new"] ||
              ORDER_STATUS_CONFIG["new"];
            return (
              <Pressable
                key={order.id}
                onPress={() => {
                  navigation.getParent()?.navigate("HistoryTab", {
                    screen: "OrderDetail",
                    params: { orderId: order.id },
                  });
                }}
                style={({ pressed }) => [
                  styles.activityItem,
                  {
                    backgroundColor: theme.backgroundDefault,
                    opacity: pressed ? 0.8 : 1,
                    borderBottomWidth: index < recentOrders.length - 1 ? 1 : 0,
                    borderBottomColor: theme.borderLight,
                  },
                  Platform.OS === "web" ? { cursor: "pointer" } : {},
                ]}
              >
                <View
                  style={[
                    styles.activityDot,
                    { backgroundColor: statusConfig.color },
                  ]}
                />
                <View style={styles.activityContent}>
                  <View style={styles.activityRow}>
                    <ThemedText style={styles.activityTitle} numberOfLines={1}>
                      {order.tableNumber
                        ? `Table ${order.tableNumber}`
                        : "No table"}
                      {order.guestCount ? ` - ${order.guestCount} guests` : ""}
                    </ThemedText>
                    <View
                      style={[
                        styles.activityBadge,
                        { backgroundColor: statusConfig.bgColor },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.activityBadgeText,
                          { color: statusConfig.color },
                        ]}
                      >
                        {statusConfig.label}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText
                    type="caption"
                    numberOfLines={1}
                    style={{ color: theme.textSecondary }}
                  >
                    {order.transcribedText}
                  </ThemedText>
                  <ThemedText
                    type="caption"
                    style={{ color: theme.textTertiary }}
                  >
                    {formatTime(order.timestamp)} | {order.staffName}
                  </ThemedText>
                </View>
                <Feather
                  name="chevron-right"
                  size={16}
                  color={theme.textTertiary}
                />
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="title" style={{ color: theme.text }}>
            Quick Stats
          </ThemedText>
        </View>
        <Card style={styles.quickStatsCard}>
          <View style={styles.quickStatRow}>
            <View style={styles.quickStatItem}>
              <Feather name="trending-up" size={16} color={theme.primary} />
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Avg/Hour
              </ThemedText>
            </View>
            <ThemedText style={[styles.quickStatValue, { color: theme.text }]}>
              {stats.avgOrdersPerHour}
            </ThemedText>
          </View>
          <View
            style={[
              styles.quickStatDivider,
              { backgroundColor: theme.borderLight },
            ]}
          />
          <View style={styles.quickStatRow}>
            <View style={styles.quickStatItem}>
              <Feather name="database" size={16} color={theme.primary} />
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                All Time
              </ThemedText>
            </View>
            <ThemedText style={[styles.quickStatValue, { color: theme.text }]}>
              {stats.totalOrders}
            </ThemedText>
          </View>
        </Card>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    gap: Spacing["2xl"],
  },
  heroCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing["2xl"],
    overflow: "hidden",
  },
  heroContent: {
    gap: Spacing.sm,
  },
  greeting: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "400",
    marginTop: Spacing.xs,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: Spacing.lg,
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  section: {
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableGrid: {
    padding: Spacing.lg,
  },
  tableGridInner: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    justifyContent: "center",
  },
  tableCell: {
    width: 68,
    height: 68,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
  },
  tableNum: {
    fontSize: 18,
    fontWeight: "700",
  },
  tableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tableGuests: {
    fontSize: 10,
    fontWeight: "600",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activityContent: {
    flex: 1,
    gap: 3,
  },
  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  activityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
  },
  activityBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  quickStatsCard: {
    padding: Spacing.lg,
  },
  quickStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  quickStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  quickStatDivider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
});
