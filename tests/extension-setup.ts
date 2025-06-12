// tests/extension-setup.ts - Setup specifically for VS Code Playwright extension tests
import 'dotenv/config'; // Load environment variables from .env file
import { FullConfig } from '@playwright/test';
import { mockServerHelper } from './utils/mockServerHelper';

/**
 * Global setup for VS Code Playwright extension tests
 * This starts a mock server to prevent connection refused errors when SKIP_WEB_SERVER=true
 */
async function extensionSetup(config: FullConfig) {
  console.log('[EXTENSION SETUP] Starting setup for VS Code Playwright extension tests');
  
  // Check if we're running with SKIP_WEB_SERVER=true
  const skipWebServer = process.env.SKIP_WEB_SERVER === 'true';
  
  if (skipWebServer) {
    console.log('[EXTENSION SETUP] SKIP_WEB_SERVER=true, starting mock server');
    // Start the mock server to prevent connection refused errors
    await mockServerHelper.startServer();
    console.log('[EXTENSION SETUP] Mock server started successfully');
  } else {
    console.log('[EXTENSION SETUP] SKIP_WEB_SERVER not set to true, skipping mock server');
  }
  
  console.log('[EXTENSION SETUP] Setup complete');
}

export default extensionSetup;
