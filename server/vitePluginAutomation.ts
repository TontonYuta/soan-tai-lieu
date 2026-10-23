import type { Plugin, ViteDevServer } from 'vite';
import { createCoreApiHandler } from './serverCore';

export function vitePluginAutomation(): Plugin {
  return {
    name: 'vite-plugin-automation',
    configureServer(server: ViteDevServer) {
      const handler = createCoreApiHandler();
      server.middlewares.use((req, res, next) => {
        handler(req, res, next);
      });
    },
  };
}
