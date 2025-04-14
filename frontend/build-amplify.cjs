// build-amplify.js - Script to set up placeholder for Amplify deployment
const fs = require('fs');
const path = require('path');

// Paths
const distDir = path.join(__dirname, 'dist');
const placeholderPath = path.join(__dirname, 'placeholder.html');
const indexPath = path.join(distDir, 'index.html');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  console.log('Creating dist directory...');
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy placeholder.html to dist/index.html
try {
  const placeholderContent = fs.readFileSync(placeholderPath, 'utf8');
  fs.writeFileSync(indexPath, placeholderContent);
  console.log('Successfully copied placeholder to dist/index.html');
  
  // Create a build-info.txt file
  fs.writeFileSync(
    path.join(distDir, 'build-info.txt'), 
    `Placeholder deployed: ${new Date().toISOString()}\n`
  );
  
  // Create an empty main.tsx file to prevent 404 errors
  fs.mkdirSync(path.join(distDir, 'src'), { recursive: true });
  fs.writeFileSync(
    path.join(distDir, 'src', 'main.tsx'), 
    '// Placeholder file to prevent 404 errors'
  );
  
  console.log('Build completed successfully');
} catch (error) {
  console.error('Error during build:', error);
  process.exit(1);
} 