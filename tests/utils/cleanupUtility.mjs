/**
 * Utility to help clean up resources after tests
 * This is especially important for releasing ports used by the HTML reporter
 */

import { createServer } from 'net';

/**
 * Release a specific port by briefly binding to it and releasing
 * This helps clear any lingering connections
 * 
 * @param {number} port The port to release
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
async function releasePort(port) {
  return new Promise((resolve) => {
    try {
      // Try to create a server on the port
      const server = createServer();
      
      // Set a short timeout in case binding hangs
      const timeout = setTimeout(() => {
        try {
          server.close();
        } catch (e) {
          // Ignore
        }
        console.log(`Could not release port ${port} (timeout)`);
        resolve(false);
      }, 1000);
      
      // Handle errors
      server.on('error', () => {
        clearTimeout(timeout);
        console.log(`Port ${port} is still in use by another process`);
        resolve(false);
      });
      
      // Successfully bound to the port
      server.on('listening', () => {
        clearTimeout(timeout);
        server.close(() => {
          console.log(`Successfully released port ${port}`);
          resolve(true);
        });
      });
      
      // Try to bind to the port
      server.listen(port);
    } catch (err) {
      console.error(`Error trying to release port ${port}:`, err);
      resolve(false);
    }
  });
}

/**
 * Release Playwright report port when the process exits
 * Called by the global teardown script
 */
async function releasePlaywrightPorts() {
  const port = process.env.PLAYWRIGHT_HTML_PORT;
  
  if (port && process.env.PW_PORT_RELEASE_ON_EXIT === '1') {
    console.log(`Attempting to release Playwright HTML reporter port: ${port}`);
    await releasePort(parseInt(port));
    
    // Attempt release on neighboring ports that might be stuck
    const portNum = parseInt(port);
    console.log('Checking neighboring ports as well...');
    await Promise.all([
      releasePort(portNum - 1),
      releasePort(portNum + 1)
    ]);
  }
  
  // Release the default port if it wasn't our selected port
  const defaultPort = 9323;
  const selectedPort = parseInt(port || '0');
  if (selectedPort !== defaultPort) {
    console.log(`Also releasing default port: ${defaultPort}`);
    await releasePort(defaultPort);
  }
}

export {
  releasePort,
  releasePlaywrightPorts
};
