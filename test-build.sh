#!/bin/bash
set -e

# Navigate to root directory of the workspace
cd ~/Desktop/propease
echo "Current directory (workspace root): $(pwd)"

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

# Debug: Check where Vite is installed
echo "Checking if root node_modules/.bin exists..."
ls -la node_modules/.bin/ || echo "Root node_modules/.bin directory not found"

echo "Checking for Vite in node_modules/.bin..."
ls -la node_modules/.bin/vite 2>/dev/null || echo "Vite binary not found in node_modules/.bin"

echo "Checking if Vite is installed in node_modules..."
ls -la node_modules/vite/ 2>/dev/null || echo "Vite package not found in node_modules"

# Create a simplified PostCSS config in frontend directory
echo "Creating frontend/postcss.config.cjs..."
echo 'module.exports = { plugins: {} };' > frontend/postcss.config.cjs

# Set environment variables
export NODE_ENV=production
export VITE_API_URL=https://propease-backend-2-env.eba-mgfe8nm9.us-east-2.elasticbeanstalk.com
echo "VITE_API_URL=$VITE_API_URL" > frontend/.env.production.local

# Create Vite config in the frontend directory
echo "Creating frontend/vite.config.js with explicit root path..."
cat > frontend/vite.config.js << EOL
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
echo "Cleaning previous build artifacts in frontend directory..."
rm -rf frontend/dist frontend/build

# Build with Vite using workspace-aware command
echo "Building frontend with workspace-aware command..."

# Change to the frontend directory and use relative path to node_modules
cd frontend
if [ -f "../node_modules/.bin/vite" ]; then
  echo "Using Vite binary from workspace root..."
  ../node_modules/.bin/vite build --mode production
else
  echo "Vite binary not found, trying with npx..."
  npx vite build --mode production
fi

# Verify build output
if [ -d "build" ]; then 
  echo "Build successful! Output in: $(pwd)/build"
else
  echo "Build failed - build directory not found"
  exit 1
fi