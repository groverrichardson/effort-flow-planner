import { defineConfig, devices } from '@playwright/test';
import path, { dirname } from 'path'; // Updated import for dirname
import { fileURLToPath } from 'url'; // Added for ESM __dirname equivalent
import { findAvailablePort } from './tests/utils/portUtils'; // Import the port utility

// Get port from environment or use default
const PORT = process.env.PORT || process.env.VITE_PORT || 8080;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Default to headless mode, but allow headed mode with HEADED=1
const HEADLESS = process.env.HEADED !== '1';

// Default port for HTML reporter - will be overridden at runtime
const HTML_REPORT_PORT = 9323;

// Define __filename and __dirname for ES Module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the path to the authentication state file
const AUTH_FILE_PATH = path.resolve(__dirname, './playwright/.auth/user.json');

// Create a function to find an available port (will be used by reporter on startup)
process.env.PLAYWRIGHT_HTML_PORT = process.env.PLAYWRIGHT_HTML_PORT || HTML_REPORT_PORT.toString();

// Export the config directly as Playwright requires
export default defineConfig({
  testDir: './tests',
  // Only run .spec.ts files, exclude .test.ts files
  testMatch: '**/*.spec.ts',
  timeout: 30 * 1000,
  expect: {
    timeout: 10000,
    // Less strict comparison for visual testing (allows for small rendering differences)
    toMatchSnapshot: { 
      maxDiffPixelRatio: 0.05,
      threshold: 0.02, // 2% threshold for visual differences
    },
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Use a single worker for watch mode to make it easier to follow
  workers: process.env.PWTEST_WATCH ? 1 : (process.env.CI ? 1 : undefined),
  // Generate both HTML and list reporters for better visibility
  reporter: [
    ['html', { 
      open: process.env.HTML_REPORT_OPEN || (process.env.CI ? 'never' : 'never'),
      port: parseInt(process.env.PLAYWRIGHT_HTML_PORT || '0'),
      host: process.env.HTML_REPORT_HOST || 'localhost',
      // Add graceful shutdown to prevent port conflicts
      outputFolder: './test-results/html-report'
    }], 
    ['list']
  ],

  // Global setup to run before all tests
  globalSetup: path.resolve(__dirname, './tests/global-setup.ts'), // Use path.resolve with ESM-compatible __dirname
  
  // Global teardown to run after all tests (for port cleanup)
  globalTeardown: path.resolve(__dirname, './tests/global.teardown.mjs'),
  use: {
    baseURL: BASE_URL,
    // Run in headless mode by default (no browser windows)
    headless: HEADLESS,
    // Always capture traces in watch mode
    trace: process.env.PWTEST_WATCH ? 'on' : 'on-first-retry',
    // ⚠️ CRITICAL REQUIREMENT: Always take screenshots for ALL tests ⚠️
    // This setting must remain 'on' to ensure screenshots for every test (pass or fail)
    // DO NOT change this to 'only-on-failure' or any other value
    // Project requirement: Screenshots must be generated for all tests without exception
    screenshot: 'on',
    // Automatically capture screenshots after navigation and major UI interactions
    viewport: { width: 1280, height: 720 },
    // Use the saved authentication state for all tests
    storageState: AUTH_FILE_PATH, // Added
  },
  // Store screenshots in an organized way
  outputDir: 'screenshots',
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // storageState: AUTH_FILE_PATH, // No longer needed here, inherited from top-level 'use'
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        // storageState: AUTH_FILE_PATH, // No longer needed here, inherited from top-level 'use'
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        // storageState: AUTH_FILE_PATH, // No longer needed here, inherited from top-level 'use'
      },
    },
  ],
  // Conditionally start web server - skip it in Windsurf or when SKIP_WEB_SERVER is set
  // Make the webServer conditional so tests can be discovered by VS Code extension
  webServer: process.env.SKIP_WEB_SERVER === 'true' ? undefined : {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
  },
  // Watch mode is controlled via PWTEST_WATCH=1 environment variable
});
