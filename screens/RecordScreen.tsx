import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { RecordButton } from "@/components/RecordButton";
import { Card } from "@/components/Card";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { startRecording, stopRecording, requestAudioPermissions } from "@/utils/audioRecording";
import { transcribeAudio, extractMealAndDrinkOrders } from "@/utils/transcription";
import { getApiKey } from "@/utils/apiKeyStorage";
import { impactAsync, ImpactFeedbackStyle } from "@/utils/haptics";

export default function RecordScreen() {
  const { paddingTop, paddingBottom } = useScreenInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      checkApiKey();
    }, [])
  );

  const checkApiKey = async () => {
    const apiKey = await getApiKey();
    setHasApiKey(!!apiKey);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
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
    console.log('[RecordScreen] handleRecordPress called, isRecording:', isRecording, 'hasApiKey:', hasApiKey);
    
    impactAsync(ImpactFeedbackStyle.Medium);

    if (!hasApiKey && !isRecording) {
      console.log('[RecordScreen] No API key, showing alert');
      Alert.alert(
        "API Key Required",
        "Please add your OpenAI API key in the Profile tab to use transcription.",
        [{ text: "OK" }]
      );
      return;
    }

    if (isRecording) {
      console.log('[RecordScreen] Stopping recording...');
      setIsRecording(false);
      setIsProcessing(true);

      try {
        const audioUri = await stopRecording();
        console.log('[RecordScreen] Recording stopped, audioUri:', audioUri);
        
        if (!audioUri) {
          throw new Error("Failed to save recording");
        }

        const apiKey = await getApiKey();
        if (!apiKey) {
          throw new Error("API key not found");
        }

        console.log('[RecordScreen] Starting transcription...');
        const transcribedText = await transcribeAudio(audioUri, apiKey);
        console.log('[RecordScreen] Transcription complete:', transcribedText);
        const cleanedText = await extractMealAndDrinkOrders(transcribedText, apiKey);
        console.log('[RecordScreen] Cleaned text:', cleanedText);

        setIsProcessing(false);
        setRecordingTime(0);

        navigation.navigate("ConfirmOrder", {
          audioUri,
          transcribedText: cleanedText,
        });
      } catch (error: any) {
        console.error('[RecordScreen] Error:', error);
        setIsProcessing(false);
        setRecordingTime(0);
        
        const errorMessage = error.message || "Failed to transcribe audio. Please try again.";
        Alert.alert("Transcription Error", errorMessage);
      }
    } else {
      console.log('[RecordScreen] Starting recording...');
      try {
        const hasPermission = await requestAudioPermissions();
        console.log('[RecordScreen] Permission result:', hasPermission);
        if (!hasPermission) {
          Alert.alert(
            "Permission Required",
            "Please allow microphone access to record audio.",
            [{ text: "OK" }]
          );
          return;
        }

        await startRecording();
        console.log('[RecordScreen] Recording started');
        setIsRecording(true);
        setRecordingTime(0);
      } catch (error: any) {
        console.error('[RecordScreen] Start recording error:', error);
        Alert.alert("Recording Error", error.message || "Failed to start recording");
      }
    }
  };

  const getStatusText = (): string => {
    if (isProcessing) return "Processing your order...";
    if (isRecording) return "Listening...";
    return "Tap the button to start recording";
  };

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop,
          paddingBottom,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <ThemedText type="title" style={styles.title}>
            New Order
          </ThemedText>
          <ThemedText type="caption" style={styles.subtitle}>
            Speak clearly to record the order
          </ThemedText>
        </View>

        {isRecording ? (
          <Card style={styles.timerCard}>
            <View style={styles.timerContent}>
              <View style={[styles.recordingIndicator, { backgroundColor: theme.recording }]} />
              <ThemedText type="title" style={[styles.timer, { color: theme.primary }]}>
                {formatTime(recordingTime)}
              </ThemedText>
            </View>
          </Card>
        ) : null}

        <View style={styles.buttonContainer}>
          <RecordButton
            isRecording={isRecording}
            onPress={handleRecordPress}
          />
        </View>

        <View style={styles.waveformContainer}>
          {isRecording ? (
            <View style={styles.waveform}>
              {[...Array(15)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveBar,
                    {
                      height: Math.random() * 40 + 10,
                      backgroundColor: theme.primary,
                    },
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>

        <ThemedText type="body" style={[styles.statusText, { color: theme.textSecondary }]}>
          {getStatusText()}
        </ThemedText>

        {!hasApiKey ? (
          <Card accentColor={theme.warning} style={styles.warningCard}>
            <View style={styles.warningContent}>
              <ThemedText style={{ color: theme.warning, fontWeight: "600" }}>
                API Key Required
              </ThemedText>
              <ThemedText type="caption">
                Go to Profile tab to add your OpenAI API key
              </ThemedText>
            </View>
          </Card>
        ) : null}
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
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
  },
  timerCard: {
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.lg,
  },
  timerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timer: {
    fontSize: 36,
    fontWeight: "700",
  },
  buttonContainer: {
    marginVertical: Spacing.xl,
  },
  waveformContainer: {
    height: 60,
    justifyContent: "center",
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 50,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
  },
  statusText: {
    textAlign: "center",
  },
  warningCard: {
    padding: Spacing.lg,
  },
  warningContent: {
    gap: Spacing.xs,
  },
});
