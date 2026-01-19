import React, { useEffect, useCallback } from "react";
import { Pressable, StyleSheet, Platform, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";

interface RecordButtonProps {
  isRecording: boolean;
  onPress: () => void;
}

export function RecordButton({ isRecording, onPress }: RecordButtonProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.3);

  useEffect(() => {
    if (isRecording) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
      ringScale.value = withRepeat(
        withSequence(
          withTiming(1.4, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        false
      );
      ringOpacity.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 })
        ),
        -1,
        false
      );
    } else {
      scale.value = withSpring(1);
      ringScale.value = withSpring(1);
      ringOpacity.value = withTiming(0.3);
    }
  }, [isRecording]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  return (
    <View style={styles.container}>
      {isRecording ? (
        <Animated.View
          style={[
            styles.ring,
            { borderColor: theme.recording },
            ringStyle,
          ]}
        />
      ) : null}
      <Pressable
        onPress={handlePress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={isRecording ? "Stop recording" : "Start recording"}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: isRecording ? theme.recording : theme.primary,
            opacity: pressed ? 0.9 : 1,
            cursor: Platform.OS === 'web' ? 'pointer' : undefined,
            ...Platform.select({
              ios: {
                shadowColor: isRecording ? theme.recording : theme.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
              },
              android: {
                elevation: 8,
              },
              web: {
                boxShadow: isRecording 
                  ? `0 8px 24px ${theme.recording}66`
                  : `0 8px 24px ${theme.primary}66`,
              },
            }),
          },
        ]}
      >
        <Animated.View style={[styles.iconContainer, animatedStyle]}>
          <Feather
            name={isRecording ? "square" : "mic"}
            size={48}
            color={theme.buttonText}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
  },
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
