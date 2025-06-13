#!/usr/bin/env node

// Simple script to run minimal Playwright tests directly using Node API
// Avoids CLI flag issues in Windsurf by using the programmatic API

import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');

// Skip web server startup for Windsurf
process.env.SKIP_WEB_SERVER = 'true';

console.log('Starting minimal Playwright test in Windsurf using Node API...');
console.log('Project root:', projectRoot);

async function runMinimalTest() {
  console.log('Launching headless browser...');
  
  try {
    // Launch browser with explicit headless option
    const browser = await chromium.launch({ 
      headless: true 
    });
    
    console.log('Browser launched successfully');
    
    // Create a new context and page
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to a blank page and add some content
    await page.goto('about:blank');
    await page.setContent(`
      <html>
        <body>
          <h1>Playwright Test in Windsurf</h1>
          <p>This test verifies Playwright works in the Windsurf environment.</p>
        </body>
      </html>
    `);
    
    // Simple verification
    const heading = await page.textContent('h1');
    console.log(`Found heading: "${heading}"`);
    
    if (heading === 'Playwright Test in Windsurf') {
      console.log('✅ Heading verification passed!');
    } else {
      console.log('❌ Heading verification failed!');
      process.exit(1);
    }
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'windsurf-test-screenshot.png' });
    console.log('Screenshot saved to windsurf-test-screenshot.png');
    
    // Clean up
    await browser.close();
    console.log('✅ Test passed! Playwright is working in Windsurf.');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  }
}

// Run the test
runMinimalTest().catch(err => {
  console.error('Unhandled error in test runner:', err);
  process.exit(1);
});
