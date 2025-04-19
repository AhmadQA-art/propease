#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the current directory
const __dirname = dirname(fileURLToPath(import.meta.url));
const viteBinPath = resolve(__dirname, 'node_modules', '.bin', 'vite');

console.log('Current directory:', process.cwd());
console.log('Vite bin path:', viteBinPath);

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.VITE_API_URL = 'https://propease-backend-2-env.eba-mgfe8nm9.us-east-2.elasticbeanstalk.com';

// Run vite build
console.log('Running vite build...');
const buildProcess = spawn(viteBinPath, ['build'], { 
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completed successfully!');
  } else {
    console.error(`❌ Build failed with code ${code}`);
    process.exit(code);
  }
});
