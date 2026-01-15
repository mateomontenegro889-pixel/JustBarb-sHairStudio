import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { RecordButton } from "@/components/RecordButton";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { Spacing } from "@/constants/theme";
import { startRecording, stopRecording, requestAudioPermissions } from "@/utils/audioRecording";
import { transcribeAudio, extractMealAndDrinkOrders } from "@/utils/transcription";
import { getApiKey } from "@/utils/apiKeyStorage";
import { impactAsync, ImpactFeedbackStyle } from "@/utils/haptics";

export default function RecordScreen() {
  const { paddingTop, paddingBottom } = useScreenInsets();
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
    if (isProcessing) return "Processing...";
    if (isRecording) return "Recording...";
    return "Tap to start recording";
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
