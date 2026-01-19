import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import { resolve } from 'path';
import { spawn } from 'child_process';

// Build preload as CommonJS using esbuild (vite-plugin-electron outputs ESM which breaks preload)
function buildPreloadPlugin() {
  return {
    name: 'build-preload-cjs',
    buildStart() {
      spawn('npx', ['esbuild', 'electron/preload.ts', '--bundle', '--platform=node', '--target=node18', '--format=cjs', '--outfile=dist-electron/preload.js', '--external:electron'], {
        cwd: process.cwd(),
        stdio: 'inherit',
        shell: true,
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    buildPreloadPlugin(),
    electron([
      {
        // Main process only - preload is built separately as CJS
        entry: 'electron/main.ts',
        onstart({ startup }) {
          startup();
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron', 'floyd-agent-core', 'floyd-agent-core/mcp', 'floyd-agent-core/store', 'floyd-agent-core/permissions', 'floyd-agent-core/utils'],
            },
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
