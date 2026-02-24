import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
  build: {
    emptyOutDir: false,
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api/send-recovery-email': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/email-status': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
