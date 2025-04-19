#!/bin/bash
set -e

# Test script to simulate the AWS Amplify build process with appRoot: frontend
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

# Important: Move into frontend directory to simulate appRoot: frontend
cd frontend
echo "Changed to frontend directory to simulate appRoot setting: $(pwd)"

# Phase: preBuild - as defined in amplify.yml
echo "==== PHASE: preBuild ===="
echo "Running in: $(pwd)"

# Install Node.js
NODE_VERSION=$(node -v)
echo "Node version: $NODE_VERSION"
if [[ $NODE_VERSION != v20* && $NODE_VERSION != v22* ]]; then
  echo "Error: Node.js version 20.x.x or 22.x.x is required. Current version: $NODE_VERSION"
  exit 1
fi

# Install dependencies from parent directory
echo "Installing dependencies from parent directory..."
cd ..
rm -rf node_modules
npm ci
echo "Dependencies installed at root level"
cd frontend

# Create PostCSS config
echo "Creating postcss.config.cjs..."
echo 'module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };' > postcss.config.cjs

# Phase: build - as defined in amplify.yml
echo "==== PHASE: build ===="
echo "Running in: $(pwd)"

# Set environment variables
export NODE_ENV=production
export VITE_API_URL=https://propease-backend-2-env.eba-mgfe8nm9.us-east-2.elasticbeanstalk.com
echo "VITE_API_URL=$VITE_API_URL" > .env.production.local

# Clean previous build output
echo "Cleaning previous build artifacts..."
rm -rf dist build .vite

# Build with explicitly referenced Vite binary from root
echo "Building with Vite..."
if [ -f "../node_modules/.bin/vite" ]; then
  echo "Using Vite from ../node_modules/.bin..."
  ../node_modules/.bin/vite build --mode production
else
  echo "Vite not found in expected location, trying npm..."
  npm run build
fi

# Verify build output
if [ -d "build" ]; then
  echo "✅ Build successful! Output directory: build/"
  ls -la build
else
  echo "❌ ERROR: Build directory not found"
  echo "Current directory: $(pwd)"
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