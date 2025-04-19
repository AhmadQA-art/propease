#!/bin/bash
set -e

# Test script to simulate the Amplify build process as defined in amplify.yml
echo "==== PropEase Amplify Build Test Script ===="

# Navigate to root directory of the workspace
cd ~/Desktop/propease
echo "Current directory (workspace root): $(pwd)"

# Create a temporary directory to simulate the Amplify build environment
TMP_BUILD_DIR=$(mktemp -d)
echo "Creating temporary build directory at: $TMP_BUILD_DIR"

# Copy project files to the temp directory
echo "Copying project files to temporary directory..."
cp -r . $TMP_BUILD_DIR

# Change to the temporary directory
cd $TMP_BUILD_DIR
echo "Current directory (temporary build root): $(pwd)"

# Phase: preBuild - as defined in amplify.yml
echo "==== PHASE: preBuild ===="

# Verify Node version
NODE_VERSION=$(node -v)
echo "Node version: $NODE_VERSION"
if [[ $NODE_VERSION != v20* && $NODE_VERSION != v22* ]]; then
  echo "Error: Node.js version 20.x.x or 22.x.x is required. Current version: $NODE_VERSION"
  exit 1
fi

# Clean node_modules at workspace root
echo "Cleaning workspace node_modules directory..."
rm -rf node_modules

# Install all dependencies for all workspaces
echo "Installing all workspace dependencies via npm ci..."
npm ci

# Create frontend directory if it doesn't exist
echo "Creating frontend directory if needed..."
mkdir -p frontend

# Create a simplified PostCSS config in frontend directory
echo "Creating frontend/postcss.config.cjs..."
echo 'module.exports = { plugins: {} };' > frontend/postcss.config.cjs

# Simulate moving to the appRoot directory as Amplify would
cd frontend
echo "Changed to frontend directory (appRoot): $(pwd)"

# Phase: build - as defined in amplify.yml
echo "==== PHASE: build ===="

# Set environment variables
export NODE_ENV=production
export VITE_API_URL=https://propease-backend-2-env.eba-mgfe8nm9.us-east-2.elasticbeanstalk.com

# Create .env.production.local in frontend directory
echo "Creating .env.production.local..."
echo "VITE_API_URL=$VITE_API_URL" > .env.production.local

# Create Vite config in the current directory
echo "Creating vite.config.js with explicit root path..."
cat > vite.config.js << 'EOL'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: __dirname, // Set the root to frontend directory
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'build',
  },
});
EOL

# Clean any previous build artifacts
echo "Cleaning previous build artifacts..."
rm -rf dist build || true

# Build with npm or Vite
echo "Building frontend..."
echo "Current directory before build: $(pwd)"

# Try npm build first, then fallback to direct vite calls
echo "Trying to build with npm run build..."
npm run build || ../node_modules/.bin/vite build --mode production || npx vite build --mode production

# Verify build output
if [ -d "build" ]; then 
  echo "Build successful! Output in: $(pwd)/build"
  ls -la build
else
  echo "Build failed - build directory not found"
  ls -la
  exit 1
fi

echo "==== Build Test Complete ===="
echo "The test successfully simulated the Amplify build process."
echo "The build artifacts are in: $(pwd)/build"

# Navigate back to project root
cd ../..

# Cleanup the temporary directory
echo "Cleaning up temporary directory..."
rm -rf $TMP_BUILD_DIR

echo "Test completed successfully!"