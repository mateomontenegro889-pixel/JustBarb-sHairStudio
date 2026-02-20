import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export async function transcribeAudio(audioUri: string, apiKey: string): Promise<string> {
  try {
    if (!apiKey) throw new Error('OpenAI API key is required for transcription');

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
    formData.append('language', 'en');
    formData.append('prompt', 'Restaurant order transcription. Customer ordering food and drinks.');

    const apiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: formData,
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Transcription failed with status ${apiResponse.status}`);
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
            content: `You are a premium restaurant order processing assistant. Extract and organize orders from customer speech.

Format the output as a clean, structured order:

FOOD:
- [quantity]x [item name] [any modifications/notes]

DRINKS:
- [quantity]x [item name] [any modifications/notes]

SPECIAL REQUESTS:
- [any allergies, dietary needs, or special instructions]

Rules:
- Remove all filler words, greetings, and conversation
- Infer quantities (default to 1 if not specified)
- Group similar items
- Note any modifications (no onions, extra cheese, etc.)
- If item category is unclear, put it under FOOD
- If no items found, return "No items detected"
- Keep it concise and professional`,
          },
          {
            role: 'user',
            content: `Process this restaurant order:\n\n"${transcribedText}"`,
          },
        ],
        temperature: 0.2,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Order extraction failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Order extraction error:', error);
    throw error;
  }
}

export function validateApiKey(apiKey: string): boolean {
  const trimmed = apiKey.trim();
  return trimmed.length > 20 && (
    trimmed.startsWith('sk-') || 
    trimmed.startsWith('sk-proj-') ||
    trimmed.startsWith('sk-org-')
  );
}
