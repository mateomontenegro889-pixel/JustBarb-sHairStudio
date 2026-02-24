import React, { useState, useLayoutEffect } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ThemedText } from "@/components/ThemedText";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Card } from "@/components/Card";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { orderStore } from "@/utils/orderStore";
import { showAlert, showError } from "@/utils/webAlert";

export default function ConfirmAddItemsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { audioUri, transcribedText, existingOrderId } = route.params as {
    audioUri: string;
    transcribedText: string;
    existingOrderId: string;
  };

  const [orderText, setOrderText] = useState(transcribedText);

  const deduplicateMeals = (text: string): string => {
    const lines = text.split("\n").filter((line) => line.trim());
    const uniqueLines = [...new Set(lines)];
    return uniqueLines.join("\n");
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={handleCancel}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <ThemedText type="body">Cancel</ThemedText>
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          onPress={handleConfirm}
          disabled={!orderText.trim()}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <ThemedText
            type="body"
            style={{
              color: orderText.trim() ? theme.primary : theme.textSecondary,
              fontWeight: "600",
            }}
          >
            Add Items
          </ThemedText>
        </Pressable>
      ),
    });
  }, [navigation, orderText, theme]);

  const handleCancel = () => {
    showAlert("Cancel", "Are you sure you want to cancel adding these items?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const handleConfirm = async () => {
    try {
      await orderStore.appendItems(
        existingOrderId,
        deduplicateMeals(orderText),
      );
      navigation.navigate("OrderDetail", { orderId: existingOrderId });
    } catch (error) {
      showError("Error", "Failed to add items. Please try again.");
    }
  };

  return (
    <ScreenKeyboardAwareScrollView contentContainerStyle={styles.container}>
      <Card style={styles.infoCard}>
        <ThemedText type="caption" style={styles.infoText}>
          These items will be added to the existing order
        </ThemedText>
      </Card>

      <View style={styles.section}>
        <ThemedText type="caption" style={styles.sectionTitle}>
          AUDIO RECORDING
        </ThemedText>
        <AudioPlayer audioUri={audioUri} duration="0:15" />
      </View>

      <View style={styles.section}>
        <ThemedText type="caption" style={styles.sectionTitle}>
          NEW ITEMS TO ADD
        </ThemedText>
        <TextInput
          value={orderText}
          onChangeText={setOrderText}
          multiline
          autoFocus
          style={[
            styles.textInput,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholderTextColor={theme.textSecondary}
          placeholder="Enter additional items..."
        />
      </View>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    gap: Spacing["2xl"],
  },
  infoCard: {
    padding: Spacing.md,
  },
  infoText: {
    textAlign: "center",
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    fontSize: 17,
    minHeight: 150,
    textAlignVertical: "top",
  },
});
