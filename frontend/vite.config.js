import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = mode === 'production' ? 'production' : 'development';
  
  return {
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
          target: 'http://localhost:5001',
          changeOrigin: true,
          secure: false,
        },
      },
      host: true,
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(env)
    }
  };
}); 