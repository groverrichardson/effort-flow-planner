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
    
    // Try to find an available port, starting with one far from default
    // to avoid conflicts with potentially stuck processes
    const START_OFFSET = Math.floor(Math.random() * 2000);
    const newStartPort = START_PORT + START_OFFSET;
    
    // Find an available port
    const port = await findAvailablePort(newStartPort, MAX_ATTEMPTS);
    console.log(`Found available port: ${port}`);
    
    // Get the command to run from command line arguments
    const args = process.argv.slice(2);
    
    // Set environment variables for the Playwright config to use
    process.env.PLAYWRIGHT_HTML_PORT = port.toString();
    process.env.HTML_REPORT_HOST = 'localhost';
    process.env.HTML_REPORT_OPEN = 'never'; // Prevent automatic browser opening which can cause conflicts
    
    // Make sure the HTML reporter port is locked properly and released after tests
    process.env.PW_PORT_LOCKED = '1';
    process.env.PW_PORT_RELEASE_ON_EXIT = '1';
    
    // Only set watch mode if explicitly requested with --watch flag
    const watchMode = args.includes('--watch');
    if (watchMode) {
      process.env.PWTEST_WATCH = '1';
      // Remove the --watch flag from args since Playwright doesn't use it
      const watchIndex = args.indexOf('--watch');
      if (watchIndex > -1) {
        args.splice(watchIndex, 1);
      }
    }
    
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
