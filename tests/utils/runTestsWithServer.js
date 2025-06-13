#!/usr/bin/env node
/**
 * This script:
 * 1. Finds an available port dynamically
 * 2. Starts the dev server on that port
 * 3. Waits for the server to be ready
 * 4. Runs Playwright tests with the correct BASE_URL
 */

import { spawn, execSync } from 'child_process';
import { findAvailablePort } from './portUtils.js';
import http from 'http';
import { setTimeout } from 'timers/promises';

// Self-executing async function
(async function() {
  try {
    // Find an available port for the dev server
    console.log('Finding available port for dev server...');
    const serverPort = await findAvailablePort(3000, 20);
    console.log(`Using port ${serverPort} for dev server`);
    
    // Find an available port for HTML reporter
    console.log('Finding available port for HTML reporter...');
    const reporterPort = await findAvailablePort(9323, 20);
    console.log(`Using port ${reporterPort} for HTML reporter`);
    
    // Set environment variables for the server and tests
    process.env.PORT = serverPort.toString();
    process.env.VITE_PORT = serverPort.toString();
    const baseUrl = `http://localhost:${serverPort}`;
    process.env.BASE_URL = baseUrl;
    process.env.PLAYWRIGHT_HTML_PORT = reporterPort.toString();
    
    // Start the dev server with the dynamic port
    console.log(`Starting dev server on port ${serverPort}...`);
    const serverProcess = spawn('npm', ['run', 'dev'], {
      env: {
        ...process.env,
        PORT: serverPort.toString(),
        VITE_PORT: serverPort.toString(),
        BASE_URL: baseUrl
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    // Track server readiness
    let serverReady = false;
    
    // Capture server output
    if (serverProcess.stdout) {
      serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[Server] ${output.trim()}`);
        
        // Check if server is ready based on Vite output
        if (output.includes('Local:') && output.includes('http://localhost') && !serverReady) {
          serverReady = true;
        }
      });
    }
    
    if (serverProcess.stderr) {
      serverProcess.stderr.on('data', (data) => {
        console.error(`[Server Error] ${data.toString().trim()}`);
      });
    }
    
    // Wait for the server to be ready
    console.log('Waiting for dev server to be ready...');
    const maxWaitTime = 60000; // 60 seconds
    const startTime = Date.now();
    
    while (!serverReady && Date.now() - startTime < maxWaitTime) {
      // Check if server is responding
      try {
        await new Promise((resolve, reject) => {
          const req = http.get(`http://localhost:${serverPort}`, (res) => {
            if (res.statusCode === 200) {
              serverReady = true;
              console.log('Server is ready!');
              resolve();
            } else {
              reject(new Error(`Status code: ${res.statusCode}`));
            }
          });
          req.on('error', reject);
          req.setTimeout(2000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
          });
        });
        if (serverReady) break;
      } catch (error) {
        // Server not ready yet, continue waiting
        console.log(`Waiting for server... (${Math.round((Date.now() - startTime) / 1000)}s elapsed)`);
      }
      
      // Wait a bit before trying again
      await setTimeout(1000);
    }
    
    if (!serverReady) {
      console.error('Server failed to start within the timeout period.');
      process.exit(1);
    }
    
    // Get the command to run from command line arguments
    const args = process.argv.slice(2);
    const updateFlag = args.includes('--update');
    
    // Get Playwright test command
    let testCommand;
    if (args.length === 0) {
      // Default test command if none provided
      testCommand = 'test:ui';
    } else {
      testCommand = args.join(' ');
    }
    
    // Run the Playwright tests with updated environment variables
    console.log(`Running Playwright tests with BASE_URL=${baseUrl}...`);
    
    // Determine which command to run based on update flag
    testCommand = updateFlag ? 'test:ui:update' : 'test:ui';
    
    try {
      // Execute the Playwright tests with the correct BASE_URL
      // Use explicit --base-url flag to override any config settings
      execSync(`cross-env BASE_URL=${baseUrl} npm run ${testCommand} -- --base-url=${baseUrl}`, {
        env: {
          ...process.env,
          PORT: serverPort.toString(),
          VITE_PORT: serverPort.toString(),
          BASE_URL: baseUrl,
          PLAYWRIGHT_HTML_PORT: (serverPort + 1).toString(),
          SKIP_WEB_SERVER: 'true' // Skip Playwright's built-in web server since we're managing it
        },
        stdio: 'inherit'
      });
    } catch (error) {
      console.error('Tests failed with error:', error.message);
      process.exit(error.status || 1);
    } finally {
      // Kill the dev server
      console.log('Shutting down dev server...');
      if (process.platform === 'win32') {
        execSync(`taskkill /pid ${serverProcess.pid} /T /F`);
      } else {
        process.kill(-serverProcess.pid, 'SIGTERM');
      }
      console.log('Server shutdown complete');
    }
    
  } catch (error) {
    console.error('Error running tests with server:', error);
    process.exit(1);
  }
})();
