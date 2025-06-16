import { chromium, errors } from '@playwright/test';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { getFreePort } from '../playwright.config';

// Load environment variables from .env file
dotenv.config();

// Verify required environment variables exist
const requiredEnvVars = [
    'PLAYWRIGHT_TEST_USER_EMAIL',
    'PLAYWRIGHT_TEST_USER_PASSWORD',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
];
for (const envVar of requiredEnvVars) {
   if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable ${envVar}`);
   }
 }

async function globalSetup() {
    console.log('Starting global setup for authentication...');

    // Create auth directory if it doesn't exist
    const authDir = path.join(process.cwd(), 'playwright', '.auth');
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
    }

    // Create screenshots directory for debugging
    const screenshotsDir = path.join(process.cwd(), 'playwright', 'auth-debug');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Use the port specified in the TEST_PORT environment variable
    const port = parseInt(process.env.TEST_PORT || '8081');
    console.log(`Using port ${port} for tests`);

    // Launch a browser with a larger viewport to ensure all elements are visible
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        recordVideo: { dir: path.join(screenshotsDir, 'videos') },
    });

    const page = await context.newPage();

    try {
        // Take screenshots at each step for debugging
        const screenshotPath = (name: string) =>
            path.join(
                process.cwd(),
                'playwright',
                'auth-debug',
                `${name}-${new Date().toISOString().replace(/[:.]/g, '-')}.png`
            );

        // Step 1: Navigate to the login page
        console.log(
            `Navigating to login page at http://localhost:${process.env.TEST_PORT}/login`
        );
        await page.goto(`http://localhost:${port}/login`, { timeout: 30000 });
        await page.screenshot({
            path: screenshotPath('01-login-page-loaded'),
            fullPage: true,
        });

        // Step 2: Wait for and verify the login form
        console.log('Waiting for login form...');
        try {
            // Try multiple selector strategies to find the form
            await Promise.race([
                page.waitForSelector('form', { timeout: 10000 }),
                page.waitForSelector('[data-testid="login-form"]', {
                    timeout: 10000,
                }),
                page.waitForSelector('input[type="email"]', { timeout: 10000 }),
            ]);
        } catch (error) {
            console.error(
                'Could not find login form. Taking diagnostic screenshot...'
            );
            await page.screenshot({
                path: screenshotPath('error-no-login-form'),
                fullPage: true,
            });
            console.log('Current page HTML:');
            console.log(await page.content());
            throw error;
        }

        await page.screenshot({
            path: screenshotPath('02-login-form-found'),
            fullPage: true,
        });

        // Step 3: Fill in login credentials with improved selectors
        console.log('Filling login form with test credentials...');

        // Handle email field
        try {
            const emailInput =
                (await page.$('input[type="email"]')) ||
                (await page.$('[placeholder*="email" i]')) ||
                (await page.$('input[name*="email" i]'));

            if (!emailInput) {
                throw new Error('Could not find email input field');
            }

            await emailInput.fill(process.env.PLAYWRIGHT_TEST_USER_EMAIL || '');
        } catch (error) {
            console.error('Failed to fill email:', error);
            await page.screenshot({
                path: screenshotPath('error-email-input'),
                fullPage: true,
            });
            throw error;
        }

        // Handle password field
        try {
            const passwordInput =
                (await page.$('input[type="password"]')) ||
                (await page.$('[placeholder*="password" i]')) ||
                (await page.$('input[name*="password" i]'));

            if (!passwordInput) {
                throw new Error('Could not find password input field');
            }

            await passwordInput.fill(
                process.env.PLAYWRIGHT_TEST_USER_PASSWORD || ''
            );
        } catch (error) {
            console.error('Failed to fill password:', error);
            await page.screenshot({
                path: screenshotPath('error-password-input'),
                fullPage: true,
            });
            throw error;
        }

        await page.screenshot({
            path: screenshotPath('03-credentials-filled'),
            fullPage: true,
        });

        // Step 4: Click the login button with improved selector strategy
        console.log('Clicking login button...');
        try {
            const loginButton =
                (await page.$('button[type="submit"]')) ||
                (await page.$('button:has-text("Login")')) ||
                (await page.$('button:has-text("Sign in")')) ||
                (await page.$('[type="submit"]'));

            if (!loginButton) {
                throw new Error('Could not find login button');
            }

            await loginButton.click();
        } catch (error) {
            console.error('Failed to click login button:', error);
            await page.screenshot({
                path: screenshotPath('error-login-button'),
                fullPage: true,
            });
            throw error;
        }

        // Step 5: Wait for successful login/navigation
        console.log('Waiting for successful login redirect...');
        try {
            await page.waitForURL(
                `http://localhost:${process.env.TEST_PORT}/`,
                { timeout: 30000 }
            );
        } catch (error) {
            console.error('Failed to redirect after login:', error);
            await page.screenshot({
                path: screenshotPath('error-redirect-timeout'),
                fullPage: true,
            });
            throw error;
        }

        await page.screenshot({
            path: screenshotPath('04-login-successful'),
            fullPage: true,
        });
        console.log('Successfully logged in');

        // Step 6: Verify we're actually logged in by checking for authenticated UI elements
        console.log('Verifying login state...');
        try {
            // Wait for any element that would indicate successful login
            await Promise.race([
                page.waitForSelector('button:has-text("Log out")', {
                    timeout: 5000,
                }),
                page.waitForSelector('button:has-text("Logout")', {
                    timeout: 5000,
                }),
                page.waitForSelector('[data-testid="logout-button"]', {
                    timeout: 5000,
                }),
                page.waitForSelector('[data-testid="user-menu"]', {
                    timeout: 5000,
                }),
                page.waitForSelector('[data-testid="sidebar"]', {
                    timeout: 5000,
                }),
            ]);
        } catch (error) {
            console.warn(
                'Could not find typical authenticated UI elements. Continuing anyway...'
            );
            await page.screenshot({
                path: screenshotPath('warning-no-auth-elements'),
                fullPage: true,
            });
            // Not throwing error here, just warning
        }

        // Step 7: Save the authentication state
        const storageState = path.join(authDir, 'user.json');
        await context.storageState({ path: storageState });

        // Verify that the auth file was created and has content
        if (fs.existsSync(storageState)) {
            const fileContent = fs.readFileSync(storageState, 'utf-8');
            const authData = JSON.parse(fileContent);
            if (!authData.cookies || authData.cookies.length === 0) {
                console.warn('Warning: No cookies found in saved auth state');
            } else {
                console.log(
                    `Authentication state with ${authData.cookies.length} cookies saved to ${storageState}`
                );
            }
        } else {
            console.error(`Failed to save auth state to ${storageState}`);
        }
    } catch (error) {
        console.error('Authentication failed:', error);
        throw error;
    } finally {
        // Close the browser
        await browser.close();
    }
}

export default globalSetup;
