# Order Transcribe

## Overview

Order Transcribe is a React Native mobile application built with Expo that enables restaurant staff to record spoken orders and automatically transcribe them into structured text using OpenAI's Whisper API. The app supports order management including creating, viewing, editing, and tracking order history with table assignments and guest counts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation v7 with a bottom tab navigator containing three stack navigators (Record, History, Profile)
- **UI Components**: Custom themed components (ThemedText, ThemedView, Card) with dark/light mode support
- **Animations**: React Native Reanimated for smooth UI animations (record button pulse effect)
- **Gestures**: React Native Gesture Handler for touch interactions

### State Management
- Local component state using React hooks (useState, useEffect)
- No global state management library - state is passed through navigation params
- Order data persisted in SQLite database

### Data Storage
- **SQLite Database** (expo-sqlite): Stores orders with fields for id, audioUri, transcribedText, staffName, timestamp, duration, tableNumber, guestCount, and status
- **Secure Storage** (expo-secure-store): Stores OpenAI API key securely on device (falls back to localStorage on web)
- **File System**: Audio recordings stored locally via expo-file-system

### Audio Recording
- Uses expo-av for audio recording with HIGH_QUALITY preset
- Recordings saved as M4A format
- Permission handling for microphone access

### Theming System
- Custom theme system with Colors, Spacing, BorderRadius, and Typography constants
- Automatic dark/light mode detection via useColorScheme hook
- Platform-specific styling (iOS blur effects, Android solid backgrounds)

### Screen Flow
1. **Record Tab**: Record audio → Process with AI → Confirm Order (modal) → Save to database
2. **History Tab**: View all orders → Order Details → Edit/Delete/Share/Add more items
3. **Profile Tab**: Manage OpenAI API key settings

## External Dependencies

### Third-Party APIs
- **OpenAI Whisper API** (`/v1/audio/transcriptions`): Converts audio recordings to text
- **OpenAI Chat Completions API** (`/v1/chat/completions`): Extracts structured meal and drink orders from transcribed text

### Key Libraries
- `expo-av`: Audio recording functionality
- `expo-sqlite`: Local SQLite database for order persistence
- `expo-secure-store`: Secure API key storage
- `expo-file-system`: File system access for audio files
- `expo-haptics`: Haptic feedback on interactions
- `react-native-keyboard-controller`: Keyboard-aware scroll views
- `expo-blur`: iOS blur effects for navigation elements

### Platform Support
- iOS, Android, and Web (with platform-specific fallbacks)
- Web uses localStorage instead of SecureStore
- Web uses ScreenScrollView instead of KeyboardAwareScrollView