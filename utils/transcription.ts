import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export async function transcribeAudio(audioUri: string, apiKey: string): Promise<string> {
  try {
    if (!apiKey) {
      throw new Error('OpenAI API key is required for transcription');
    }

    const formData = new FormData();
    
    if (Platform.OS === 'web') {
      const response = await fetch(audioUri);
      const blob = await response.blob();
      formData.append('file', blob, 'recording.webm');
    } else {
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);
    }
    
    formData.append('model', 'whisper-1');

    const apiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || 
        `Transcription failed with status ${apiResponse.status}`
      );
    }

    const data = await apiResponse.json();
    return data.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

export async function extractMealAndDrinkOrders(transcribedText: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a restaurant order processor. Extract ONLY the meal and drink requests from the customer transcription. Remove all chatter, greetings, and unnecessary words. Format as a concise list of meals and drinks ordered. If no meals or drinks are mentioned, return "No order".',
          },
          {
            role: 'user',
            content: `Extract the meal and drink orders from this transcription:\n\n"${transcribedText}"`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || 
        `Order extraction failed with status ${response.status}`
      );
    }

    const data = await response.json();
    const cleanedText = data.choices[0].message.content.trim();
    return cleanedText;
  } catch (error) {
    console.error('Order extraction error:', error);
    throw error;
  }
}

export function validateApiKey(apiKey: string): boolean {
  return apiKey.trim().length > 0 && apiKey.startsWith('sk-');
}
