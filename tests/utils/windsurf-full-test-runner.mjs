#!/usr/bin/env node

// Script to run Playwright tests in Windsurf with proper setup
// This version allows the web server to start for full UI tests

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');

console.log('Starting Playwright tests in Windsurf environment...');
console.log('Project root:', projectRoot);

// Allow the web server to start for full UI tests
// This ensures the necessary backend services are available
console.log('Starting Vite dev server and running tests...');

// Run the tests with proper configuration for Windsurf
const command = 'npx';
const args = [
  'playwright',
  'test',
  '--project=chromium'
];

console.log(`Running command: ${command} ${args.join(' ')}`);

const playwright = spawn(command, args, {
  cwd: projectRoot,
  env: { 
    ...process.env,
    // Important environment variables that may be needed in Windsurf
    NODE_ENV: 'test',
    DEBUG: 'pw:api',  // Enable Playwright API debugging
  },
  stdio: 'inherit' // Show output directly
});

playwright.on('close', (code) => {
  console.log(`Playwright tests exited with code ${code}`);
  if (code === 0) {
    console.log('✅ Tests passed! Playwright is working correctly in Windsurf.');
  } else {
    console.log('❌ Some tests failed. See error messages above.');
    console.log('Note: If you see connection refused errors, make sure the web server is running and accessible.');
  }
});
