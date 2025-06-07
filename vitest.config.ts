import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Default to watch mode
    watch: true,
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts', './src/vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.spec.tsx'],
    testTimeout: 10000,
    css: true,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      }
    },
    server: {
      deps: {
        inline: ['@/store/noteStore'],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
