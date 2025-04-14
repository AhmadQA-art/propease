const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');
// const path = require('path'); // You might not need this if using Vite's alias

// https://vitejs.dev/config/
module.exports = defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      clientPort: 5173,
      overlay: true,
      timeout: 30000,
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      '/api': {
        // Make sure this target is correct for your backend if needed during development
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
    host: true,
  },
  resolve: {
    alias: {
      // '@': path.resolve(__dirname, './src'), // Original way, might cause issues in some environments
      '@': '/src', // Vite's recommended way for alias - Should work better
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined, // Keep this unless you have specific chunking needs
      },
    },
  },
});