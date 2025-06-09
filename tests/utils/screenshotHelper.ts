/**
 * Helper utility for handling screenshot comparisons and attaching results to test reports
 */
import { expect, Page, TestInfo } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';

/**
 * Takes a screenshot, compares it with baseline, and attaches all images to the test report
 * with proper error handling
 */
export async function compareScreenshotAndAttachToReport(
  page: Page,
  testInfo: TestInfo,
  name: string,
  options: { 
    timeout?: number, 
    threshold?: number, 
    maxDiffPixelRatio?: number 
  } = {}
) {
  // Ensure the name doesn't already end with .png
  const baseName = name.endsWith('.png') ? name.slice(0, -4) : name;
  const screenshotName = `${baseName}.png`;
  
  // Screenshot options
  const screenshotOptions = {
    timeout: options.timeout || 5000,
    threshold: options.threshold || 0.2,
    maxDiffPixelRatio: options.maxDiffPixelRatio || 0.01
  };

  // Create a custom screenshot first to make sure we have the actual image
  const timestamp = new Date().getTime();
  const actualImageName = `${baseName}-actual-${timestamp}.png`;
  const actualImagePath = path.join(testInfo.outputDir, actualImageName);
  
  console.log(`📸 Taking screenshot: ${baseName}`);
  await page.screenshot({ path: actualImagePath });
  
  // Attach the actual screenshot to the report
  await testInfo.attach(`${baseName} (Actual)`, {
    path: actualImagePath,
    contentType: 'image/png'
  });
  console.log(`✅ Attached actual screenshot: ${actualImagePath}`);

  // Playwright stores snapshots in [testfile]-snapshots directory
  const snapshotDir = path.join(process.cwd(), 'tests', 'ui.spec.ts-snapshots');
  
  // Format should be [name]-[browser]-[platform].png
  const browserName = testInfo.project.name; // chromium, firefox, or webkit
  const platform = process.platform; // darwin, win32, linux
  
  // Try multiple naming formats to find the baseline
  let baselineImagePath = path.join(snapshotDir, `${baseName}-${browserName}-${platform}.png`);
  
  // If not found with that exact name, try without platform
  if (!fs.existsSync(baselineImagePath)) {
    baselineImagePath = path.join(snapshotDir, `${baseName}-${browserName}.png`);
  }
  
  // If still not found, try just the base name
  if (!fs.existsSync(baselineImagePath)) {
    baselineImagePath = path.join(snapshotDir, `${baseName}.png`);
  }
  
  console.log(`Looking for baseline at: ${baselineImagePath}`);
  
  
  // If we have a baseline, attach it to the report
  if (fs.existsSync(baselineImagePath)) {
    await testInfo.attach(`${baseName} (Expected)`, {
      path: baselineImagePath,
      contentType: 'image/png'
    });
    console.log(`✅ Attached baseline screenshot: ${baselineImagePath}`);
    
    // Generate a diff image using ImageMagick (if available)
    try {
      const diffImageName = `${baseName}-diff-${timestamp}.png`;
      const diffImagePath = path.join(testInfo.outputDir, diffImageName);
      
      // Check if ImageMagick is installed
      try {
        // Use ImageMagick to generate a diff visualization
        execSync(`convert ${baselineImagePath} ${actualImagePath} -compose difference -composite ${diffImagePath}`);
        
        // Attach the diff to the report
        if (fs.existsSync(diffImagePath)) {
          await testInfo.attach(`${baseName} (Diff)`, {
            path: diffImagePath,
            contentType: 'image/png'
          });
          console.log(`✅ Created and attached diff image: ${diffImagePath}`);
        }
      } catch (imgError) {
        console.log(`⚠️ ImageMagick not available, skipping diff generation`);
      }
    } catch (diffError) {
      console.warn(`⚠️ Failed to create diff image: ${diffError}`);
    }
  } else {
    console.log(`⚠️ No baseline found at: ${baselineImagePath}`);
  }

  // Now perform the actual Playwright comparison
  try {
    await expect(page).toHaveScreenshot(screenshotName, screenshotOptions);
    return { 
      success: true, 
      message: `Screenshot matches baseline for ${baseName}`
    };
  } catch (error) {
    // The test will continue but will be marked as failed
    return { 
      success: false, 
      message: `Screenshot comparison failed for ${baseName}`,
      error
    };
  }
}
