import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { RecordButton } from "@/components/RecordButton";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { Spacing } from "@/constants/theme";
import { startRecording, stopRecording, requestAudioPermissions } from "@/utils/audioRecording";
import { transcribeAudio, extractMealAndDrinkOrders } from "@/utils/transcription";
import { getApiKey } from "@/utils/apiKeyStorage";
import { impactAsync, ImpactFeedbackStyle } from "@/utils/haptics";
import { showError } from "@/utils/webAlert";

export default function RecordMoreScreen() {
  const { paddingTop, paddingBottom } = useScreenInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { existingOrderId } = route.params as { existingOrderId: string };
  
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
    impactAsync(ImpactFeedbackStyle.Medium);

    if (!hasApiKey && !isRecording) {
      showError(
        "API Key Required",
        "Please add your OpenAI API key in the Profile tab to use transcription."
      );
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);

      try {
        const audioUri = await stopRecording();
        
        if (!audioUri) {
          throw new Error("Failed to save recording");
        }

        const apiKey = await getApiKey();
        if (!apiKey) {
          throw new Error("API key not found");
        }

        const transcribedText = await transcribeAudio(audioUri, apiKey);
        const cleanedText = await extractMealAndDrinkOrders(transcribedText, apiKey);

        setIsProcessing(false);
        setRecordingTime(0);

        navigation.navigate("ConfirmAddItems", {
          audioUri,
          transcribedText: cleanedText,
          existingOrderId,
        });
      } catch (error: any) {
        setIsProcessing(false);
        setRecordingTime(0);
        
        const errorMessage = error.message || "Failed to transcribe audio. Please try again.";
        showError("Transcription Error", errorMessage);
      }
    } else {
      try {
        const hasPermission = await requestAudioPermissions();
        if (!hasPermission) {
          showError(
            "Permission Required",
            "Please allow microphone access to record audio."
          );
          return;
        }

        await startRecording();
        setIsRecording(true);
        setRecordingTime(0);
      } catch (error: any) {
        showError("Recording Error", error.message || "Failed to start recording");
      }
    }
  };

  const getStatusText = (): string => {
    if (isProcessing) return "Processing...";
    if (isRecording) return "Recording additional items...";
    return "Tap to record more items";
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
        <ThemedText type="caption" style={styles.subtitle}>
          Adding to existing order
        </ThemedText>

        {isRecording ? (
          <ThemedText type="title" style={styles.timer}>
            {formatTime(recordingTime)}
          </ThemedText>
        ) : null}

        <RecordButton
          isRecording={isRecording}
          onPress={handleRecordPress}
        />

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
                    },
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>

        <ThemedText type="caption" style={styles.statusText}>
          {getStatusText()}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    gap: Spacing["2xl"],
  },
  subtitle: {
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  timer: {
    fontSize: 32,
    fontWeight: "700",
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
    backgroundColor: "#2563EB",
    borderRadius: 2,
  },
  statusText: {
    textAlign: "center",
  },
});
