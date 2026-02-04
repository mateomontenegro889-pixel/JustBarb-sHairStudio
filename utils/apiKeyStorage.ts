import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const OPENAI_API_KEY_STORAGE_KEY = 'openai_api_key';

function getEnvApiKey(): string | null {
  try {
    const envKey = Constants.expoConfig?.extra?.openaiApiKey || 
                   process.env.EXPO_PUBLIC_OPENAI_API_KEY ||
                   null;
    return envKey;
  } catch {
    return null;
  }
}

export async function saveApiKey(apiKey: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(OPENAI_API_KEY_STORAGE_KEY, apiKey);
    } else {
      await SecureStore.setItemAsync(OPENAI_API_KEY_STORAGE_KEY, apiKey);
    }
  } catch (error) {
    console.error('Failed to save API key:', error);
    throw error;
  }
}

export async function getApiKey(): Promise<string | null> {
  try {
    const envKey = getEnvApiKey();
    if (envKey) {
      return envKey;
    }
    
    if (Platform.OS === 'web') {
      return localStorage.getItem(OPENAI_API_KEY_STORAGE_KEY);
    } else {
      return await SecureStore.getItemAsync(OPENAI_API_KEY_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to get API key:', error);
    return null;
  }
}

export async function deleteApiKey(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(OPENAI_API_KEY_STORAGE_KEY);
    } else {
      await SecureStore.deleteItemAsync(OPENAI_API_KEY_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to delete API key:', error);
    throw error;
  }
}

export function hasEnvApiKey(): boolean {
  return !!getEnvApiKey();
}
