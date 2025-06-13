/**
 * JavaScript version of port utilities for ES modules
 */

import { createServer } from 'net';

/**
 * Find the first available port starting from the provided port
 * and incrementing until an open port is found
 * 
 * @param startPort The port to start checking from
 * @param maxAttempts Maximum number of ports to check
 * @returns A promise that resolves to the first available port
 */
export async function findAvailablePort(startPort = 9323, maxAttempts = 10) {
  for (let port = startPort; port < startPort + maxAttempts; port++) {
    try {
      const available = await isPortAvailable(port);
      if (available) {
        return port;
      }
    } catch (err) {
      console.log(`Error checking port ${port}:`, err);
      // Continue to next port
    }
  }
  
  // If we couldn't find an available port, return the original port as fallback
  console.log(`Could not find available port after ${maxAttempts} attempts. Falling back to ${startPort}.`);
  return startPort;
}

/**
 * Check if a specific port is available
 * 
 * @param port The port to check
 * @returns Promise that resolves to true if port is available, false otherwise
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer();
    
    server.once('error', () => {
      // Port is in use
      resolve(false);
    });
    
    server.once('listening', () => {
      // Port is available, close the server
      server.close(() => {
        resolve(true);
      });
    });
    
    server.listen(port);
  });
}
