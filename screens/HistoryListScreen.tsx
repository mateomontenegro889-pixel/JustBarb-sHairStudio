import React, { useState, useCallback } from "react";
import { View, StyleSheet, TextInput, FlatList, RefreshControl, Pressable, Platform } from "react-native";
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

export default function HistoryListScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'closed'>('all');

  const loadOrders = useCallback(async () => {
    let allOrders = searchQuery
      ? await orderStore.search(searchQuery)
      : await orderStore.getAll();
    
    if (activeFilter !== 'all') {
      allOrders = allOrders.filter(order => order.status === activeFilter);
    }
    setOrders(allOrders);
  }, [searchQuery, activeFilter]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
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

  const FilterButton = ({ filter, label }: { filter: 'all' | 'open' | 'closed', label: string }) => (
    <Pressable
      onPress={() => setActiveFilter(filter)}
      style={[
        styles.filterButton,
        { 
          backgroundColor: activeFilter === filter ? theme.primary : theme.backgroundDefault,
          borderColor: activeFilter === filter ? theme.primary : theme.border,
        },
        Platform.OS === 'web' ? { cursor: 'pointer' } : {},
      ]}
    >
      <ThemedText
        style={{
          color: activeFilter === filter ? theme.buttonText : theme.textSecondary,
          fontWeight: activeFilter === filter ? "600" : "400",
          fontSize: 14,
        }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerSection}>
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: theme.backgroundDefault,
            },
          ]}
        >
          <Feather name="search" size={18} color={theme.textTertiary} />
          <TextInput
            value={searchQuery}
            onChangeText={text => {
              setSearchQuery(text);
              loadOrders();
            }}
            placeholder="Search orders..."
            placeholderTextColor={theme.textTertiary}
            style={[
              styles.searchInput,
              {
                color: theme.text,
              },
            ]}
          />
        </View>

        <View style={styles.filterRow}>
          <FilterButton filter="all" label="All" />
          <FilterButton filter="open" label="Active" />
          <FilterButton filter="closed" label="Completed" />
        </View>
      </View>

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <OrderCard
            orderText={item.transcribedText}
            timestamp={formatTimestamp(item.timestamp)}
            staffName={item.staffName}
            tableNumber={item.tableNumber}
            guestCount={item.guestCount}
            status={item.status}
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
            <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="clipboard" size={32} color={theme.textTertiary} />
            </View>
            <ThemedText type="title" style={styles.emptyTitle}>
              No orders yet
            </ThemedText>
            <ThemedText type="caption" style={[styles.emptyText, { color: theme.textSecondary }]}>
              Start recording to create your first order
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
  container: {
    flex: 1,
  },
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
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  filterRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
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
  emptyTitle: {
    marginTop: Spacing.sm,
  },
  emptyText: {
    textAlign: "center",
  },
});
