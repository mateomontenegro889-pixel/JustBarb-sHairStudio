# Stage 1: Build the Expo web app
FROM node:20-alpine AS builder

# Increase memory for build and set CI mode
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV CI=true
ENV EXPO_NO_DOCTOR=true

WORKDIR /app

# Install git (required by some Expo dependencies)
RUN apk add --no-cache git

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the web version using Expo's Metro bundler
RUN npx expo export --platform web

# Debug: Show what was created
RUN echo "=== Build output ===" && ls -la dist/ && ls -la dist/_expo/ 2>/dev/null || true

# Validate build output
RUN test -f dist/index.html || (echo "ERROR: index.html not found in dist/" && exit 1)

# Stage 2: Serve with nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Verify files are present
RUN echo "=== Nginx html contents ===" && ls -la /usr/share/nginx/html/ && \
    test -f /usr/share/nginx/html/index.html || (echo "ERROR: index.html missing!" && exit 1)

# Test nginx config
RUN nginx -t

# Google Cloud Run uses port 8080
EXPOSE 8080

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
