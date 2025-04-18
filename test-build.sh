#!/bin/bash

# Navigate to project root
cd ~/Desktop/propease

# PreBuild Phase
echo "Starting PreBuild Phase..."

# Verify Node version
NODE_VERSION=$(node -v)
echo "Node version: $NODE_VERSION"
if [[ $NODE_VERSION != v20* && $NODE_VERSION != v22* ]]; then
  echo "Error: Node.js version 20.x.x or 22.x.x is required. Current version: $NODE_VERSION"
  exit 1
fi

# Debug: Show root directory contents
ls -l

# Check frontend directory
if [ -d "frontend" ]; then
  echo "frontend/ exists"
else
  echo "frontend/ missing"
  exit 1
fi

# Install dependencies in root
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
npm list vite || echo "Vite not listed in root dependencies"

# Install workspace dependencies with optional dependencies
npm install --workspaces --legacy-peer-deps --include=optional

# Install specific versions of esbuild, Rollup native modules, and client-only
npm install --save-dev esbuild@0.21.5 @esbuild/linux-x64@0.21.5 @rollup/rollup-linux-x64-gnu client-only @tanstack/react-virtual --legacy-peer-deps

# Change to frontend directory
cd frontend

# Create or update Vite configuration with external imports
if [ -f "vite.config.ts" ]; then
  cp vite.config.ts vite.config.ts.bak
fi
if [ -f "vite.config.js" ]; then
  cp vite.config.js vite.config.js.bak
fi

# Use the same syntax as in amplify.yml
echo > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['client-only', '@tanstack/react-virtual']
    }
  }
})
EOF

# Install dependencies in frontend
rm -rf node_modules package-lock.json
npm cache clean --force

# Install Vite globally to ensure it's available
npm install -g vite@5.4.18

npm install --no-optional --legacy-peer-deps

# Explicitly install Vite and the React plugin
npm install --save-dev vite@5.4.18 @vitejs/plugin-react@4.3.4

# Verify Vite is available using more reliable methods
echo "Checking for Vite availability..."
# Create a simple test file to verify Vite works
echo "console.log('Vite test');" > vite-test.js
if command -v vite >/dev/null 2>&1; then
  echo "Vite is available in PATH"
else
  echo "ERROR: Vite command not found in PATH"
  npm list vite -g
  npm list vite
  exit 1
fi

# Return to root
cd ..

# Build Phase
echo "Starting Build Phase..."
echo "Building frontend application..."

# Set environment variables
export NODE_ENV=production
export VITE_API_URL=https://propease-backend-2-env.eba-mgfe8nm9.us-east-2.elasticbeanstalk.com

# Ensure frontend directory
mkdir -p frontend

# Create .env.production.local
echo "VITE_API_URL=$VITE_API_URL" > frontend/.env.production.local

# Run build
cd frontend
rm -rf dist

# Use direct path to vite from global install
PATH="$PATH:$(npm bin -g)" npm run build || { echo "Build failed"; exit 1; }

# Verify output
if [ -d "dist" ]; then
  echo "Build successful: frontend/dist created"
else
  echo "Build failed: frontend/dist not found"
  exit 1
fi