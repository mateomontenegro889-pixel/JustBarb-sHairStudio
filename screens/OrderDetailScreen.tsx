import React, { useLayoutEffect } from "react";
import { View, StyleSheet, Pressable, Share, Platform } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Card } from "@/components/Card";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { orderStore } from "@/utils/orderStore";
import { showAlert, showError } from "@/utils/webAlert";
import { ORDER_STATUS_CONFIG, STATUS_FLOW, OrderStatus } from "@/types/order";

function StatusStep({
  label,
  isActive,
  isCompleted,
  color,
}: {
  label: string;
  isActive: boolean;
  isCompleted: boolean;
  color: string;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.statusStep}>
      <View
        style={[
          styles.statusStepDot,
          {
            backgroundColor:
              isCompleted || isActive ? color : theme.backgroundTertiary,
            borderColor: isActive ? color : "transparent",
            borderWidth: isActive ? 2 : 0,
          },
        ]}
      >
        {isCompleted ? (
          <Feather name="check" size={10} color="#FFFFFF" />
        ) : null}
      </View>
      <ThemedText
        style={[
          styles.statusStepLabel,
          {
            color: isActive || isCompleted ? color : theme.textTertiary,
            fontWeight: isActive ? "600" : "400",
          },
        ]}
      >
        {label}
      </ThemedText>
    </View>
  );
}

export default function OrderDetailScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params as { orderId: string };
  const [order, setOrder] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchOrder = async () => {
      const fetchedOrder = await orderStore.getById(orderId);
      setOrder(fetchedOrder);
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: Spacing.lg }}>
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [
              { opacity: pressed ? 0.6 : 1 },
              Platform.OS === "web" ? { cursor: "pointer" } : {},
            ]}
          >
            <Feather name="share" size={20} color={theme.text} />
          </Pressable>
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [
              { opacity: pressed ? 0.6 : 1 },
              Platform.OS === "web" ? { cursor: "pointer" } : {},
            ]}
          >
            <Feather name="trash-2" size={20} color={theme.error} />
          </Pressable>
        </View>
      ),
    });
  }, [navigation, theme, order]);

  const handleDelete = () => {
    if (!order) return;
    showAlert("Delete Order", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await orderStore.delete(order.id);
            navigation.goBack();
          } catch (error) {
            showError("Error", "Failed to delete order.");
          }
        },
      },
    ]);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    try {
      await orderStore.updateStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
    } catch (error) {
      showError("Error", "Failed to update status.");
    }
  };

  const handleShare = async () => {
    if (!order) return;
    try {
      const tableInfo = order.tableNumber ? `Table ${order.tableNumber}` : "";
      const guestInfo = order.guestCount ? `${order.guestCount} guests` : "";
      const headerInfo = [tableInfo, guestInfo].filter(Boolean).join(" - ");
      const shareText = `Order from ${order.staffName}${headerInfo ? `\n${headerInfo}` : ""}\n\n${order.transcribedText}\n\nRecorded: ${new Date(order.timestamp).toLocaleString()}`;

      if (Platform.OS === "web") {
        if (navigator.share) {
          await navigator.share({ text: shareText });
        } else {
          await navigator.clipboard.writeText(shareText);
          window.alert("Order copied to clipboard!");
        }
      } else {
        await Share.share({ message: shareText });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const getNextStatus = (): string | null => {
    const currentStatus = order?.status || "new";
    const normalizedStatus =
      currentStatus === "open"
        ? "new"
        : currentStatus === "closed"
          ? "completed"
          : currentStatus;
    const currentIndex = STATUS_FLOW.indexOf(normalizedStatus as OrderStatus);
    if (currentIndex < STATUS_FLOW.length - 1) {
      return STATUS_FLOW[currentIndex + 1];
    }
    return null;
  };

  const getCurrentStatusIndex = (): number => {
    const currentStatus = order?.status || "new";
    const normalizedStatus =
      currentStatus === "open"
        ? "new"
        : currentStatus === "closed"
          ? "completed"
          : currentStatus;
    return STATUS_FLOW.indexOf(normalizedStatus as OrderStatus);
  };

  if (loading) {
    return (
      <ScreenScrollView contentContainerStyle={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ScreenScrollView>
    );
  }

  if (!order) {
    return (
      <ScreenScrollView contentContainerStyle={styles.container}>
        <ThemedText>Order not found</ThemedText>
      </ScreenScrollView>
    );
  }

  const statusConfig =
    ORDER_STATUS_CONFIG[order.status || "new"] || ORDER_STATUS_CONFIG["new"];
  const nextStatus = getNextStatus();
  const nextStatusConfig = nextStatus ? ORDER_STATUS_CONFIG[nextStatus] : null;
  const currentIndex = getCurrentStatusIndex();
  const isCompleted = order.status === "completed" || order.status === "closed";

  return (
    <ScreenScrollView contentContainerStyle={styles.container}>
      <Card style={styles.topCard}>
        <View style={styles.topCardContent}>
          <View style={styles.tableGuestRow}>
            <View style={styles.infoBlock}>
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: theme.primarySoft },
                ]}
              >
                <Feather name="grid" size={20} color={theme.primary} />
              </View>
              <View>
                <ThemedText
                  type="caption"
                  style={{ color: theme.textSecondary }}
                >
                  Table
                </ThemedText>
                <ThemedText style={[styles.infoValue, { color: theme.text }]}>
                  {order.tableNumber || "-"}
                </ThemedText>
              </View>
            </View>
            <View
              style={[
                styles.infoDivider,
                { backgroundColor: theme.borderLight },
              ]}
            />
            <View style={styles.infoBlock}>
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: theme.primarySoft },
                ]}
              >
                <Feather name="users" size={20} color={theme.primary} />
              </View>
              <View>
                <ThemedText
                  type="caption"
                  style={{ color: theme.textSecondary }}
                >
                  Guests
                </ThemedText>
                <ThemedText style={[styles.infoValue, { color: theme.text }]}>
                  {order.guestCount || "-"}
                </ThemedText>
              </View>
            </View>
            <View
              style={[
                styles.infoDivider,
                { backgroundColor: theme.borderLight },
              ]}
            />
            <View style={styles.infoBlock}>
              <View
                style={[
                  styles.statusBadgeLg,
                  { backgroundColor: statusConfig.bgColor },
                ]}
              >
                <Feather
                  name={statusConfig.icon as any}
                  size={14}
                  color={statusConfig.color}
                />
              </View>
              <View>
                <ThemedText
                  type="caption"
                  style={{ color: theme.textSecondary }}
                >
                  Status
                </ThemedText>
                <ThemedText
                  style={[styles.infoValue, { color: statusConfig.color }]}
                >
                  {statusConfig.label}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </Card>

      <View style={styles.section}>
        <ThemedText
          type="caption"
          style={[styles.sectionTitle, { color: theme.textTertiary }]}
        >
          ORDER PROGRESS
        </ThemedText>
        <Card style={styles.progressCard}>
          <View style={styles.progressTrack}>
            {STATUS_FLOW.map((status, index) => {
              const config = ORDER_STATUS_CONFIG[status];
              const isStepActive = index === currentIndex;
              const isStepCompleted = index < currentIndex;
              return (
                <React.Fragment key={status}>
                  {index > 0 ? (
                    <View
                      style={[
                        styles.progressLine,
                        {
                          backgroundColor: isStepCompleted
                            ? statusConfig.color
                            : theme.backgroundTertiary,
                        },
                      ]}
                    />
                  ) : null}
                  <StatusStep
                    label={config.label}
                    isActive={isStepActive}
                    isCompleted={isStepCompleted}
                    color={statusConfig.color}
                  />
                </React.Fragment>
              );
            })}
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <ThemedText
          type="caption"
          style={[styles.sectionTitle, { color: theme.textTertiary }]}
        >
          AUDIO RECORDING
        </ThemedText>
        <AudioPlayer audioUri={order.audioUri} duration={order.duration} />
      </View>

      <View style={styles.section}>
        <ThemedText
          type="caption"
          style={[styles.sectionTitle, { color: theme.textTertiary }]}
        >
          ORDER ITEMS
        </ThemedText>
        <Card style={styles.orderCard}>
          <ThemedText style={styles.orderText}>
            {order.transcribedText}
          </ThemedText>
        </Card>
      </View>

      <View style={styles.section}>
        <ThemedText
          type="caption"
          style={[styles.sectionTitle, { color: theme.textTertiary }]}
        >
          DETAILS
        </ThemedText>
        <Card style={styles.metaCard}>
          <View style={styles.metaRow}>
            <View style={styles.metaLabel}>
              <Feather name="clock" size={14} color={theme.textTertiary} />
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Time
              </ThemedText>
            </View>
            <ThemedText style={styles.metaValue}>
              {new Date(order.timestamp).toLocaleString()}
            </ThemedText>
          </View>
          <View
            style={[styles.metaDivider, { backgroundColor: theme.borderLight }]}
          />
          <View style={styles.metaRow}>
            <View style={styles.metaLabel}>
              <Feather name="user" size={14} color={theme.textTertiary} />
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Staff
              </ThemedText>
            </View>
            <ThemedText style={styles.metaValue}>{order.staffName}</ThemedText>
          </View>
          <View
            style={[styles.metaDivider, { backgroundColor: theme.borderLight }]}
          />
          <View style={styles.metaRow}>
            <View style={styles.metaLabel}>
              <Feather name="mic" size={14} color={theme.textTertiary} />
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Duration
              </ThemedText>
            </View>
            <ThemedText style={styles.metaValue}>{order.duration}</ThemedText>
          </View>
        </Card>
      </View>

      <View style={styles.actionRow}>
        {!isCompleted ? (
          <Pressable
            onPress={() =>
              navigation.navigate("RecordMore", { existingOrderId: order.id })
            }
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.primary,
                borderWidth: 1.5,
                opacity: pressed ? 0.8 : 1,
              },
              Platform.OS === "web" ? { cursor: "pointer" } : {},
            ]}
          >
            <Feather name="mic" size={18} color={theme.primary} />
            <ThemedText
              style={[styles.actionBtnText, { color: theme.primary }]}
            >
              Add Items
            </ThemedText>
          </Pressable>
        ) : null}
        {nextStatus && nextStatusConfig ? (
          <Pressable
            onPress={() => handleStatusChange(nextStatus)}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: nextStatusConfig.color,
                flex: 1,
                opacity: pressed ? 0.8 : 1,
              },
              Platform.OS === "web" ? { cursor: "pointer" } : {},
            ]}
          >
            <Feather
              name={nextStatusConfig.icon as any}
              size={18}
              color="#FFFFFF"
            />
            <ThemedText style={styles.actionBtnTextWhite}>
              Mark as {nextStatusConfig.label}
            </ThemedText>
          </Pressable>
        ) : null}
        {isCompleted ? (
          <Pressable
            onPress={() => handleStatusChange("new")}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: theme.primary,
                flex: 1,
                opacity: pressed ? 0.8 : 1,
              },
              Platform.OS === "web" ? { cursor: "pointer" } : {},
            ]}
          >
            <Feather name="refresh-cw" size={18} color="#FFFFFF" />
            <ThemedText style={styles.actionBtnTextWhite}>
              Reopen Order
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    gap: Spacing["2xl"],
  },
  topCard: { padding: Spacing.xl },
  topCardContent: { gap: Spacing.lg },
  tableGuestRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  infoBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  infoValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  infoDivider: {
    width: 1,
    height: 40,
  },
  statusBadgeLg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  section: { gap: Spacing.sm },
  sectionTitle: {
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginLeft: Spacing.xs,
  },
  progressCard: { padding: Spacing.lg },
  progressTrack: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  progressLine: {
    height: 2,
    width: 20,
  },
  statusStep: {
    alignItems: "center",
    gap: 4,
  },
  statusStepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statusStepLabel: {
    fontSize: 9,
    textAlign: "center",
  },
  orderCard: { padding: Spacing.lg },
  orderText: {
    fontSize: 16,
    lineHeight: 24,
  },
  metaCard: { padding: Spacing.lg },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  metaLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  metaDivider: {
    height: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  actionBtnText: {
    fontWeight: "600",
    fontSize: 15,
  },
  actionBtnTextWhite: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
});
