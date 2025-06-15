// Simple script to create authentication state for Playwright
import { chromium } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
  console.log('Starting authentication setup...');
  
  // Create browser and context
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Base URL for testing
  const baseUrl = 'http://localhost:8082';
  
  try {
    // Navigate to login page
    await page.goto(`${baseUrl}/login`);
    console.log('Navigated to login page');
    
    // Wait for user to see the page
    console.log('\n======================================================');
    console.log('PLEASE LOG IN MANUALLY IN THE BROWSER WINDOW');
    console.log('You have 2 minutes to complete login');
    console.log('======================================================\n');
    
    // Wait for navigation away from login (success) or timeout after 120 seconds (2 minutes)
    try {
      // Create a timer that logs updates every 15 seconds
      let timer = 0;
      const interval = setInterval(() => {
        timer += 15;
        console.log(`${120 - timer} seconds remaining to login...`);
      }, 15000);
      
      await Promise.race([
        page.waitForNavigation({ timeout: 120000 }),
        new Promise(resolve => setTimeout(resolve, 120000))
      ]);
      
      // Clear the interval when done
      clearInterval(interval);
    } catch (e) {
      console.log('Timeout or navigation error, checking login status...');
    }
    
    // Check current URL to see if login was successful
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // If not on login page anymore, consider it a success
    if (!currentUrl.includes('login')) {
      console.log('Login successful!');
      
      // Create auth directory if it doesn't exist
      const authDir = path.resolve(process.cwd(), 'playwright', '.auth');
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }
      
      // Save authentication state
      const authFile = path.join(authDir, 'user.json');
      await context.storageState({ path: authFile });
      
      console.log('Authentication state saved to:', authFile);
    } else {
      console.log('Still on login page, authentication not successful');
    }
    
    // Take a final screenshot
    await page.screenshot({ path: 'auth-setup-result.png' });
    
  } catch (e) {
    console.error('Error during authentication setup:', e);
  } finally {
    // Close browser
    await browser.close();
    console.log('Authentication setup complete');
  }
})();
