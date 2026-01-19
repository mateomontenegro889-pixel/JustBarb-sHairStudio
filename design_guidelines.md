# Restaurant Order Transcription App - Design Guidelines

## 1. Brand Identity

**Purpose**: Streamline restaurant order-taking by transcribing voice to text, reducing errors and improving kitchen efficiency.

**Aesthetic Direction**: Clean editorial with luxurious refinement. Think magazine layout meets premium iOS app—generous whitespace, sophisticated purple gradients, and typographic hierarchy that guides the eye effortlessly.

**Memorable Element**: Gradient-topped cards that flow from vibrant purple to softer indigo, creating visual rhythm throughout the app. Each order card has a colored left accent bar indicating status (new, in-progress, completed).

## 2. Navigation Architecture

**Root Navigation**: Tab Bar (3 tabs)
- **Orders** (Home) - View active and recent orders
- **New Order** (Center, primary action) - Create/transcribe new order
- **Profile** - Settings, order history, account

**Information Architecture**:
- Orders → Order Detail (stack push)
- New Order → Voice Recording Modal (modal)
- Profile → Settings (stack push)
- Profile → Order History (stack push)

## 3. Screen Specifications

### Orders Screen (Home Tab)
**Purpose**: View and manage active orders

**Layout**:
- Transparent header with "Orders" title (bold, large), filter button on right
- Scrollable content area with safe area insets: top (headerHeight + 24px), bottom (tabBarHeight + 24px)
- Segmented control below header: "Active" | "Completed"

**Components**:
- Order cards: Large rounded rectangles (16px radius) with 4px colored left border
  - Card shadow: offset (0, 1), opacity 0.05, radius 3
  - Card spacing: 16px vertical gap
  - Content: Order number (bold), table number, items preview (2 lines max), timestamp
  - Tap card → navigate to Order Detail
- Empty state when no orders: Centered illustration with "No active orders" heading

### Order Detail Screen
**Purpose**: View full order details, edit if needed

**Layout**:
- Default iOS navigation header with back button (left), "Edit" button (right)
- Scrollable content with safe area insets: top (24px), bottom (insets.bottom + 24px)

**Components**:
- Status badge at top (pill shape, colored background): "New", "Preparing", "Ready"
- Order info card: White rounded card with table number, server name, timestamp
- Items list: Each item in white card with quantity badge (purple circle), item name, modifiers in gray
- Total card at bottom: Sticky positioning, white background, bold total amount
- Action buttons below total: "Mark Ready" (primary purple pill button)

### New Order Screen (Center Tab)
**Purpose**: Create order via voice transcription or manual entry

**Layout**:
- Opens as full-screen modal with gradient header (purple #7C3AED to indigo #6366F1)
- Header contains: "Cancel" (left), "New Order" title (white, centered), "Done" (right, white)
- Scrollable form content with safe area insets: top (24px), bottom (insets.bottom + 24px)

**Components**:
- Voice recording button: Large circular purple button with microphone icon, centered
- Transcription preview: White rounded card showing live text
- Table selection: Horizontal scrolling pill chips (white with purple border, selected has purple fill)
- Items section: Add item button (pill outline), item rows with remove button
- Submit button: Large purple pill at bottom, "Create Order" text

### Profile Screen
**Purpose**: Access settings, view stats, manage account

**Layout**:
- Transparent header with "Profile" title
- Scrollable content with safe area insets: top (headerHeight + 24px), bottom (tabBarHeight + 24px)

**Components**:
- User card at top: Large white rounded card with avatar (circular, purple gradient background with initials), name, role
- Stats row: 3 cards showing orders today, week, month (white cards, numbers in purple)
- Settings list: Grouped white cards with chevron indicators
  - Order History
  - Notifications
  - Account Settings → Delete Account (nested, requires double confirmation)

### Order History Screen
**Purpose**: Browse all past orders

**Layout**:
- Default iOS header with back button (left), search icon (right)
- Scrollable list with safe area insets: top (headerHeight + 16px), bottom (insets.bottom + 16px)

**Components**:
- Date section headers (gray text, small caps)
- Order cards (same style as Orders screen but no colored border)
- Empty state if no history

## 4. Color Palette

**Primary**:
- Purple: #7C3AED (buttons, active states, accents)
- Indigo: #6366F1 (secondary actions, gradients)

**Backgrounds**:
- Screen: #F8F9FA (light gray)
- Card: #FFFFFF (white)
- Surface Elevated: #FFFFFF with shadow

**Text**:
- Primary: #1F2937 (dark gray, headings)
- Secondary: #6B7280 (medium gray, body)
- Tertiary: #9CA3AF (light gray, labels)

**Semantic**:
- Success: #10B981 (green, completed orders)
- Warning: #F59E0B (amber, in-progress)
- Error: #EF4444 (red, cancelled)

**Status Accent Bars**:
- New: #7C3AED (purple)
- Preparing: #F59E0B (amber)
- Ready: #10B981 (green)

## 5. Typography

**Font**: SF Pro (iOS system font)

**Type Scale**:
- Large Title: 34px, Bold (screen titles)
- Title 1: 28px, Bold (card headings)
- Title 2: 22px, Semibold (section headers)
- Headline: 17px, Semibold (list items)
- Body: 17px, Regular (content)
- Callout: 16px, Regular (secondary text)
- Subheadline: 15px, Regular (metadata)
- Caption: 12px, Regular (timestamps)

## 6. Assets to Generate

**icon.png** - App icon featuring stylized microphone or notepad with purple gradient background. Used on device home screen.

**splash-icon.png** - Simplified version of app icon on white background. Shown during app launch.

**empty-orders.png** - Illustration of empty clipboard or notepad with subtle purple accent. Clean, minimal line art. WHERE USED: Orders screen when no active orders exist.

**empty-history.png** - Illustration of calendar pages or archive box in light gray/purple tones. WHERE USED: Order History screen when no past orders.

**voice-animation.png** - Animated waveform or sound rings illustration in purple gradient. Modern, abstract. WHERE USED: New Order screen during voice recording.

**avatar-preset.png** - Single default user avatar with purple gradient background and white initials placeholder. WHERE USED: Profile screen for users without custom photo.