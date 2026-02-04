// This file exports configuration values that are inlined at build time
// The EXPO_PUBLIC_ prefix ensures these are available in the client bundle

export const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
