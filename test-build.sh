#!/bin/bash

# Test build script for PropEase frontend (monorepo architecture)
# This script simulates the build process that will run in AWS Amplify

# Set strict mode
set -e

# Navigate to project root first
cd ~/Desktop/propease
echo "Running in: $(pwd)"

# Check Node.js version
NODE_VERSION=$(node -v)
echo "Node version: $NODE_VERSION"

if [[ $NODE_VERSION =~ ^v20\. ]] || [[ $NODE_VERSION =~ ^v22\. ]]; then
  echo "✅ Node.js version compatible: $NODE_VERSION"
else
  echo "❌ Node.js version incompatible: $NODE_VERSION (required: 20.x.x or 22.x.x)"
  echo "Please run: nvm use 20"
  exit 1
fi

# Navigate to frontend directory
cd frontend
echo "Changed to frontend directory: $(pwd)"

# Run diagnostic script
if [ -f "./check-env.sh" ]; then
  echo "Running diagnostic script"
  chmod +x check-env.sh
  ./check-env.sh
else
  echo "⚠️ Diagnostic script not found"
fi

# Clean existing node_modules
echo "Cleaning node_modules"
rm -rf node_modules

# Install dependencies (standalone mode - not using workspaces)
echo "Installing dependencies (standalone mode)"
npm ci --no-workspaces || npm install --no-workspaces

# Check if Vite is available
if [ -f "node_modules/.bin/vite" ]; then
  echo "✅ Vite found in node_modules/.bin"
else
  echo "⚠️ Vite not found in local node_modules, installing globally as fallback"
  npm install -g vite
fi

# Create PostCSS config if needed
if [ ! -f "postcss.config.cjs" ]; then
  echo "Creating PostCSS config"
  echo "module.exports = {plugins: {autoprefixer: {}}};" > postcss.config.cjs
fi

# Set environment variables
echo "Setting environment variables"
export NODE_ENV=production
export VITE_API_URL=https://api.propease.com

# Clean previous build
echo "Cleaning previous build artifacts"
rm -rf build

# Attempt to build with multiple methods
echo "Building frontend with multiple methods"

BUILD_SUCCESS=false

# Method 1: npx vite build
if npx vite build --mode production; then
  echo "✅ Build succeeded using npx vite build"
  BUILD_SUCCESS=true
elif vite build --mode production; then
  echo "✅ Build succeeded using global vite"
  BUILD_SUCCESS=true
elif npm run build; then
  echo "✅ Build succeeded using npm run build"
  BUILD_SUCCESS=true
else
  echo "❌ All build methods failed"
  BUILD_SUCCESS=false
fi

# Verify build output exists
if [ -d "build" ] && [ -f "build/index.html" ]; then
  echo "✅ Build output verified successfully"
  ls -la build
  echo "Total files in build directory: $(find build -type f | wc -l)"
  echo "Build completed successfully!"
  exit 0
else
  echo "❌ Build verification failed - build directory or index.html missing"
  echo "Creating minimal build for testing"
  mkdir -p build
  echo "<html><body>Error during build</body></html>" > build/index.html
  exit 1
fi