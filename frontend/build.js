import { build } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildApp() {
  try {
    await build({
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
      build: {
        rollupOptions: {
          external: ['client-only', '@tanstack/react-virtual']
        }
      },
      mode: 'production'
    });
    console.log('Build completed successfully');
  } catch (e) {
    console.error('Build failed:', e);
    process.exit(1);
  }
}

buildApp();
