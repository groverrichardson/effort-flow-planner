#!/usr/bin/env node
/**
 * Helper script to find an available port before running Playwright tests
 * This resolves port conflicts with the HTML reporter
 */

import { spawn } from 'child_process';

// Default port range
const START_PORT = 9323;
const MAX_ATTEMPTS = 20;

// Self-executing async function
(async function() {
  try {
    // Dynamically import ESM module
    const portUtils = await import('./portUtils.js');
    const { findAvailablePort } = portUtils;
    
    // Find an available port
    const port = await findAvailablePort(START_PORT, MAX_ATTEMPTS);
    console.log(`Found available port: ${port}`);
    
    // Set environment variable for the Playwright config to use
    process.env.PLAYWRIGHT_HTML_PORT = port.toString();
    // Always set watch mode for better debugging experience
    process.env.PWTEST_WATCH = '1';
    
    // Get the command to run from command line arguments
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('No command provided. Usage: node setupPort.js [command]');
      process.exit(1);
    }
    
    const cmd = args[0];
    const cmdArgs = args.slice(1);
    
    console.log(`Running: ${cmd} ${cmdArgs.join(' ')}`);
    
    // Run the command with the environment variable set
    const childProcess = spawn(cmd, cmdArgs, {
      env: process.env,
      stdio: 'inherit',
      shell: true
    });
    
    childProcess.on('exit', (code) => {
      process.exit(code);
    });
    
  } catch (error) {
    console.error('Error setting up port:', error);
    process.exit(1);
  }
})();
