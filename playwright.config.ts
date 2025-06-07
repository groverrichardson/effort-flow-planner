import { defineConfig, devices } from '@playwright/test';

// Get port from environment or use default
const PORT = process.env.PORT || process.env.VITE_PORT || 8080;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: {
    timeout: 10000,
    // Less strict comparison for visual testing (allows for small rendering differences)
    toMatchSnapshot: { 
      maxDiffPixelRatio: 0.05,
      threshold: 0.2, // Tolerates slightly more image difference
    },
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Use a single worker for watch mode to make it easier to follow
  workers: process.env.PWTEST_WATCH ? 1 : (process.env.CI ? 1 : undefined),
  // Generate both HTML and list reporters for better visibility
  reporter: [['html'], ['list']],
  use: {
    baseURL: BASE_URL,
    // Always capture traces in watch mode
    trace: process.env.PWTEST_WATCH ? 'on' : 'on-first-retry',
    // Take screenshots of everything in watch mode
    screenshot: process.env.PWTEST_WATCH ? 'on' : 'only-on-failure',
    // Automatically capture screenshots after navigation and major UI interactions
    viewport: { width: 1280, height: 720 },
  },
  // Store screenshots in an organized way
  outputDir: 'screenshots',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
  },
  // Watch mode is controlled via PWTEST_WATCH=1 environment variable
});
