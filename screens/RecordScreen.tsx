import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { RecordButton } from "@/components/RecordButton";
import { Card } from "@/components/Card";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  startRecording,
  stopRecording,
  requestAudioPermissions,
} from "@/utils/audioRecording";
import {
  transcribeAudio,
  extractMealAndDrinkOrders,
} from "@/utils/transcription";
import { getApiKey } from "@/utils/apiKeyStorage";
import { impactAsync, ImpactFeedbackStyle } from "@/utils/haptics";
import { showError } from "@/utils/webAlert";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from "react-native-reanimated";

export default function RecordScreen() {
  const { paddingTop, paddingBottom } = useScreenInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [processingStep, setProcessingStep] = useState("");

  const pulseOpacity = useSharedValue(0.3);

  useEffect(() => {
    if (isRecording) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 800 }),
          withTiming(0.2, { duration: 800 }),
        ),
        -1,
        false,
      );
    } else {
      pulseOpacity.value = withTiming(0.3);
    }
  }, [isRecording]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  useFocusEffect(
    React.useCallback(() => {
      checkApiKey();
    }, []),
  );

  const checkApiKey = async () => {
    const apiKey = await getApiKey();
    setHasApiKey(!!apiKey);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRecordPress = async () => {
    impactAsync(ImpactFeedbackStyle.Medium);

    if (!hasApiKey && !isRecording) {
      showError(
        "API Key Required",
        "Please add your OpenAI API key in the Profile tab to use transcription.",
      );
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      setProcessingStep("Saving recording...");

      try {
        const audioUri = await stopRecording();
        if (!audioUri) throw new Error("Failed to save recording");

        const apiKey = await getApiKey();
        if (!apiKey) throw new Error("API key not found");

        setProcessingStep("Transcribing audio...");
        const transcribedText = await transcribeAudio(audioUri, apiKey);

        setProcessingStep("Extracting order items...");
        const cleanedText = await extractMealAndDrinkOrders(
          transcribedText,
          apiKey,
        );

        setIsProcessing(false);
        setRecordingTime(0);
        setProcessingStep("");

        navigation.navigate("ConfirmOrder", {
          audioUri,
          transcribedText: cleanedText,
        });
      } catch (error: any) {
        setIsProcessing(false);
        setRecordingTime(0);
        setProcessingStep("");
        showError(
          "Transcription Error",
          error.message || "Failed to transcribe audio. Please try again.",
        );
      }
    } else {
      try {
        const hasPermission = await requestAudioPermissions();
        if (!hasPermission) {
          showError(
            "Permission Required",
            "Please allow microphone access to record audio.",
          );
          return;
        }
        await startRecording();
        setIsRecording(true);
        setRecordingTime(0);
      } catch (error: any) {
        showError(
          "Recording Error",
          error.message || "Failed to start recording",
        );
      }
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop, paddingBottom }]}>
      <View style={styles.content}>
        {isProcessing ? (
          <View style={styles.processingContainer}>
            <LinearGradient
              colors={[theme.gradientStart + "15", theme.gradientEnd + "15"]}
              style={styles.processingGlow}
            />
            <View
              style={[
                styles.processingIcon,
                { backgroundColor: theme.primarySoft },
              ]}
            >
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
            <ThemedText
              type="title"
              style={[styles.processingTitle, { color: theme.text }]}
            >
              Processing Order
            </ThemedText>
            <ThemedText
              type="caption"
              style={{ color: theme.textSecondary, textAlign: "center" }}
            >
              {processingStep}
            </ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.headerSection}>
              <ThemedText style={[styles.title, { color: theme.text }]}>
                {isRecording ? "Recording..." : "New Order"}
              </ThemedText>
              <ThemedText
                type="caption"
                style={{ color: theme.textSecondary, textAlign: "center" }}
              >
                {isRecording
                  ? "Speak clearly into the microphone"
                  : "Tap the button to start recording an order"}
              </ThemedText>
            </View>

            {isRecording ? (
              <Card style={styles.timerCard}>
                <View style={styles.timerContent}>
                  <View
                    style={[
                      styles.recordingDot,
                      { backgroundColor: theme.recording },
                    ]}
                  />
                  <ThemedText style={[styles.timer, { color: theme.primary }]}>
                    {formatTime(recordingTime)}
                  </ThemedText>
                </View>
              </Card>
            ) : null}

            <View style={styles.buttonArea}>
              {isRecording ? (
                <Animated.View
                  style={[
                    styles.pulseRing,
                    { borderColor: theme.recording },
                    pulseStyle,
                  ]}
                />
              ) : null}
              <RecordButton
                isRecording={isRecording}
                onPress={handleRecordPress}
              />
            </View>

            {isRecording ? (
              <View style={styles.waveform}>
                {[...Array(20)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveBar,
                      {
                        height: Math.random() * 50 + 8,
                        backgroundColor: theme.primary,
                        opacity: 0.3 + Math.random() * 0.7,
                      },
                    ]}
                  />
                ))}
              </View>
            ) : null}

            {!hasApiKey ? (
              <Card accentColor={theme.warning} style={styles.warningCard}>
                <View style={styles.warningContent}>
                  <View
                    style={[
                      styles.warningIcon,
                      { backgroundColor: theme.warningLight },
                    ]}
                  >
                    <Feather
                      name="alert-triangle"
                      size={16}
                      color={theme.warning}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText
                      style={{
                        color: theme.warning,
                        fontWeight: "600",
                        fontSize: 14,
                      }}
                    >
                      API Key Required
                    </ThemedText>
                    <ThemedText
                      type="caption"
                      style={{ color: theme.textSecondary }}
                    >
                      Go to Profile tab to configure your API key
                    </ThemedText>
                  </View>
                </View>
              </Card>
            ) : null}

            {!isRecording && hasApiKey ? (
              <View style={styles.tipContainer}>
                <View
                  style={[
                    styles.tipIcon,
                    { backgroundColor: theme.primarySoft },
                  ]}
                >
                  <Feather name="info" size={14} color={theme.primary} />
                </View>
                <ThemedText
                  type="caption"
                  style={{ color: theme.textSecondary, flex: 1 }}
                >
                  Speak naturally - AI will extract and organize order items
                  automatically
                </ThemedText>
              </View>
            ) : null}
          </>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    gap: Spacing["2xl"],
  },
  headerSection: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  timerCard: {
    paddingHorizontal: Spacing["3xl"],
    paddingVertical: Spacing.lg,
  },
  timerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timer: {
    fontSize: 40,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  buttonArea: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: Spacing.lg,
  },
  pulseRing: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    height: 60,
    paddingHorizontal: Spacing.xl,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  warningCard: {
    padding: Spacing.lg,
    marginHorizontal: Spacing.xl,
  },
  warningContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  warningIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  processingContainer: {
    alignItems: "center",
    gap: Spacing.xl,
  },
  processingGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  processingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing["2xl"],
  },
  tipIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
