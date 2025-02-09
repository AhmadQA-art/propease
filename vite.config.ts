import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      crypto: 'crypto-browserify'
    }
  },
  define: {
    global: {},
    'process.env': {}
  }
});
