// vite.config.cjs - CommonJS format
module.exports = {
  plugins: [require('@vitejs/plugin-react')()],
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
}; 