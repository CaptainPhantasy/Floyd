import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json' with { type: 'json' };

export default defineConfig({
  plugins: [crx({ manifest })],
  build: {
    rollupOptions: {
      input: {
        background: './src/background.ts',
        content: './src/content.ts',
        'sidepanel/index': './src/sidepanel/index.ts'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Handle the sidepanel/index naming
          if (chunkInfo.name === 'sidepanel/index') {
            return 'sidepanel/index.js';
          }
          return '[name].js';
        },
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  }
});
