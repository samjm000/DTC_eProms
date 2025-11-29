const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react').default;

module.exports = defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/client/eproms/' : '/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://backend:3001',
        changeOrigin: true
      }
    }
  }
});
