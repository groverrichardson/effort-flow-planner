import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { createServer } from 'http';
import * as net from 'net';

// Load environment variables from .env file
dotenv.config();

/**
 * Gets a free port by creating a server and releasing it immediately
 */
export async function getFreePort(): Promise<number> {
  return new Promise(resolve => {
    const server = createServer();
    server.listen(0, () => {
      const { port } = server.address() as net.AddressInfo;
      server.close(() => {
        resolve(port);
      });
    });
  });
}

// Use a default port for tests, but allow it to be overridden via environment variables
process.env.TEST_PORT = process.env.TEST_PORT || '8081';

export default defineConfig({
  // Directory where tests are located
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  
  // Maximum time one test can run for
  timeout: 30 * 1000,
  
  // Run all tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Workers for individual test files
  workers: process.env.CI ? 1 : undefined,
  
  // Configure projects for different browser environments and setups
  projects: [
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Ensure tests run headless
        headless: true,
        // Use the authenticated state that was set up in global.setup.ts
        storageState: 'playwright/.auth/user.json',
        // Use the dynamic port for the baseURL
        baseURL: `http://localhost:${process.env.TEST_PORT || '5173'}`,
        // Automatically take screenshots on failure
        screenshot: 'only-on-failure',
      },
      dependencies: ['setup'],
    },
  ],

  // Configure reporting
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  
  // Run your local dev server before starting tests
  webServer: {
    // Use a modified command that explicitly sets the port for Vite
    command: `VITE_PORT=${process.env.TEST_PORT || '5173'} npm run dev`,
    url: `http://localhost:${process.env.TEST_PORT || '5173'}`,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 30000, // Wait up to 30 seconds for the server to be ready
  },
  
  // Configure expect behavior
  expect: {
    timeout: 10000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.05 }
  },

  // Global setup - used for authentication
  globalSetup: './tests/global.setup.ts',
});