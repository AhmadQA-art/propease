const { build } = require('vite');
const react = require('@vitejs/plugin-react');
const path = require('path');

async function buildApp() {
  try {
    await build({
      plugins: [react.default()],
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
