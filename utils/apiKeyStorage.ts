import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { OPENAI_API_KEY } from './config';

const OPENAI_API_KEY_STORAGE_KEY = 'openai_api_key';

function getEnvApiKey(): string | null {
  try {
    // Use the pre-configured API key from config (inlined at build time)
    if (OPENAI_API_KEY && OPENAI_API_KEY.length > 0) {
      console.log('[apiKeyStorage] Found key via config');
      return OPENAI_API_KEY;
    }
    
    console.log('[apiKeyStorage] No API key found in config');
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
