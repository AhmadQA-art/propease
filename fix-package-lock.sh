#!/bin/bash

# Navigate to project root
cd ~/Desktop/propease

# Backup current package-lock.json
if [ -f "package-lock.json" ]; then
  cp package-lock.json package-lock.json.bak
  echo "Backed up package-lock.json"
fi

# Remove package-lock.json and node_modules
rm -rf package-lock.json node_modules
echo "Removed package-lock.json and node_modules"

# Also check frontend directory
cd frontend
if [ -f "package-lock.json" ]; then
  cp package-lock.json package-lock.json.bak
  echo "Backed up frontend/package-lock.json"
fi
rm -rf package-lock.json node_modules
cd ..

# Clean npm cache
npm cache clean --force
echo "Cleaned npm cache"

# Reinstall dependencies to generate fresh package-lock.json
echo "Reinstalling dependencies to generate fresh package-lock.json..."
npm install --legacy-peer-deps

# Make sure workspace packages are updated too
echo "Updating workspace packages..."
npm install --workspaces --legacy-peer-deps

echo "Package lock files have been regenerated"
echo "Review 'git diff package-lock.json' to see the changes" 