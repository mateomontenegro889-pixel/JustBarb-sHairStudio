import React, { useState } from "react";
import { View, StyleSheet, Pressable, TextInput, Modal, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiKey, saveApiKey, deleteApiKey } from "@/utils/apiKeyStorage";
import { validateApiKey } from "@/utils/transcription";
import { showAlert, showError } from "@/utils/webAlert";

interface SettingsItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}

function SettingsItem({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  destructive = false,
}: SettingsItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.settingsItem,
        { opacity: pressed ? 0.6 : 1 },
        Platform.OS === 'web' ? { cursor: onPress ? 'pointer' : undefined } : {},
      ]}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: destructive ? '#FEE2E2' : theme.backgroundSecondary }
        ]}>
          <Feather 
            name={icon as any} 
            size={18} 
            color={destructive ? theme.error : theme.primary} 
          />
        </View>
        <ThemedText style={destructive ? { color: theme.error } : undefined}>
          {label}
        </ThemedText>
      </View>
      <View style={styles.settingsItemRight}>
        {value ? (
          <View style={[styles.valueBadge, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText type="caption" style={{ color: theme.primary }}>
              {value}
            </ThemedText>
          </View>
        ) : null}
        {showChevron && onPress ? (
          <Feather name="chevron-right" size={20} color={theme.textTertiary} />
        ) : null}
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { theme } = useTheme();
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
      showError("Invalid Name", "Please enter a valid staff name.");
      return;
    }
    setStaffName(nameInput.trim());
    setShowNameModal(false);
    showError("Success", "Staff name updated successfully!");
  };

  const handleSaveApiKey = async () => {
    console.log('[ProfileScreen] handleSaveApiKey called, input length:', apiKeyInput.length);
    
    if (!validateApiKey(apiKeyInput)) {
      console.log('[ProfileScreen] API key validation failed');
      showError(
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
      showError("Success", "API key saved successfully!");
    } catch (error) {
      console.error('[ProfileScreen] Save API key error:', error);
      showError("Error", "Failed to save API key. Please try again.");
    }
  };

  const handleRemoveApiKey = () => {
    showAlert(
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
              showError("Removed", "API key removed successfully.");
            } catch (error) {
              showError("Error", "Failed to remove API key.");
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
        style={({ pressed }) => [
          { opacity: pressed ? 0.8 : 1 },
          Platform.OS === 'web' ? { cursor: 'pointer' } : {},
        ]}
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
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Staff Member
              </ThemedText>
            </View>
            <Feather name="edit-2" size={18} color={theme.textTertiary} />
          </View>
        </Card>
      </Pressable>

      <View style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textTertiary }]}>
          SETTINGS
        </ThemedText>
        <Card style={styles.settingsCard}>
          <SettingsItem
            icon="key"
            label="OpenAI API Key"
            value={hasApiKey ? "Active" : "Not Set"}
            onPress={() => setShowApiKeyModal(true)}
          />
          {hasApiKey ? (
            <>
              <View style={[styles.separator, { backgroundColor: theme.border }]} />
              <SettingsItem
                icon="trash-2"
                label="Remove API Key"
                onPress={handleRemoveApiKey}
                showChevron={false}
                destructive
              />
            </>
          ) : null}
        </Card>
        <ThemedText type="caption" style={[styles.helperText, { color: theme.textTertiary }]}>
          Your API key is stored securely on this device and used only for audio transcription.
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textTertiary }]}>
          ABOUT
        </ThemedText>
        <Card style={styles.settingsCard}>
          <SettingsItem
            icon="info"
            label="Version"
            value="1.0.0"
            showChevron={false}
          />
        </Card>
      </View>

      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="title">Edit Staff Name</ThemedText>
              <Pressable
                onPress={() => setShowNameModal(false)}
                style={({ pressed }) => [
                  { opacity: pressed ? 0.5 : 1 },
                  Platform.OS === 'web' ? { cursor: 'pointer' } : {},
                ]}
              >
                <Feather name="x" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Enter your name..."
              placeholderTextColor={theme.textTertiary}
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                },
              ]}
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowNameModal(false)}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.cancelButton,
                  { 
                    borderColor: theme.border,
                    opacity: pressed ? 0.6 : 1 
                  },
                  Platform.OS === 'web' ? { cursor: 'pointer' } : {},
                ]}
              >
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveStaffName}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.primaryButton,
                  { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
                  Platform.OS === 'web' ? { cursor: 'pointer' } : {},
                ]}
              >
                <ThemedText style={{ color: theme.buttonText, fontWeight: "600" }}>
                  Save
                </ThemedText>
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
              { backgroundColor: theme.backgroundDefault },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="title">OpenAI API Key</ThemedText>
              <Pressable
                onPress={() => setShowApiKeyModal(false)}
                style={({ pressed }) => [
                  { opacity: pressed ? 0.5 : 1 },
                  Platform.OS === 'web' ? { cursor: 'pointer' } : {},
                ]}
              >
                <Feather name="x" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>

            <ThemedText type="body" style={[styles.modalDescription, { color: theme.textSecondary }]}>
              Enter your OpenAI API key to enable audio transcription.
            </ThemedText>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                },
              ]}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              placeholder="sk-..."
              placeholderTextColor={theme.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />

            <ThemedText type="caption" style={{ color: theme.textTertiary }}>
              Get your API key from platform.openai.com/api-keys
            </ThemedText>

            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.cancelButton,
                  { 
                    borderColor: theme.border,
                    opacity: pressed ? 0.6 : 1,
                  },
                  Platform.OS === 'web' ? { cursor: 'pointer' } : {},
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
                  styles.primaryButton,
                  { 
                    backgroundColor: theme.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                  Platform.OS === 'web' ? { cursor: 'pointer' } : {},
                ]}
                onPress={handleSaveApiKey}
              >
                <ThemedText style={{ color: theme.buttonText, fontWeight: "600" }}>
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
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
  },
  profileInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: Spacing.sm,
  },
  settingsCard: {
    padding: 0,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  valueBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  separator: {
    height: 1,
    marginLeft: 60,
  },
  helperText: {
    marginLeft: Spacing.sm,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    padding: Spacing["2xl"],
    gap: Spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalDescription: {
    lineHeight: 22,
  },
  modalInput: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: 16,
    minHeight: 52,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  primaryButton: {},
});
