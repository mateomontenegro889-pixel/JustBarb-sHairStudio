import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  getApiKey,
  saveApiKey,
  deleteApiKey,
  hasEnvApiKey,
} from "@/utils/apiKeyStorage";
import { validateApiKey } from "@/utils/transcription";
import { showAlert, showError } from "@/utils/webAlert";
import { orderStore } from "@/utils/orderStore";

interface SettingsItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  valueColor?: string;
}

function SettingsItem({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  destructive = false,
  valueColor,
}: SettingsItemProps) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.settingsItem,
        { opacity: pressed ? 0.6 : 1 },
        Platform.OS === "web"
          ? { cursor: onPress ? "pointer" : undefined }
          : {},
      ]}
    >
      <View style={styles.settingsItemLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: destructive ? "#FEE2E2" : theme.primarySoft },
          ]}
        >
          <Feather
            name={icon as any}
            size={16}
            color={destructive ? theme.error : theme.primary}
          />
        </View>
        <ThemedText
          style={[
            { fontSize: 15 },
            destructive ? { color: theme.error } : undefined,
          ]}
        >
          {label}
        </ThemedText>
      </View>
      <View style={styles.settingsItemRight}>
        {value ? (
          <View
            style={[
              styles.valueBadge,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <ThemedText
              type="caption"
              style={{ color: valueColor || theme.primary, fontWeight: "600" }}
            >
              {value}
            </ThemedText>
          </View>
        ) : null}
        {showChevron && onPress ? (
          <Feather name="chevron-right" size={18} color={theme.textTertiary} />
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
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    completedOrders: 0,
  });
  const isEnvKeyConfigured = hasEnvApiKey();

  useFocusEffect(
    useCallback(() => {
      handleCheckApiKey();
      loadStats();
    }, []),
  );

  const handleCheckApiKey = async () => {
    const apiKey = await getApiKey();
    setHasApiKey(!!apiKey);
  };

  const loadStats = async () => {
    const s = await orderStore.getStats();
    setStats({
      totalOrders: s.totalOrders,
      todayOrders: s.todayOrders,
      completedOrders: s.completedOrders,
    });
  };

  const handleSaveStaffName = () => {
    if (!nameInput.trim()) {
      showError("Invalid Name", "Please enter a valid staff name.");
      return;
    }
    setStaffName(nameInput.trim());
    setShowNameModal(false);
  };

  const handleSaveApiKey = async () => {
    if (!validateApiKey(apiKeyInput)) {
      showError(
        "Invalid API Key",
        "Please enter a valid OpenAI API key (starts with 'sk-').",
      );
      return;
    }
    try {
      await saveApiKey(apiKeyInput);
      setHasApiKey(true);
      setShowApiKeyModal(false);
      setApiKeyInput("");
    } catch (error) {
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
            } catch (error) {
              showError("Error", "Failed to remove API key.");
            }
          },
        },
      ],
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
          { opacity: pressed ? 0.9 : 1 },
          Platform.OS === "web" ? { cursor: "pointer" } : {},
        ]}
      >
        <LinearGradient
          colors={[theme.gradientStart, theme.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>
                {staffName.substring(0, 2).toUpperCase()}
              </ThemedText>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText style={styles.profileName}>{staffName}</ThemedText>
              <ThemedText style={styles.profileRole}>Staff Member</ThemedText>
            </View>
            <View style={styles.editIcon}>
              <Feather name="edit-2" size={14} color="rgba(255,255,255,0.6)" />
            </View>
          </View>
          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <ThemedText style={styles.profileStatValue}>
                {stats.totalOrders}
              </ThemedText>
              <ThemedText style={styles.profileStatLabel}>Total</ThemedText>
            </View>
            <View style={[styles.profileStatDivider]} />
            <View style={styles.profileStat}>
              <ThemedText style={styles.profileStatValue}>
                {stats.todayOrders}
              </ThemedText>
              <ThemedText style={styles.profileStatLabel}>Today</ThemedText>
            </View>
            <View style={[styles.profileStatDivider]} />
            <View style={styles.profileStat}>
              <ThemedText style={styles.profileStatValue}>
                {stats.completedOrders}
              </ThemedText>
              <ThemedText style={styles.profileStatLabel}>Done</ThemedText>
            </View>
          </View>
        </LinearGradient>
      </Pressable>

      <View style={styles.section}>
        <ThemedText
          type="caption"
          style={[styles.sectionTitle, { color: theme.textTertiary }]}
        >
          CONFIGURATION
        </ThemedText>
        <Card style={styles.settingsCard}>
          {isEnvKeyConfigured ? (
            <SettingsItem
              icon="key"
              label="OpenAI API Key"
              value="Pre-configured"
              valueColor={theme.success}
              showChevron={false}
            />
          ) : (
            <>
              <SettingsItem
                icon="key"
                label="OpenAI API Key"
                value={hasApiKey ? "Active" : "Required"}
                valueColor={hasApiKey ? theme.success : theme.warning}
                onPress={() => setShowApiKeyModal(true)}
              />
              {hasApiKey ? (
                <>
                  <View
                    style={[
                      styles.separator,
                      { backgroundColor: theme.borderLight },
                    ]}
                  />
                  <SettingsItem
                    icon="trash-2"
                    label="Remove API Key"
                    onPress={handleRemoveApiKey}
                    showChevron={false}
                    destructive
                  />
                </>
              ) : null}
            </>
          )}
        </Card>
        <ThemedText
          type="caption"
          style={[styles.helperText, { color: theme.textTertiary }]}
        >
          {isEnvKeyConfigured
            ? "API key is pre-configured for all users. No setup needed."
            : "Your API key is stored securely and used only for audio transcription."}
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText
          type="caption"
          style={[styles.sectionTitle, { color: theme.textTertiary }]}
        >
          PREFERENCES
        </ThemedText>
        <Card style={styles.settingsCard}>
          <SettingsItem
            icon="user"
            label="Staff Name"
            value={staffName}
            onPress={() => {
              setNameInput(staffName);
              setShowNameModal(true);
            }}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <ThemedText
          type="caption"
          style={[styles.sectionTitle, { color: theme.textTertiary }]}
        >
          ABOUT
        </ThemedText>
        <Card style={styles.settingsCard}>
          <SettingsItem
            icon="info"
            label="Version"
            value="2.0 Pro"
            showChevron={false}
          />
          <View
            style={[styles.separator, { backgroundColor: theme.borderLight }]}
          />
          <SettingsItem
            icon="shield"
            label="Privacy"
            value="On-device"
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
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="title">Edit Staff Name</ThemedText>
              <Pressable
                onPress={() => setShowNameModal(false)}
                style={Platform.OS === "web" ? { cursor: "pointer" } : {}}
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
                  borderColor: theme.borderLight,
                },
              ]}
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowNameModal(false)}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.cancelButton,
                  { borderColor: theme.border, opacity: pressed ? 0.6 : 1 },
                  Platform.OS === "web" ? { cursor: "pointer" } : {},
                ]}
              >
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveStaffName}
                style={({ pressed }) => [
                  styles.modalButton,
                  {
                    backgroundColor: theme.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                  Platform.OS === "web" ? { cursor: "pointer" } : {},
                ]}
              >
                <ThemedText
                  style={{ color: theme.buttonText, fontWeight: "600" }}
                >
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
                style={Platform.OS === "web" ? { cursor: "pointer" } : {}}
              >
                <Feather name="x" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>
            <ThemedText
              type="body"
              style={[styles.modalDescription, { color: theme.textSecondary }]}
            >
              Enter your OpenAI API key to enable audio transcription.
            </ThemedText>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                  borderColor: theme.borderLight,
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
                  { borderColor: theme.border, opacity: pressed ? 0.6 : 1 },
                  Platform.OS === "web" ? { cursor: "pointer" } : {},
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
                  {
                    backgroundColor: theme.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                  Platform.OS === "web" ? { cursor: "pointer" } : {},
                ]}
                onPress={handleSaveApiKey}
              >
                <ThemedText
                  style={{ color: theme.buttonText, fontWeight: "600" }}
                >
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
  container: { padding: Spacing.xl, gap: Spacing["2xl"] },
  profileCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing["2xl"],
    gap: Spacing.xl,
    overflow: "hidden",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  profileInfo: { flex: 1, gap: 2 },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  profileRole: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  editIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
  },
  profileStat: { alignItems: "center", gap: 2 },
  profileStatValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  profileStatLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontWeight: "500",
  },
  profileStatDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  section: { gap: Spacing.sm },
  sectionTitle: {
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: Spacing.sm,
  },
  settingsCard: { padding: 0 },
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
    width: 34,
    height: 34,
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
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  separator: { height: 1, marginLeft: 62 },
  helperText: { marginLeft: Spacing.sm, lineHeight: 18 },
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
  modalDescription: { lineHeight: 22 },
  modalInput: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: 16,
    minHeight: 52,
    borderWidth: 1,
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
  cancelButton: { borderWidth: 1 },
});
