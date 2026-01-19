import React, { useState, useLayoutEffect } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert, ScrollView, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Card } from "@/components/Card";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { orderStore } from "@/utils/orderStore";
import { Order } from "@/types/order";

const TABLE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const GUEST_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function ConfirmOrderScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { audioUri, transcribedText } = route.params as {
    audioUri: string;
    transcribedText: string;
  };

  const [orderText, setOrderText] = useState(transcribedText);
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [guestCount, setGuestCount] = useState<number>(2);
  const staffName = "Chef";

  const deduplicateMeals = (text: string): string => {
    const lines = text.split("\n").filter(line => line.trim());
    const uniqueLines = [...new Set(lines)];
    return uniqueLines.join("\n");
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={handleCancel}
          style={({ pressed }) => [
            { opacity: pressed ? 0.6 : 1 },
            Platform.OS === 'web' ? { cursor: 'pointer' } : {},
          ]}
        >
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Cancel
          </ThemedText>
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          onPress={handleConfirm}
          disabled={!orderText.trim()}
          style={({ pressed }) => [
            styles.confirmButton,
            { 
              backgroundColor: orderText.trim() ? theme.primary : theme.backgroundSecondary,
              opacity: pressed ? 0.8 : 1 
            },
            Platform.OS === 'web' ? { cursor: orderText.trim() ? 'pointer' : 'not-allowed' } : {},
          ]}
        >
          <ThemedText
            style={{
              color: orderText.trim() ? theme.buttonText : theme.textTertiary,
              fontWeight: "600",
              fontSize: 14,
            }}
          >
            Confirm
          </ThemedText>
        </Pressable>
      ),
    });
  }, [navigation, orderText, theme]);

  const handleCancel = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleConfirm = async () => {
    const newOrder: Order = {
      id: Date.now().toString(),
      audioUri,
      transcribedText: deduplicateMeals(orderText),
      timestamp: new Date().toISOString(),
      staffName: staffName,
      duration: "0:15",
      tableNumber,
      guestCount,
      status: 'open',
    };

    try {
      await orderStore.add(newOrder);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save order. Please try again.");
    }
  };

  return (
    <ScreenKeyboardAwareScrollView contentContainerStyle={styles.container}>
      <Card style={styles.headerCard}>
        <View style={styles.headerCardContent}>
          <View style={[styles.headerIcon, { backgroundColor: theme.primary + '20' }]}>
            <Feather name="clipboard" size={24} color={theme.primary} />
          </View>
          <View style={styles.headerText}>
            <ThemedText type="title">New Order</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Review and confirm the order details
            </ThemedText>
          </View>
        </View>
      </Card>

      <View style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textTertiary }]}>
          TABLE NUMBER
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.selectionRow}>
            {TABLE_NUMBERS.map((num) => (
              <Pressable
                key={num}
                onPress={() => setTableNumber(num)}
                style={({ pressed }) => [
                  styles.selectionButton,
                  {
                    backgroundColor: tableNumber === num ? theme.primary : theme.backgroundDefault,
                    borderColor: tableNumber === num ? theme.primary : theme.border,
                    opacity: pressed ? 0.8 : 1,
                    ...Platform.select({
                      ios: tableNumber === num ? {
                        shadowColor: theme.primary,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                      } : {},
                      web: tableNumber === num ? {
                        boxShadow: `0 2px 8px ${theme.primary}40`,
                      } : {},
                    }),
                  },
                  Platform.OS === 'web' ? { cursor: 'pointer' } : {},
                ]}
              >
                <ThemedText
                  style={{
                    color: tableNumber === num ? theme.buttonText : theme.text,
                    fontWeight: tableNumber === num ? "700" : "500",
                    fontSize: 16,
                  }}
                >
                  {num}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textTertiary }]}>
          NUMBER OF GUESTS
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.selectionRow}>
            {GUEST_COUNTS.map((num) => (
              <Pressable
                key={num}
                onPress={() => setGuestCount(num)}
                style={({ pressed }) => [
                  styles.selectionButton,
                  {
                    backgroundColor: guestCount === num ? theme.primary : theme.backgroundDefault,
                    borderColor: guestCount === num ? theme.primary : theme.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                  Platform.OS === 'web' ? { cursor: 'pointer' } : {},
                ]}
              >
                <View style={styles.guestButtonContent}>
                  <Feather
                    name="users"
                    size={12}
                    color={guestCount === num ? theme.buttonText : theme.textSecondary}
                  />
                  <ThemedText
                    style={{
                      color: guestCount === num ? theme.buttonText : theme.text,
                      fontWeight: guestCount === num ? "700" : "500",
                      fontSize: 14,
                    }}
                  >
                    {num}
                  </ThemedText>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textTertiary }]}>
          AUDIO RECORDING
        </ThemedText>
        <AudioPlayer audioUri={audioUri} duration="0:15" />
      </View>

      <View style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textTertiary }]}>
          ORDER DETAILS
        </ThemedText>
        <Card style={styles.textInputCard}>
          <TextInput
            value={orderText}
            onChangeText={setOrderText}
            multiline
            autoFocus
            style={[
              styles.textInput,
              {
                color: theme.text,
              },
            ]}
            placeholderTextColor={theme.textTertiary}
            placeholder="Enter order details..."
          />
        </Card>
      </View>

      <View style={styles.timestampContainer}>
        <Feather name="clock" size={14} color={theme.textTertiary} />
        <ThemedText type="caption" style={{ color: theme.textTertiary }}>
          {new Date().toLocaleString()}
        </ThemedText>
      </View>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    gap: Spacing["2xl"],
  },
  headerCard: {
    padding: Spacing.xl,
  },
  headerCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
    gap: Spacing.xs,
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "500",
  },
  selectionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  selectionButton: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  guestButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  textInputCard: {
    padding: 0,
  },
  textInput: {
    padding: Spacing.lg,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: "top",
    lineHeight: 24,
  },
  timestampContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  confirmButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
});
