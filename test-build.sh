#!/bin/bash
set -e

# Navigate to project root
cd ~/Desktop/propease
echo "Current directory: $(pwd)"

# Verify Node version
NODE_VERSION=$(node -v)
echo "Node version: $NODE_VERSION"
if [[ $NODE_VERSION != v20* && $NODE_VERSION != v22* ]]; then
  echo "Error: Node.js version 20.x.x or 22.x.x is required. Current version: $NODE_VERSION"
  exit 1
fi

# Check frontend directory
if [ -d "frontend" ]; then
  echo "frontend exists"
else
  echo "frontend missing"
  exit 1
fi

# Navigate to frontend directory
echo "Changing to frontend directory..."
cd frontend
echo "Current directory: $(pwd)"

# Create backup of existing configuration files
if [ -f "vite.config.ts" ]; then
  cp vite.config.ts vite.config.ts.bak
  rm vite.config.ts
fi
if [ -f "vite.config.js" ]; then
  cp vite.config.js vite.config.js.bak
  rm vite.config.js
fi
if [ -f "postcss.config.cjs" ]; then
  cp postcss.config.cjs postcss.config.cjs.bak
fi

# Clean previous installations
echo "Cleaning previous installations..."
rm -rf node_modules package-lock.json
npm cache clean --force

# Install dependencies in frontend directory
echo "Installing frontend dependencies..."
npm install --legacy-peer-deps

# Explicitly install Vite with exact version
echo "Installing Vite and plugins explicitly..."
npm install --save-dev vite@5.4.18 @vitejs/plugin-react@4.3.4 autoprefixer postcss tailwindcss

# Verify Vite installation - exactly like in amplify.yml
if ./node_modules/.bin/vite --version >/dev/null 2>&1; then 
  echo "Vite installed successfully"
else 
  echo "Vite installation failed"
  exit 1
fi

# Create a simplified PostCSS config - exactly like in amplify.yml
echo "module.exports = {plugins: {}};" > postcss.config.cjs

# Set environment variables
export NODE_ENV=production
export VITE_API_URL=https://propease-backend-2-env.eba-mgfe8nm9.us-east-2.elasticbeanstalk.com

# Create .env.production.local - exactly like in amplify.yml
echo "VITE_API_URL=$VITE_API_URL" > .env.production.local

# Create Vite config using the same format as in amplify.yml
echo "Creating vite.config.js..."
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'build',
  },
});
EOF

# Clean any previous build artifacts
echo "Cleaning previous build artifacts..."
rm -rf dist build

# Build with local Vite binary - exactly like in amplify.yml
echo "Building with local Vite binary..."
./node_modules/.bin/vite build --mode production

# Verify build output - exactly like in amplify.yml
if [ -d "build" ]; then 
  echo "Build successful"
else
  echo "Build failed - build directory not found"
  exit 1
fi