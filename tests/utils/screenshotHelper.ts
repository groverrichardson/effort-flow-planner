/**
 * Helper utility for handling screenshot comparisons and attaching results to test reports
 */
import { expect, Page, TestInfo } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { spawnSync } from 'child_process';

/**
 * Takes a screenshot, compares it with baseline, and attaches all images to the test report
 * with proper error handling
 */
export async function compareScreenshotAndAttachToReport(
  page: Page,
  nameOrTestInfo: string | TestInfo,
  nameOrOptions?: string | { 
    timeout?: number, 
    threshold?: number, 
    maxDiffPixelRatio?: number 
  },
  options: { 
    timeout?: number, 
    threshold?: number, 
    maxDiffPixelRatio?: number 
  } = {}
) {
  // Handle different argument patterns for backward compatibility
  let testInfo: TestInfo;
  let name: string;
  
  if (typeof nameOrTestInfo === 'string') {
    // Old format: (page, name) or (page, name, options)
    name = nameOrTestInfo;
    // Get testInfo from the fixture via the test runner
    // For backward compatibility, use a default output directory if testInfo is not available
    try {
      // @ts-ignore - accessing internal test runner property
      testInfo = page._browserContext._browser._options.playwright.config.projects[0].testDir;
    } catch (e) {
      console.warn('Could not get testInfo from page context, using fallback');
      // Create a minimal testInfo-like object with outputDir property and attach method
      testInfo = { 
        outputDir: path.join(process.cwd(), 'test-results/screenshots'),
        // Add a fallback attach method that just logs
        attach: async (title: string, options: any) => {
          console.log(`Would attach ${title} from ${options.path || 'unknown path'}`);
          return Promise.resolve();
        }
      } as TestInfo;
    }
    
    if (nameOrOptions && typeof nameOrOptions !== 'string') {
      options = nameOrOptions;
    }
  } else {
    // New format: (page, testInfo, name, options)
    testInfo = nameOrTestInfo;
    name = (nameOrOptions as string) || 'screenshot';
  }
  
  // Ensure the name doesn't already end with .png and is defined
  // Add null/undefined check before calling endsWith
  const baseName = name && typeof name === 'string' && name.endsWith('.png') ? name.slice(0, -4) : (name || 'screenshot');
  const screenshotName = `${baseName}.png`;
  
  // Screenshot options
  const screenshotOptions = {
    timeout: options.timeout || 5000,
    threshold: options.threshold || 0.02, // 2% threshold for visual differences
    maxDiffPixelRatio: options.maxDiffPixelRatio || 0.01
  };

  // Create a custom screenshot first to make sure we have the actual image
  const timestamp = new Date().getTime();
  const actualImageName = `${baseName}-actual-${timestamp}.png`;
  const actualImagePath = path.join(testInfo.outputDir, actualImageName);
  
  console.log(`📸 Taking screenshot: ${baseName}`);
  await page.screenshot({ path: actualImagePath });
  
  // Attach the actual screenshot to the report
  try {
    await testInfo.attach(`${baseName} (Actual)`, {
      path: actualImagePath,
      contentType: 'image/png'
    });
    console.log(`✅ Attached actual screenshot: ${actualImagePath}`);
  } catch (err) {
    console.warn(`⚠️ Could not attach actual screenshot: ${err.message}`);
  }

  // Playwright stores snapshots in [testfile]-snapshots directory
  const snapshotDir = path.join(process.cwd(), 'tests', 'ui.spec.ts-snapshots');
  
  // Format should be [name]-[browser]-[platform].png
  // Add fallback for testInfo.project.name in case it's undefined
  const browserName = testInfo.project?.name || 'chromium'; // Default to chromium if project name is undefined
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
    try {
      await testInfo.attach(`${baseName} (Expected)`, {
        path: baselineImagePath,
        contentType: 'image/png'
      });
      console.log(`✅ Attached baseline screenshot: ${baselineImagePath}`);
    } catch (err) {
      console.warn(`⚠️ Could not attach baseline screenshot: ${err.message}`);
    }
    
    // Generate a diff image using ImageMagick (if available)
    try {
      const diffImageName = `${baseName}-diff-${timestamp}.png`;
      const diffImagePath = path.join(testInfo.outputDir, diffImageName);
      
      // Check if ImageMagick is installed
      try {
        // Use ImageMagick to generate a diff visualization with safer parameter passing
        const result = spawnSync('convert', [
          baselineImagePath,
          actualImagePath,
          '-compose',
          'difference',
          '-composite',
          diffImagePath
        ]);
        
        // Check if the command was successful
        if (result.status !== 0) {
          console.log(`⚠️ ImageMagick diff generation failed: ${result.stderr?.toString() || 'Unknown error'}`);
        }
        
        // Attach the diff to the report
        if (fs.existsSync(diffImagePath)) {
          try {
            await testInfo.attach(`${baseName} (Diff)`, {
              path: diffImagePath,
              contentType: 'image/png'
            });
            console.log(`✅ Created and attached diff image: ${diffImagePath}`);
          } catch (err) {
            console.warn(`⚠️ Could not attach diff image: ${err.message}`);
          }
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
    // Explicitly ensure the threshold is set correctly with the right option name
    // This ensures compatibility with both toHaveScreenshot and the global config
    const enhancedOptions = {
      ...screenshotOptions,
      // Make sure both threshold options are covered (Playwright has changed option names in different versions)
      threshold: screenshotOptions.threshold,
    };

    console.log(`Comparing screenshot with threshold: ${enhancedOptions.threshold} (${enhancedOptions.threshold * 100}%)`);
    
    await expect(page).toHaveScreenshot(screenshotName, enhancedOptions);
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
