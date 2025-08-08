import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
      ignoredRouteFiles: ['**/*.test.*', '**/test-*'],
    }),
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      external: (id: string) => {
        // Exclude test files and vitest from the build
        return id.includes('.test.') || id.includes('vitest') || id.includes('test-setup') || id.includes('test-utils');
      },
    },
  },
  optimizeDeps: {
    exclude: ['vitest', '@vitest/utils'],
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
});
