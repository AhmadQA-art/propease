// vite.config.cjs - CommonJS format
/** @type {import('vite').UserConfig} */
module.exports = {
  // Try to load the plugin, but provide fallback if not available
  plugins: [
    (() => {
      try {
        return require('@vitejs/plugin-react')();
      } catch (e) {
        console.warn('Warning: @vitejs/plugin-react not available, building without React plugin');
        return null;
      }
    })()
  ].filter(Boolean), // Filter out null values
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
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
}; 