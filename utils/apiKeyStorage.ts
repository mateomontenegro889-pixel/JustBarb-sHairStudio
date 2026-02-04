import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const OPENAI_API_KEY_STORAGE_KEY = 'openai_api_key';

function getEnvApiKey(): string | null {
  try {
    // Debug logging
    console.log('[apiKeyStorage] Constants.expoConfig?.extra:', JSON.stringify(Constants.expoConfig?.extra));
    
    let envKey = Constants.expoConfig?.extra?.openaiApiKey;
    console.log('[apiKeyStorage] envKey from extra:', typeof envKey, envKey ? 'exists' : 'null');
    
    if (typeof envKey === 'string' && envKey.length > 0) {
      return envKey;
    }
    
    // Try direct process.env access
    if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_OPENAI_API_KEY) {
      const processKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      console.log('[apiKeyStorage] processKey:', typeof processKey, processKey ? 'exists' : 'null');
      if (typeof processKey === 'string' && processKey.length > 0) {
        return processKey;
      }
    }
    
    return null;
  } catch (e) {
    console.error('[apiKeyStorage] Error getting env key:', e);
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
    console.log('[apiKeyStorage] getApiKey - envKey found:', !!envKey);
    if (envKey) {
      return envKey;
    }
    
    if (Platform.OS === 'web') {
      const storedKey = localStorage.getItem(OPENAI_API_KEY_STORAGE_KEY);
      console.log('[apiKeyStorage] getApiKey - storedKey from localStorage:', !!storedKey);
      return storedKey;
    } else {
      const storedKey = await SecureStore.getItemAsync(OPENAI_API_KEY_STORAGE_KEY);
      console.log('[apiKeyStorage] getApiKey - storedKey from SecureStore:', !!storedKey);
      return storedKey;
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
