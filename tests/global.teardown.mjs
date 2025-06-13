/**
 * Global teardown script for Playwright
 * Performs cleanup operations after all tests have run
 */

import { releasePlaywrightPorts } from './utils/cleanupUtility.mjs';

/**
 * Main global teardown function
 * Called automatically by Playwright after all tests have run
 */
async function globalTeardown() {
  console.log('Starting global teardown...');
  
  // Release any ports that might be in use by the HTML reporter
  await releasePlaywrightPorts();
  
  console.log('Global teardown complete');
}

export default globalTeardown;
