
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vitest/config';
// import { componentTagger } from 'lovable-tagger'; // Assuming this was a valid import from your original setup

// https://vitejs.dev/config/
/// <reference types="vitest" />

// Check if we're running in Windsurf environment
const isWindsurfEnv = process.env.WINDSURF_ENV === 'true' || process.env.CI === 'true';

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
      // Use our local shim instead of the problematic chrono-node package
      'chrono-node': path.resolve(__dirname, 'src/lib/chrono-shim.js'),
      // Provide Node.js module polyfills for Supabase in browser
      stream: 'stream-browserify',
      http: 'stream-http',
      https: 'https-browserify',
      url: 'url',
      util: 'util',
      zlib: 'browserify-zlib'
    },
    // More aggressive module resolution for Windsurf compatibility
    mainFields: ['browser', 'module', 'jsnext:main', 'jsnext', 'main'],
  },
  define: {
    // For Node.js process, buffer, etc.
    'process.env': {},
    'global': 'window',
  },
  optimizeDeps: {
    // Force-include problematic dependencies
    include: [
      'chrono-node',
      '@supabase/supabase-js',
      '@supabase/gotrue-js',
      '@supabase/storage-js',
      '@supabase/postgrest-js'
    ],
    // Exclude any specific modules that cause problems
    exclude: [],
    // Force re-optimization on every serve in Windsurf
    force: isWindsurfEnv,
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        {
          name: 'chrono-node-shim-resolver',
          setup(build) {
            // Always redirect chrono-node to our shim
            build.onResolve({ filter: /^chrono-node$/ }, () => {
              return { path: path.resolve(__dirname, 'src/lib/chrono-shim.js') };
            });
            
            // Handle any nested chrono-node imports the same way
            build.onResolve({ filter: /^chrono-node\// }, () => {
              // Just point them all to our shim
              return { path: path.resolve(__dirname, 'src/lib/chrono-shim.js') };
            });
          },
        },
      ],
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
