import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    // Force Vite to use local node_modules, not workspace parent
    entries: ['./src/main.tsx'],
  },
  server: {
    port: 5173,
    fs: {
      // Restrict to project directory only - prevents workspace scanning
      strict: true,
      allow: [
        // Only allow access to local project
        path.resolve(__dirname),
      ],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
