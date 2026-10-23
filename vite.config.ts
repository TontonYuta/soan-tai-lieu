import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { vitePluginAutomation } from './server/vitePluginAutomation';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), vitePluginAutomation()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        sourcemap: true,
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
                return 'vendor-react';
              }
              if (id.includes('node_modules/lucide-react/')) {
                return 'vendor-icons';
              }
              if (id.includes('/services/prompts/manim/')) {
                return 'prompts-manim';
              }
              if (id.includes('/services/prompts/')) {
                return 'prompts-latex';
              }
            },
          },
        },
      }
    };
});

