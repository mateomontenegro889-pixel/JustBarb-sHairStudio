import React, { useState, useRef, useEffect } from "react";
import { View, Pressable, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface AudioPlayerProps {
  audioUri: string;
  duration?: string;
}

export function AudioPlayer({ audioUri, duration = "0:00" }: AudioPlayerProps) {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const webAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (webAudioRef.current) {
        webAudioRef.current.pause();
      }
    };
  }, []);

  const togglePlayback = async () => {
    try {
      if (Platform.OS === 'web') {
        if (!webAudioRef.current) {
          webAudioRef.current = new window.Audio(audioUri);
          webAudioRef.current.onended = () => setIsPlaying(false);
        }
        
        if (isPlaying) {
          webAudioRef.current.pause();
          setIsPlaying(false);
        } else {
          await webAudioRef.current.play();
          setIsPlaying(true);
        }
      } else {
        if (isPlaying && soundRef.current) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          if (!soundRef.current) {
            const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
            soundRef.current = sound;
            sound.setOnPlaybackStatusUpdate((status) => {
              if (status.isLoaded && status.didJustFinish) {
                setIsPlaying(false);
              }
            });
          }
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Playback error:', error);
      setIsPlaying(false);
    }
  };

  return (
    <Card>
      <View style={styles.container}>
        <Pressable
          onPress={togglePlayback}
          style={({ pressed }) => [
            styles.playButton,
            {
              backgroundColor: theme.primary,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <Feather
            name={isPlaying ? "pause" : "play"}
            size={20}
            color={theme.buttonText}
          />
        </Pressable>
        <View style={styles.waveformContainer}>
          <View style={styles.waveform}>
            {[...Array(20)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.bar,
                  {
                    height: Math.random() * 20 + 10,
                    backgroundColor: theme.primary,
                  },
                ]}
              />
            ))}
          </View>
        </View>
        <ThemedText style={styles.duration} type="caption">
          {duration}
        </ThemedText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  waveformContainer: {
    flex: 1,
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    height: 30,
  },
  bar: {
    flex: 1,
    borderRadius: 2,
  },
  duration: {
    minWidth: 40,
    textAlign: "right",
  },
});
