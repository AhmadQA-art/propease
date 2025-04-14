// Custom build script for AWS Amplify
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting custom Amplify build script');

// Display environment information
console.log(`Node version: ${process.version}`);
console.log(`Working directory: ${process.cwd()}`);

// Helper function to run commands safely
function runCommand(command) {
  try {
    console.log(`Running: ${command}`);
    const output = execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Try multiple build approaches in order
async function buildProject() {
  // Approach 1: Use locally installed vite via npx
  if (runCommand('npx vite build')) {
    console.log('Build succeeded using npx vite build');
    return true;
  }
  
  console.log('Trying alternative approaches...');
  
  // Approach 2: Install vite globally and use it
  if (runCommand('npm install -g vite@5.1.4') && 
      runCommand('vite build')) {
    console.log('Build succeeded using global vite');
    return true;
  }
  
  // Approach 3: Download vite directly via CDN and use native ESBuild
  console.log('Attempting direct build with esbuild');
  
  // Install esbuild directly
  if (!runCommand('npm install --no-save esbuild')) {
    console.error('Failed to install esbuild');
    return false;
  }
  
  // Create a minimal build script
  // This would need to be expanded for a real implementation
  
  console.error('All build approaches failed');
  return false;
}

// Run the build
buildProject()
  .then(success => {
    if (success) {
      console.log('Build completed successfully');
      process.exit(0);
    } else {
      console.error('Build failed after trying all approaches');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unhandled error in build script:', error);
    process.exit(1);
  }); 