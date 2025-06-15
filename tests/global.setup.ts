import { chromium, FullConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';

// Load environment variables from .env file
dotenv.config();

// Get email and password from environment variables
const EMAIL = process.env.PLAYWRIGHT_TEST_USER_EMAIL;
const PASSWORD = process.env.PLAYWRIGHT_TEST_USER_PASSWORD;

// Supabase URL and anon key from .env
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

/**
 * Dynamic port detection function
 * Tries common development server ports to find the running application
 */
async function detectApplicationUrl(): Promise<string> {
  // First try the APP_URL from environment if it's set
  if (process.env.APP_URL) {
    console.log(`Using APP_URL from environment: ${process.env.APP_URL}`);
    return process.env.APP_URL;
  }

  // Common development server ports to check
  const portsToCheck = [3000, 8080, 5173, 4200, 3001, 8000, 5000];
  const hostname = 'localhost';

  for (const port of portsToCheck) {
    const url = `http://${hostname}:${port}`;
    console.log(`Checking for application at ${url}...`);
    
    try {
      await new Promise<void>((resolve, reject) => {
        const req = http.get(url, { timeout: 2000 }, (res) => {
          if (res.statusCode && res.statusCode < 400) {
            resolve();
          } else {
            reject(new Error(`Status code: ${res.statusCode}`));
          }
        });
        
        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      
      console.log(`✅ Found application running at ${url}`);
      return url;
    } catch (error) {
      console.log(`❌ No application found at ${url}: ${error.message}`);
    }
  }

  // If no port is found, default to localhost:8080
  const defaultUrl = 'http://localhost:8080';
  console.log(`⚠️ No running application detected. Defaulting to ${defaultUrl}`);
  return defaultUrl;
}

/**
 * Global setup function for Playwright tests.
 * This will run before all tests and set up authentication.
 */
async function globalSetup(config: FullConfig) {
  if (!EMAIL || !PASSWORD) {
    console.error('❌ PLAYWRIGHT_TEST_USER_EMAIL and PLAYWRIGHT_TEST_USER_PASSWORD must be defined in .env file');
    console.error('Cannot proceed with authentication setup.');
    return;
  }

  console.log('Starting authentication setup...');
  
  // Detect the application URL dynamically
  const BASE_URL = await detectApplicationUrl();
  
  console.log('Auth Config:', {
    EMAIL: EMAIL ? '✅ Set' : '❌ Missing',
    PASSWORD: PASSWORD ? '✅ Set' : '❌ Missing',
    SUPABASE_URL: SUPABASE_URL ? '✅ Set' : '❌ Missing',
    SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
    BASE_URL
  });

  // Get the storage state path from config
  const authFile = path.resolve(process.cwd(), 'playwright', '.auth', 'user.json');
  
  // Make sure the authentication directory exists
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  let browser;
  let context;
  let page;

  try {
    // Create a browser instance with debug mode
    browser = await chromium.launch({ 
      headless: true, // Use headless mode for faster execution
      slowMo: 50 // Slight slow down for stability
    });
    
    // Create a new browser context
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    
    // Create a new page
    page = await context.newPage();

    console.log(`Navigating to ${BASE_URL}/#/login...`);
    await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for page to load completely
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    console.log('Attempting to log in...');
    
    // Fill email
    await page.fill('input[type="email"]', EMAIL);
    console.log('✅ Email filled');
    
    // Fill password
    await page.fill('input[type="password"]', PASSWORD);
    console.log('✅ Password filled');
    
    // Click sign in button
    await page.click('button[type="submit"]');
    console.log('✅ Sign in button clicked');
    
    // Wait for navigation after login - the app redirects to root path
    await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 });
    console.log('✅ Successfully logged in and redirected to root path');
    
    // Wait a bit for any post-login setup
    await page.waitForTimeout(2000);
    
    // Get localStorage to capture auth tokens
    const localStorage = await page.evaluate(() => {
      const result: { [key: string]: string | null } = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          result[key] = window.localStorage.getItem(key);
        }
      }
      return result;
    });
    
    console.log('Local storage keys:', Object.keys(localStorage));
    
    // Get the storage state
    const storageState = await context.storageState();
    
    // Enhance the storage state with localStorage data
    const enhancedStorageState = {
      ...storageState,
      origins: storageState.origins.map(origin => {
        if (origin.origin === BASE_URL) {
          return {
            ...origin,
            localStorage: Object.entries(localStorage).map(([name, value]) => ({
              name,
              value: value || ''
            }))
          };
        }
        return origin;
      })
    };
    
    // If no matching origin, add one
    if (!storageState.origins.some(origin => origin.origin === BASE_URL)) {
      enhancedStorageState.origins.push({
        origin: BASE_URL,
        localStorage: Object.entries(localStorage).map(([name, value]) => ({
          name,
          value: value || ''
        }))
      });
    }
    
    // Write the enhanced storage state to file
    fs.writeFileSync(authFile, JSON.stringify(enhancedStorageState, null, 2));
    console.log(`✅ Authentication state saved to: ${authFile}`);
    
  } catch (error) {
    console.error('❌ Error during authentication setup:', error);
    
    // Try to take a screenshot for debugging if page is still available
    if (page) {
      try {
        await page.screenshot({ path: 'playwright/.auth/auth-error.png' });
        console.log('📸 Error screenshot saved');
      } catch (screenshotError) {
        console.log('Could not take error screenshot:', screenshotError);
      }
    }
    
    throw error; // Re-throw the error to fail the setup
  } finally {
    // Close browser safely
    if (browser) {
      try {
        await browser.close();
        console.log('✅ Browser closed');
      } catch (closeError) {
        console.log('Error closing browser:', closeError);
      }
    }
  }
}

export default globalSetup;