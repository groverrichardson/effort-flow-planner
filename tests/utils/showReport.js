#!/usr/bin/env node
/**
 * Helper script to find an available port before showing the Playwright report
 * This resolves port conflicts with the HTML reporter
 */

import { spawn } from 'child_process';
import net from 'net';

// Default port range
const START_PORT = 9330; // Start at a higher port to avoid conflicts
const MAX_ATTEMPTS = 50;

/**
 * Check if a specific port is available using a direct connection attempt
 */
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port is in use
        resolve(false);
      } else {
        // Other error, consider port unusable
        console.error(`Error checking port ${port}:`, err.code);
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      // Port is available, close the server and resolve
      server.close(() => {
        resolve(true);
      });
    });
    
    // Try to listen on the port
    try {
      server.listen(port, '127.0.0.1'); // Use 127.0.0.1 instead of ::1
    } catch (err) {
      console.error(`Exception trying port ${port}:`, err);
      resolve(false);
    }
  });
}

/**
 * Find an available port by checking sequentially from startPort
 */
async function findAvailablePort(startPort, maxAttempts) {
  console.log(`Looking for an available port starting from ${startPort}...`);
  
  for (let port = startPort; port < startPort + maxAttempts; port++) {
    const available = await checkPort(port);
    if (available) {
      console.log(`Found available port: ${port}`);
      return port;
    }
  }
  
  // Fall back to a random high port if we couldn't find anything
  const randomPort = Math.floor(Math.random() * 10000) + 50000;
  console.log(`Could not find available port in range, trying random port ${randomPort}`);
  return randomPort;
}

// Self-executing async function
(async function() {
  try {
    // Find an available port directly, without relying on portUtils
    const port = await findAvailablePort(START_PORT, MAX_ATTEMPTS);
    console.log(`🔌 Opening report on port: ${port}`);
    
    // Spawn a process to show the report on the available port
    const showReport = spawn('npx', ['playwright', 'show-report', `--port=${port}`], {
      stdio: 'inherit',
      shell: true
    });
    
    // Handle process completion
    showReport.on('close', (code) => {
      if (code !== 0) {
        console.error(`Report viewer process exited with code ${code}`);
        process.exit(code);
      }
    });
    
    // Handle errors
    showReport.on('error', (err) => {
      console.error('Failed to start report viewer:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('Error starting report viewer:', error);
    process.exit(1);
  }
})();
