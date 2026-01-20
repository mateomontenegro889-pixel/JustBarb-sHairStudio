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
        <View style={{ flexDirection: 'row', gap: Spacing.md }}>
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [
              { opacity: pressed ? 0.6 : 1 },
              Platform.OS === 'web' ? { cursor: 'pointer' } : {},
            ]}
          >
            <Feather name="share" size={20} color={theme.text} />
          </Pressable>
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [
              { opacity: pressed ? 0.6 : 1 },
              Platform.OS === 'web' ? { cursor: 'pointer' } : {},
            ]}
          >
            <Feather name="trash-2" size={20} color="#DC2626" />
          </Pressable>
        </View>
      ),
    });
  }, [navigation, theme, order]);

  const handleDelete = () => {
    if (!order) return;
    
    showAlert(
      "Delete Order",
      "Are you sure you want to delete this order? This action cannot be undone.",
      [
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
      ]
    );
  };

  const handleCloseOrder = async () => {
    if (!order) return;
    
    const newStatus = order.status === 'closed' ? 'open' : 'closed';
    const actionText = newStatus === 'closed' ? 'close' : 'reopen';
    
    showAlert(
      `${newStatus === 'closed' ? 'Close' : 'Reopen'} Order`,
      `Are you sure you want to ${actionText} this order?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: newStatus === 'closed' ? "Close" : "Reopen",
          onPress: async () => {
            try {
              if (newStatus === 'closed') {
                await orderStore.closeOrder(order.id);
              } else {
                await orderStore.reopenOrder(order.id);
              }
              setOrder({ ...order, status: newStatus });
            } catch (error) {
              showError("Error", `Failed to ${actionText} order.`);
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!order) return;

    try {
      const tableInfo = order.tableNumber ? `Table ${order.tableNumber}` : '';
      const guestInfo = order.guestCount ? `${order.guestCount} guests` : '';
      const headerInfo = [tableInfo, guestInfo].filter(Boolean).join(' - ');
      
      if (Platform.OS === 'web') {
        const shareText = `Order from ${order.staffName}${headerInfo ? `\n${headerInfo}` : ''}\n\n${order.transcribedText}\n\nRecorded: ${new Date(order.timestamp).toLocaleString()}`;
        
        if (navigator.share) {
          await navigator.share({ text: shareText });
        } else {
          await navigator.clipboard.writeText(shareText);
          window.alert('Order copied to clipboard!');
        }
      } else {
        await Share.share({
          message: `Order from ${order.staffName}${headerInfo ? `\n${headerInfo}` : ''}\n\n${order.transcribedText}\n\nRecorded: ${new Date(order.timestamp).toLocaleString()}`,
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
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

  return (
    <ScreenScrollView contentContainerStyle={styles.container}>
      <Card style={styles.tableCard}>
        <View style={styles.tableInfoRow}>
          <View style={styles.tableInfoItem}>
            <Feather name="grid" size={20} color={theme.primary} />
            <View>
              <ThemedText type="caption">Table</ThemedText>
              <ThemedText type="title">{order.tableNumber || '-'}</ThemedText>
            </View>
          </View>
          <View style={styles.tableInfoItem}>
            <Feather name="users" size={20} color={theme.primary} />
            <View>
              <ThemedText type="caption">Guests</ThemedText>
              <ThemedText type="title">{order.guestCount || '-'}</ThemedText>
            </View>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: order.status === 'closed' ? '#DC2626' : '#16A34A' }
          ]}>
            <ThemedText style={styles.statusText}>
              {order.status === 'closed' ? 'Closed' : 'Open'}
            </ThemedText>
          </View>
        </View>
      </Card>

      <View style={styles.section}>
        <ThemedText type="caption" style={styles.sectionTitle}>
          AUDIO RECORDING
        </ThemedText>
        <AudioPlayer audioUri={order.audioUri} duration={order.duration} />
      </View>

      <View style={styles.section}>
        <ThemedText type="caption" style={styles.sectionTitle}>
          ORDER DETAILS
        </ThemedText>
        <Card>
          <ThemedText style={styles.orderText}>
            {order.transcribedText}
          </ThemedText>
        </Card>
      </View>

      <View style={styles.section}>
        <ThemedText type="caption" style={styles.sectionTitle}>
          METADATA
        </ThemedText>
        <Card>
          <View style={styles.metadataRow}>
            <ThemedText type="caption">Recorded</ThemedText>
            <ThemedText>
              {new Date(order.timestamp).toLocaleString()}
            </ThemedText>
          </View>
          <View style={styles.metadataRow}>
            <ThemedText type="caption">Staff Member</ThemedText>
            <ThemedText>{order.staffName}</ThemedText>
          </View>
          <View style={styles.metadataRow}>
            <ThemedText type="caption">Duration</ThemedText>
            <ThemedText>{order.duration}</ThemedText>
          </View>
        </Card>
      </View>

      <View style={styles.buttonRow}>
        {order.status === 'open' ? (
          <Pressable
            onPress={() => navigation.navigate('RecordMore', { existingOrderId: order.id })}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.primary,
                borderWidth: 2,
                opacity: pressed ? 0.8 : 1,
              },
              Platform.OS === 'web' ? { cursor: 'pointer' } : {},
            ]}
          >
            <Feather name="mic" size={20} color={theme.primary} />
            <ThemedText style={[styles.actionButtonText, { color: theme.primary }]}>
              Record More
            </ThemedText>
          </Pressable>
        ) : null}
        <Pressable
          onPress={handleCloseOrder}
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: order.status === 'closed' ? '#16A34A' : theme.primary,
              opacity: pressed ? 0.8 : 1,
              flex: order.status === 'open' ? 1 : undefined,
            },
            Platform.OS === 'web' ? { cursor: 'pointer' } : {},
          ]}
        >
          <Feather
            name={order.status === 'closed' ? 'refresh-cw' : 'check-circle'}
            size={20}
            color="#FFFFFF"
          />
          <ThemedText style={styles.closeButtonText}>
            {order.status === 'closed' ? 'Reopen Order' : 'Close Order'}
          </ThemedText>
        </Pressable>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    gap: Spacing["2xl"],
  },
  tableCard: {
    padding: Spacing.lg,
  },
  tableInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tableInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  orderText: {
    fontSize: 17,
    lineHeight: 24,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  actionButtonText: {
    fontWeight: "600",
    fontSize: 17,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 17,
  },
});
