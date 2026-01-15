import React, { useState } from "react";
import { View, StyleSheet, Pressable, Alert, TextInput, Modal, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiKey, saveApiKey, deleteApiKey } from "@/utils/apiKeyStorage";
import { validateApiKey } from "@/utils/transcription";

interface SettingsItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
}

function SettingsItem({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
}: SettingsItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      <View style={styles.settingsItem}>
        <View style={styles.settingsItemLeft}>
          <Feather name={icon as any} size={20} color={theme.text} />
          <ThemedText>{label}</ThemedText>
        </View>
        <View style={styles.settingsItemRight}>
          {value ? (
            <ThemedText type="caption">{value}</ThemedText>
          ) : null}
          {showChevron && onPress ? (
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [staffName, setStaffName] = useState("Chef");
  const [nameInput, setNameInput] = useState("Chef");

  const handleCheckApiKey = async () => {
    const apiKey = await getApiKey();
    setHasApiKey(!!apiKey);
  };

  React.useEffect(() => {
    handleCheckApiKey();
  }, []);

  const handleSaveStaffName = () => {
    if (!nameInput.trim()) {
      Alert.alert("Invalid Name", "Please enter a valid staff name.");
      return;
    }
    setStaffName(nameInput.trim());
    setShowNameModal(false);
    Alert.alert("Success", "Staff name updated successfully!");
  };

  const handleSaveApiKey = async () => {
    console.log('[ProfileScreen] handleSaveApiKey called, input length:', apiKeyInput.length);
    
    if (!validateApiKey(apiKeyInput)) {
      console.log('[ProfileScreen] API key validation failed');
      Alert.alert(
        "Invalid API Key",
        "Please enter a valid OpenAI API key (starts with 'sk-')."
      );
      return;
    }

    try {
      console.log('[ProfileScreen] Saving API key...');
      await saveApiKey(apiKeyInput);
      console.log('[ProfileScreen] API key saved successfully');
      setHasApiKey(true);
      setShowApiKeyModal(false);
      setApiKeyInput("");
      Alert.alert("Success", "API key saved successfully!");
    } catch (error) {
      console.error('[ProfileScreen] Save API key error:', error);
      Alert.alert("Error", "Failed to save API key. Please try again.");
    }
  };

  const handleRemoveApiKey = () => {
    Alert.alert(
      "Remove API Key",
      "Are you sure you want to remove your OpenAI API key?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteApiKey();
              setHasApiKey(false);
              Alert.alert("Removed", "API key removed successfully.");
            } catch (error) {
              Alert.alert("Error", "Failed to remove API key.");
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenScrollView contentContainerStyle={styles.container}>
      <Pressable
        onPress={() => {
          setNameInput(staffName);
          setShowNameModal(true);
        }}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: theme.primary },
              ]}
            >
              <ThemedText
                style={[styles.avatarText, { color: theme.buttonText }]}
              >
                {staffName.substring(0, 2).toUpperCase()}
              </ThemedText>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText type="title">{staffName}</ThemedText>
              <ThemedText type="caption">Staff Member • Tap to edit</ThemedText>
            </View>
          </View>
        </Card>
      </Pressable>

      <View style={styles.section}>
        <ThemedText type="caption" style={styles.sectionTitle}>
          API CONFIGURATION
        </ThemedText>
        <Card>
          <SettingsItem
            icon="key"
            label="OpenAI API Key"
            value={hasApiKey ? "Configured" : "Not Set"}
            onPress={() => setShowApiKeyModal(true)}
          />
          {hasApiKey ? (
            <>
              <View style={styles.separator} />
              <SettingsItem
                icon="trash-2"
                label="Remove API Key"
                onPress={handleRemoveApiKey}
                showChevron={false}
              />
            </>
          ) : null}
        </Card>
        <ThemedText type="caption" style={styles.helperText}>
          Your API key is stored securely on this device and used only for audio transcription.
        </ThemedText>
      </View>

      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNameModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundRoot }]}>
            <ThemedText type="title" style={styles.modalTitle}>Edit Staff Name</ThemedText>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Enter your name..."
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.backgroundDefault,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowNameModal(false)}
                style={({ pressed }) => [
                  styles.modalButton,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveStaffName}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.modalButtonPrimary,
                  { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <ThemedText style={{ color: theme.buttonText }}>Save</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showApiKeyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowApiKeyModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowApiKeyModal(false)}
        >
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundSecondary },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="title">OpenAI API Key</ThemedText>
              <Pressable
                onPress={() => setShowApiKeyModal(false)}
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
              >
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ThemedText type="caption" style={styles.modalDescription}>
              Enter your OpenAI API key to enable audio transcription. Get your API key from platform.openai.com/api-keys
            </ThemedText>

            <TextInput
              style={[
                styles.apiKeyInput,
                {
                  backgroundColor: theme.backgroundDefault,
                  color: theme.text,
                  borderColor: theme.textSecondary,
                },
              ]}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              placeholder="sk-..."
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.cancelButton,
                  { 
                    opacity: pressed ? 0.6 : 1,
                    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
                  },
                ]}
                onPress={() => {
                  setShowApiKeyModal(false);
                  setApiKeyInput("");
                }}
              >
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.saveButton,
                  { 
                    backgroundColor: theme.primary,
                    opacity: pressed ? 0.8 : 1,
                    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
                  },
                ]}
                onPress={handleSaveApiKey}
              >
                <ThemedText style={{ color: theme.buttonText }}>
                  Save
                </ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  modalTitle: {
    marginBottom: Spacing.sm,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    fontSize: 17,
    minHeight: Spacing.inputHeight,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    justifyContent: "flex-end",
  },
  modalButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  modalButtonPrimary: {
    paddingHorizontal: Spacing.xl,
  },
  container: {
    padding: Spacing.xl,
    gap: Spacing["2xl"],
  },
  profileCard: {
    padding: Spacing.xl,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
  },
  profileInfo: {
    gap: Spacing.xs,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  settingsItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    opacity: 0.3,
  },
  helperText: {
    marginTop: Spacing.sm,
    opacity: 0.6,
    lineHeight: 18,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalDescription: {
    lineHeight: 20,
    opacity: 0.7,
  },
  apiKeyInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  saveButton: {},
});
