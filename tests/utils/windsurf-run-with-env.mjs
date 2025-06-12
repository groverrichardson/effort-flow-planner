#!/usr/bin/env node

// Script to run Playwright tests in Windsurf with proper environment variables
// This will help with chrono-node resolution by forcing Vite dependency optimization

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');

console.log('Starting Playwright tests in Windsurf environment with optimized deps...');
console.log('Project root:', projectRoot);

// Set Windsurf environment flag to true
// This will trigger the force: true for optimizeDeps in vite.config.ts
const env = {
  ...process.env,
  WINDSURF_ENV: 'true',
  DEBUG: 'pw:api',
};

// First, force rebuild the dependencies with Vite
console.log('Clearing .vite cache and forcing dependency optimization...');
const clearCache = spawn('npx', ['rimraf', '.vite'], {
  cwd: projectRoot,
  stdio: 'inherit'
});

clearCache.on('close', (code) => {
  if (code !== 0) {
    console.log(`Failed to clear cache, but continuing anyway...`);
  }

  // Now run the actual test
  console.log('Running Playwright test with optimized dependencies...');
  const playwright = spawn('npx', ['playwright', 'test', '--project=chromium', '--headed=false'], {
    cwd: projectRoot,
    env,
    stdio: 'inherit'
  });

  playwright.on('close', (code) => {
    console.log(`Playwright tests exited with code ${code}`);
    if (code === 0) {
      console.log('✅ Tests passed! Playwright is working correctly in Windsurf.');
    } else {
      console.log('❌ Some tests failed. Check error messages above.');
      
      // Provide troubleshooting info
      console.log('\n==== TROUBLESHOOTING ====');
      console.log('1. If you see chrono-node resolution errors:');
      console.log('   - Try downgrading Playwright: npm i -D @playwright/test@1.34.0');
      console.log('2. If VS Code extension doesn\'t detect tests:');
      console.log('   - The extension is known to have issues with Playwright 1.34.1+');
      console.log('   - Consider downgrading to 1.34.0 if extension functionality is needed');
    }
  });
});
