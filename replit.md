# Order Transcribe

## Overview

Order Transcribe is a premium React Native mobile application built with Expo that enables restaurant staff to record spoken orders and automatically transcribe them into structured text using OpenAI's Whisper API. Features a real-time analytics dashboard, AI-powered order categorization (Food, Drinks, Special Requests), professional order status workflow (New > Preparing > Ready > Served > Completed), and a visual 12-table map. The app supports order management including creating, viewing, editing, and tracking order history with table assignments (1-12) and guest counts (1-10).

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Premium UI Upgrade**: Purple/indigo gradient theme with LinearGradient hero cards, modern Card components, polished typography
- **Dashboard Tab**: Real-time analytics with stats grid, table overview map, recent activity feed, quick stats
- **Enhanced AI**: Order categorization into Food, Drinks, Special Requests with quantities via GPT-4o-mini
- **Order Status Workflow**: 5-step progress: New > Preparing > Ready > Served > Completed with visual progress bar
- **4-Tab Navigation**: Dashboard (initial), Record, Orders, Profile
- **Profile Upgrade**: Gradient staff card with stats, pre-configured API key indicator
- **Orders Filters**: All/Active/Done filter buttons with count badges

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation v7 with a bottom tab navigator containing four stack navigators (Dashboard, Record, History, Profile)
- **UI Components**: Custom themed components (ThemedText, ThemedView, Card, OrderCard) with dark/light mode support
- **Animations**: React Native Reanimated for smooth UI animations (record button pulse, processing states)
- **Gradients**: expo-linear-gradient for hero cards and profile sections

### State Management
- Local component state using React hooks (useState, useEffect)
- No global state management library - state is passed through navigation params
- Order data persisted in SQLite database
- orderStore utility wraps all database operations

### Data Storage
- **SQLite Database** (expo-sqlite): Stores orders with fields for id, audioUri, transcribedText, staffName, timestamp, duration, tableNumber, guestCount, status, category, totalItems
- **Secure Storage** (expo-secure-store): Stores OpenAI API key securely on device (falls back to localStorage on web)
- **File System**: Audio recordings stored locally via expo-file-system

### Audio Recording
- Uses expo-av for audio recording with HIGH_QUALITY preset
- Recordings saved as M4A format
- Permission handling for microphone access

### Theming System
- Custom theme system with Colors, Spacing, BorderRadius, and Typography constants
- Premium purple/indigo gradient color scheme
- Automatic dark/light mode detection via useColorScheme hook
- Platform-specific styling (iOS blur effects, Android solid backgrounds)

### Screen Flow
1. **Dashboard Tab** (Initial): Real-time analytics, table map, recent activity
2. **Record Tab**: Record audio > Process with AI > Confirm Order (modal) > Save to database
3. **Orders Tab**: View all orders with filters > Order Details > Status workflow > Add more items
4. **Profile Tab**: Staff card, API key config, staff name, about info

### Order Status Workflow
- **New**: Order just created
- **Preparing**: Kitchen is preparing the order
- **Ready**: Order ready for service
- **Served**: Order delivered to table
- **Completed**: Order finished

## External Dependencies

### Third-Party APIs
- **OpenAI Whisper API** (`/v1/audio/transcriptions`): Converts audio recordings to text
- **OpenAI Chat Completions API** (`/v1/chat/completions`, model: gpt-4o-mini): Extracts and categorizes structured meal/drink orders from transcribed text

### Key Libraries
- `expo-av`: Audio recording functionality
- `expo-sqlite`: Local SQLite database for order persistence
- `expo-secure-store`: Secure API key storage
- `expo-file-system`: File system access for audio files
- `expo-haptics`: Haptic feedback on interactions
- `expo-linear-gradient`: Gradient backgrounds for premium UI
- `react-native-keyboard-controller`: Keyboard-aware scroll views
- `expo-blur`: iOS blur effects for navigation elements

### Platform Support
- iOS, Android, and Web (with platform-specific fallbacks)
- Web uses localStorage instead of SecureStore
- Web uses ScreenScrollView instead of KeyboardAwareScrollView
- SQLite has limited web support; works fully on native devices
