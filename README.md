# Order Transcribe

A React Native mobile app for restaurant staff to record customer orders via audio and transcribe them using OpenAI's Whisper API.

## Features

- Voice recording with real-time transcription
- Automatic meal/drink extraction using AI
- Table assignment (1-12) and guest count (1-10)
- Order status management (open/closed)
- Order history with search
- Add more items to existing orders

## Deploy to Google Cloud Run

### Prerequisites

1. [Google Cloud account](https://cloud.google.com/)
2. [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed
3. A Google Cloud project with billing enabled

### Quick Deploy

1. **Authenticate with Google Cloud:**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Enable required APIs:**
   ```bash
   gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com
   ```

3. **Deploy with Cloud Build:**
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

Your app will be available at: `https://order-transcribe-xxxxx.run.app`

### Manual Deploy

```bash
# Build the container
docker build -t gcr.io/YOUR_PROJECT_ID/order-transcribe .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/order-transcribe

# Deploy to Cloud Run
gcloud run deploy order-transcribe \
  --image gcr.io/YOUR_PROJECT_ID/order-transcribe \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Configuration

The app requires an OpenAI API key for transcription. Users can add their API key in the Profile tab - it's stored securely on the device.

## Tech Stack

- React Native with Expo SDK 54
- SQLite for local storage (browser IndexedDB on web)
- OpenAI Whisper API for transcription
- GPT-4 for order extraction
- Docker + Nginx for deployment
