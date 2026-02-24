import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  RefreshControl,
  Pressable,
  Platform,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { OrderCard } from "@/components/OrderCard";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { orderStore } from "@/utils/orderStore";
import { Order } from "@/types/order";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

type FilterType = "all" | "active" | "completed";

export default function HistoryListScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [stats, setStats] = useState({ active: 0, completed: 0, total: 0 });

  const loadOrders = useCallback(async () => {
    let allOrders = searchQuery
      ? await orderStore.search(searchQuery)
      : await orderStore.getAll();

    const active = allOrders.filter(
      (o) => o.status !== "completed" && o.status !== "closed",
    ).length;
    const completed = allOrders.filter(
      (o) => o.status === "completed" || o.status === "closed",
    ).length;
    setStats({ active, completed, total: allOrders.length });

    if (activeFilter === "active") {
      allOrders = allOrders.filter(
        (o) => o.status !== "completed" && o.status !== "closed",
      );
    } else if (activeFilter === "completed") {
      allOrders = allOrders.filter(
        (o) => o.status === "completed" || o.status === "closed",
      );
    }
    setOrders(allOrders);
  }, [searchQuery, activeFilter]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
    setTimeout(() => setRefreshing(false), 500);
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: "all", label: "All", count: stats.total },
    { key: "active", label: "Active", count: stats.active },
    { key: "completed", label: "Done", count: stats.completed },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerSection}>
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.borderLight,
            },
          ]}
        >
          <Feather name="search" size={18} color={theme.textTertiary} />
          <TextInput
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
            }}
            onEndEditing={() => loadOrders()}
            placeholder="Search orders, tables..."
            placeholderTextColor={theme.textTertiary}
            style={[styles.searchInput, { color: theme.text }]}
            returnKeyType="search"
            onSubmitEditing={() => loadOrders()}
          />
          {searchQuery.length > 0 ? (
            <Pressable
              onPress={() => {
                setSearchQuery("");
                loadOrders();
              }}
              style={Platform.OS === "web" ? { cursor: "pointer" } : {}}
            >
              <Feather name="x-circle" size={16} color={theme.textTertiary} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.filterRow}>
          {filters.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    activeFilter === f.key
                      ? theme.primary
                      : theme.backgroundDefault,
                  borderColor:
                    activeFilter === f.key ? theme.primary : theme.border,
                },
                Platform.OS === "web" ? { cursor: "pointer" } : {},
              ]}
            >
              <ThemedText
                style={{
                  color:
                    activeFilter === f.key
                      ? theme.buttonText
                      : theme.textSecondary,
                  fontWeight: activeFilter === f.key ? "600" : "400",
                  fontSize: 13,
                }}
              >
                {f.label}
              </ThemedText>
              <View
                style={[
                  styles.filterCount,
                  {
                    backgroundColor:
                      activeFilter === f.key
                        ? "rgba(255,255,255,0.25)"
                        : theme.backgroundSecondary,
                  },
                ]}
              >
                <ThemedText
                  style={{
                    color:
                      activeFilter === f.key
                        ? theme.buttonText
                        : theme.textTertiary,
                    fontSize: 11,
                    fontWeight: "600",
                  }}
                >
                  {f.count}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard
            orderText={item.transcribedText}
            timestamp={formatTimestamp(item.timestamp)}
            staffName={item.staffName}
            tableNumber={item.tableNumber}
            guestCount={item.guestCount}
            status={item.status as any}
            onPress={() =>
              navigation.navigate("OrderDetail", { orderId: item.id })
            }
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View
              style={[styles.emptyIcon, { backgroundColor: theme.primarySoft }]}
            >
              <Feather name="clipboard" size={32} color={theme.primary} />
            </View>
            <ThemedText type="title" style={styles.emptyTitle}>
              {searchQuery ? "No results found" : "No orders yet"}
            </ThemedText>
            <ThemedText
              type="caption"
              style={[styles.emptyText, { color: theme.textSecondary }]}
            >
              {searchQuery
                ? "Try a different search term"
                : "Start recording to create your first order"}
            </ThemedText>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  filterRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterCount: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing["5xl"],
    gap: Spacing.md,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  emptyTitle: { marginTop: Spacing.sm },
  emptyText: { textAlign: "center" },
});
