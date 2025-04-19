#!/bin/bash
# AWS Amplify Environment Diagnostic Script for Monorepo
# Add this to your repo and call it from amplify.yml for debugging

echo "======== ENVIRONMENT DIAGNOSTIC ========"
echo "Current directory: $(pwd)"
echo "Directory listing:"
ls -la

echo ""
echo "======== NODE ENVIRONMENT ========"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

echo ""
echo "======== MONOREPO STRUCTURE ========"
echo "Checking parent directory (monorepo root):"
if [ -f "../package.json" ]; then
  echo "✅ Parent directory has package.json (monorepo root found)"
  echo "Workspace configuration in root package.json:"
  grep -A 5 "workspaces" ../package.json || echo "No workspace configuration found"
else
  echo "❌ No package.json found in parent directory"
fi

echo ""
echo "======== VITE AVAILABILITY ========"
echo "Checking for local vite in node_modules:"
if [ -f "node_modules/.bin/vite" ]; then
  echo "✅ Vite found in node_modules/.bin"
  node_modules/.bin/vite --version
else
  echo "❌ Vite not found in node_modules/.bin"
fi

echo ""
echo "Checking for vite in parent node_modules (monorepo):"
if [ -f "../node_modules/.bin/vite" ]; then
  echo "✅ Vite found in parent node_modules/.bin"
  ../node_modules/.bin/vite --version
else
  echo "❌ Vite not found in parent node_modules/.bin"
fi

echo ""
echo "Checking for global vite with which:"
if which vite >/dev/null 2>&1; then
  echo "✅ Vite available globally: $(which vite)"
  vite --version
else
  echo "❌ Vite not available globally"
fi

echo ""
echo "Checking for vite with npx:"
if npx vite --version 2>/dev/null; then
  echo "✅ Vite available via npx"
else
  echo "❌ Vite not available via npx"
fi

echo ""
echo "======== PACKAGE.JSON ========"
echo "Build script from package.json:"
grep -A 3 '"build"' package.json || echo "No build script found"

echo ""
echo "Vite dependency in package.json:"
grep -A 1 '"vite"' package.json || echo "Vite dependency not found in package.json"

echo ""
echo "======== NODE_MODULES ========"
echo "node_modules/.bin contents:"
if [ -d "node_modules/.bin" ]; then
  ls -la node_modules/.bin | head -n 10
  echo "Total executables: $(ls -la node_modules/.bin | wc -l)"
else
  echo "❌ node_modules/.bin directory not found"
fi

echo ""
echo "Checking npm dependency hoisting:"
npm ls vite || echo "Vite not found in npm dependency tree"

echo "======== END DIAGNOSTIC ========" 