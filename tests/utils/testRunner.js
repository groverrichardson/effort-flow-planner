#!/usr/bin/env node
/**
 * Helper script to run Playwright tests with simplified commands
 * 
 * Usage examples:
 *   node testRunner.js                  # Run all UI tests
 *   node testRunner.js "login page"     # Run tests with "login page" in the title
 *   node testRunner.js --update         # Run tests and update snapshots
 *   node testRunner.js --debug          # Run tests with additional debug output
 */

import { spawn } from 'child_process';
import { argv } from 'process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = argv.slice(2);
const updateSnapshots = args.includes('--update');
const debugMode = args.includes('--debug');

// Extract test pattern (anything that's not a flag)
const testPattern = args.filter(arg => !arg.startsWith('--')).join(' ');

// Build the command to run with setupPort script
const cmd = 'node';
const setupPortPath = path.join(__dirname, 'setupPort.js');
// Set up command to only run .spec.ts files (Playwright tests)
const cmdArgs = [setupPortPath, 'npx', 'playwright', 'test'];

// Explicitly target only .spec.ts files
cmdArgs.push('**/*.spec.ts');
cmdArgs.push('--project=chromium');

// Only use headed mode if explicitly requested via environment variable
if (process.env.HEADED === '1') {
  cmdArgs.push('--headed');
}

// Add test pattern if provided
if (testPattern) {
  cmdArgs.push('-g', testPattern);
}

// Add update snapshots flag if needed
if (updateSnapshots) {
  cmdArgs.push('--update-snapshots');
}

// Add debug flag if needed
const env = { ...process.env, PWTEST_WATCH: '1' };
if (debugMode) {
  env.DEBUG = 'pw:api';
}

console.log(`Running: ${cmd} ${cmdArgs.join(' ')}`);

// Run the command
const testProcess = spawn(cmd, cmdArgs, { 
  env,
  stdio: 'inherit'
  // Removed shell: true for security - prevents command injection
});

// Handle process completion
testProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`Tests exited with code ${code}`);
    process.exit(code);
  } else {
    console.log('Tests completed successfully!');
    
    // The HTML report will automatically open with our custom port configuration
    console.log('HTML report should open automatically (configured to open on-failure).');
    console.log('If it doesn\'t open, check the console output for the report URL.');
  }
});
