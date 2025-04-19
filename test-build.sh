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

# Clean previous installations
echo "Cleaning previous installations..."
rm -rf node_modules package-lock.json
npm cache clean --force

# Install dependencies in frontend directory
echo "Installing frontend dependencies..."
npm install --legacy-peer-deps

# Explicitly install Vite with exact version
echo "Installing Vite and plugins explicitly..."
npm install --save-dev vite@5.4.18 @vitejs/plugin-react@4.3.4

# Create a simplified PostCSS config
echo 'module.exports = {plugins: {}};' > postcss.config.cjs

# Set environment variables
export NODE_ENV=production
export VITE_API_URL=https://propease-backend-2-env.eba-mgfe8nm9.us-east-2.elasticbeanstalk.com

# Create .env.production.local
echo 'VITE_API_URL=$VITE_API_URL' > .env.production.local

# Create Vite config file line by line
echo "Creating vite.config.js..."
echo 'import { defineConfig } from "vite";' > vite.config.js
echo 'import react from "@vitejs/plugin-react";' >> vite.config.js
echo 'import path from "path";' >> vite.config.js
echo 'import { fileURLToPath } from "url";' >> vite.config.js
echo '' >> vite.config.js
echo 'const __dirname = path.dirname(fileURLToPath(import.meta.url));' >> vite.config.js
echo '' >> vite.config.js
echo 'export default defineConfig({' >> vite.config.js
echo '  plugins: [react()],' >> vite.config.js
echo '  resolve: {' >> vite.config.js
echo '    alias: {' >> vite.config.js
echo '      "@": path.resolve(__dirname, "./src"),' >> vite.config.js
echo '    },' >> vite.config.js
echo '  },' >> vite.config.js
echo '  build: {' >> vite.config.js
echo '    outDir: "build",' >> vite.config.js
echo '  },' >> vite.config.js
echo '});' >> vite.config.js

# Clean any previous build artifacts
echo "Cleaning previous build artifacts..."
rm -rf dist build

# Build with npx vite
echo "Building with npx vite..."
npx vite build --mode production

# Verify build output
if [ -d "build" ]; then 
  echo "Build successful in $(pwd)"
else
  echo "Build failed - build directory not found"
  exit 1
fi