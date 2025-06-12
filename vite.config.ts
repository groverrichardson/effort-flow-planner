
import react from '@vitejs/plugin-react-swc';
import path from 'path';
// import { componentTagger } from 'lovable-tagger'; // Assuming this was a valid import from your original setup

// https://vitejs.dev/config/
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
  },
  plugins: [
    react(),
    // mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['chrono-node'],
    esbuildOptions: {
      // This helps with CommonJS/ESM compatibility issues
      mainFields: ['module', 'main'],
      resolveExtensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts', './src/vitest.setup.ts'], // Merged setup files
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.spec.tsx'], // Merged include patterns
    testTimeout: 10000,
    css: true, // Added from vitest.config.ts
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      }
    },
    server: { // Added from vitest.config.ts
      deps: {
        inline: ['@/store/noteStore'],
      },
    },
    // you might want to disable it, if you don't want to run UI tests
    // environmentMatchGlobs: [
    //   ['**/*.test.tsx', 'jsdom'],
    // ],
  },
}));
