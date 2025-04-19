#!/bin/bash

# Exit on any error
set -e

# Define project root and build directory
PROJECT_ROOT="$(pwd)/frontend"
BUILD_DIR="$PROJECT_ROOT/build"

echo "🚀 Starting local build test in $PROJECT_ROOT"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js (version 20.x.x recommended)."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v)
echo "ℹ️ Using Node.js $NODE_VERSION"

# Navigate to frontend directory
cd "$PROJECT_ROOT" || { echo "❌ Frontend directory not found"; exit 1; }

# Clean existing node_modules and build directory
echo "🧹 Cleaning existing node_modules and build directory"
rm -rf node_modules "$BUILD_DIR"

# Install dependencies
echo "📦 Installing dependencies (standalone mode)"
npm install --no-workspaces --verbose

# Set environment variables
echo "⚙️ Setting environment variables"
export NODE_ENV=production
export VITE_API_URL=https://api.propease.com

# Run the build
echo "🏗️ Building frontend with Vite"
npx vite build --mode production

# Verify build output
echo "✅ Verifying build output"
if [ -d "$BUILD_DIR" ] && [ -f "$BUILD_DIR/index.html" ]; then
    echo "🎉 Build verified successfully!"
else
    echo "❌ Build verification failed: Missing build directory or index.html"
    exit 1
fi

echo "🚀 Local build test completed successfully!"