import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // Main process
        entry: 'electron/main.ts',
        onstart({ startup }) {
          startup();
        },
        vite: {
          build: {
            outDir: 'dist-electron',
          },
        },
      },
      {
        // Preload script
        entry: 'electron/preload.ts',
        onstart({ reload }) {
          reload();
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            emptyOutDir: false, // Don't clear main.js when rebuilding preload
          },
        },
      },
    ]),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@electron': resolve(__dirname, './electron'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist-renderer',
    emptyOutDir: true,
  },
});
