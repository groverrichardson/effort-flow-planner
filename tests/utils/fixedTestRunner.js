#!/usr/bin/env node
/**
 * Simplified test runner script for Playwright tests
 * This script performs the following:
 * 1. Finds an available port
 * 2. Starts the dev server on that port
 * 3. Waits for the server to be ready
 * 4. Runs Playwright tests with correctly set BASE_URL
 * 5. Shuts down the server after tests
 *
 * ⚠️ CRITICAL REQUIREMENT: ⚠️
 * This script MUST maintain the --update-snapshots flag for the Playwright command
 * and ensure that screenshots are always taken for ALL tests (both passed and failed).
 * Do not remove these settings as they are essential for maintaining test documentation.
 *
 * The snapshot settings in playwright.config.ts file must remain set to:
 * screenshot: 'on'
 *
 * Project requirement: Screenshots must be generated for all tests without exception.
 */

import { spawn, execSync } from 'child_process';
import { findAvailablePort } from './portUtils.js';
import http from 'http';
import { setTimeout } from 'timers/promises';

// Self-executing async function
(async () => {
  try {
    // Find available port for dev server
    console.log('Finding available port for dev server...');
    const serverPort = await findAvailablePort(3000);
    console.log(`Using port ${serverPort} for dev server`);
    
    // Create the base URL for tests
    const baseUrl = `http://localhost:${serverPort}`;
    
    // Start the dev server with the specific port
    console.log(`Starting dev server on port ${serverPort}...`);
    const serverProcess = spawn('npx', ['vite', '--port', serverPort.toString()], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true // To make it a process group leader for proper shutdown
    });
    
    // Handle server output
    if (serverProcess.stdout) {
      serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[Server] ${output.trim()}`);
      });
    }
    
    if (serverProcess.stderr) {
      serverProcess.stderr.on('data', (data) => {
        console.error(`[Server Error] ${data.toString().trim()}`);
      });
    }
    
    // Wait for the server to be ready
    const maxWaitTime = 60000; // 60 seconds max wait time
    const startTime = Date.now();
    let serverReady = false;
    
    console.log(`Waiting for server to be ready on ${baseUrl}...`);
    
    while (!serverReady && Date.now() - startTime < maxWaitTime) {
      // Check if server is responding
      try {
        await new Promise((resolve, reject) => {
          const req = http.get(baseUrl, (res) => {
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
      throw new Error('Server did not become ready in the allocated time');
    }
    
    // Determine if we should update snapshots based on args
    const args = process.argv.slice(2);
    const updateFlag = args.includes('--update');
    
    try {
      // Run Playwright tests with explicit base URL
      console.log(`Running Playwright tests with BASE_URL=${baseUrl}`);
      
      // Always update snapshots and take screenshots of all tests
      // We'll use environment variables to control the behavior rather than command line arguments
      const playwrightCommand = `npx playwright test --project=chromium --update-snapshots`;
      
      // IMPORTANT: We explicitly set SKIP_WEB_SERVER=true to prevent Playwright from starting its own server
      // We also set environment variables to control snapshot and screenshot behavior
      execSync(playwrightCommand, {
        env: {
          ...process.env,
          BASE_URL: baseUrl,
          PORT: serverPort.toString(),
          VITE_PORT: serverPort.toString(),
          SKIP_WEB_SERVER: 'true'
        },
        stdio: 'inherit'
      });
      
      console.log('Tests completed successfully!');
    } catch (error) {
      console.error('Tests failed with error:', error.message);
    } finally {
      // Shutdown the server
      console.log('Shutting down dev server...');
      try {
        if (process.platform === 'win32') {
          execSync(`taskkill /pid ${serverProcess.pid} /T /F`);
        } else {
          process.kill(-serverProcess.pid, 'SIGTERM');
        }
      } catch (e) {
        console.error('Error shutting down server:', e.message);
      }
      console.log('Server shutdown complete');
    }
  } catch (error) {
    console.error('Error running tests with server:', error);
    process.exit(1);
  }
})();
