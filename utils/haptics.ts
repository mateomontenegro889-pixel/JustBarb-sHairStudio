import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export async function impactAsync(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  try {
    await Haptics.impactAsync(style);
  } catch (error) {
    console.warn('Haptics not available:', error);
  }
}

export async function notificationAsync(type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  try {
    await Haptics.notificationAsync(type);
  } catch (error) {
    console.warn('Haptics not available:', error);
  }
}

export async function selectionAsync(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    console.warn('Haptics not available:', error);
  }
}

export { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';
