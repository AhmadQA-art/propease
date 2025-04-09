#!/bin/bash

# Exit on error
set -e

echo "Testing Amplify build process..."

# Execute preBuild commands
echo "Running preBuild commands..."
cd frontend
npm ci

# Execute build commands
echo "Running build commands..."
npm run build

echo "Build completed successfully!"
echo "The build artifacts are in frontend/dist directory." 