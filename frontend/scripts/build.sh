#!/bin/bash

# Exit on error
set -e

# Navigate to the frontend directory if not already there
cd "$(dirname "$0")/.."

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the app
echo "Building the app..."
npm run build

echo "Build completed successfully!"
echo "The build artifacts are in the 'dist' directory." 