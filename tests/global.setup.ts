// tests/global.setup.ts
import 'dotenv/config'; // Load environment variables from .env file
import { FullConfig } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
// Import shared auth constants and utilities
import {
  AUTH_FILE_PATH,
  ensureAuthDirectoryExists,
  verifyEnvironmentVariables,
  REQUIRED_ENV_VARS
} from './utils/authConstants';

async function globalSetup(config: FullConfig) {
    console.log('Starting global setup: Authenticating user...');

    // Verify environment variables
    const envStatus = verifyEnvironmentVariables();
    if (!envStatus.valid) {
        console.error('====== ENVIRONMENT VARIABLE ERROR ======');
        console.error(envStatus.message);
        console.error(`Required variables: ${REQUIRED_ENV_VARS.join(', ')}`);
        console.error('Please check your .env file or environment configuration');
        console.error('========================================');
        throw new Error(envStatus.message);
    }

    console.log('Environment variables verified successfully.');
    
    // Extract environment variables
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
    const testUserEmail = process.env.PLAYWRIGHT_TEST_USER_EMAIL!;
    const testUserPassword = process.env.PLAYWRIGHT_TEST_USER_PASSWORD!;
    
    // Ensure auth directory exists
    ensureAuthDirectoryExists();

    // 2. Initialize Supabase Client
    const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // 3. Sign in the test user
    console.log(`Attempting to sign in as ${testUserEmail}...`);
    const { data, error } = await supabase.auth.signInWithPassword({
        email: testUserEmail,
        password: testUserPassword,
    });

    // Log authentication result without sensitive data
    if (error) {
        console.log('Supabase signInWithPassword failed');
    } else {
        console.log('Supabase signInWithPassword succeeded');
        console.log('Session exists:', !!data?.session);
        console.log('User ID:', data?.user?.id);
    }

    if (error) {
        console.error('Supabase sign-in error:', error.message);
        throw new Error(`Failed to sign in to Supabase: ${error.message}`);
    }

    if (!data.session) {
        console.error('Supabase sign-in did not return a session.');
        throw new Error(
            'Failed to obtain session from Supabase after sign-in.'
        );
    }

    console.log('Successfully signed in to Supabase.');

    // 4. Save the authentication state (session) to a file
    // Auth directory is ensured to exist already through ensureAuthDirectoryExists()

    // The session object contains tokens and user info.
    // Playwright's storageState expects an object with 'cookies' and 'origins'.
    // Supabase's session is typically stored in localStorage.
    // We need to adapt this to what Playwright expects or use Playwright's ability
    // to set localStorage directly in the context.
    // For simplicity in this step, we'll save the raw session.
    // In a later step (or if Playwright's storageState needs a specific format),
    // we might need to transform this or use page.context().storageState().

    // For now, let's save the session which Playwright can use to populate localStorage.
    // Playwright's `storageState` can directly consume an object that includes
    // localStorage entries. The Supabase client typically stores its session under a key like
    // `sb-${project-ref}-auth-token`.

    const supabaseSessionKey = `sb-${
        new URL(supabaseUrl).hostname.split('.')[0]
    }-auth-token`;

    const appBaseUrl = config.projects[0]?.use?.baseURL;
    const dynamicOrigins = [
        {
            origin: new URL(supabaseUrl).origin, // Ensure it's just the origin for Supabase
            localStorage: [
                {
                    name: supabaseSessionKey,
                    value: JSON.stringify(data.session),
                },
            ],
        },
    ];

    if (appBaseUrl) {
        const appOrigin = new URL(appBaseUrl).origin;
        // Add app origin only if it's different from Supabase origin to avoid redundancy
        if (appOrigin !== new URL(supabaseUrl).origin) {
            dynamicOrigins.push({
                origin: appOrigin, // Your application's origin
                localStorage: [
                    {
                        name: supabaseSessionKey, // App reads the same Supabase session key
                        value: JSON.stringify(data.session),
                    },
                ],
            });
            console.log(
                `Also setting localStorage for app origin: ${appOrigin}`
            );
        } else {
            console.log(
                `App origin (${appOrigin}) is the same as Supabase origin. Not adding duplicate localStorage entry.`
            );
        }
    } else {
        console.warn(
            'Could not determine app base URL from Playwright config to set localStorage for app origin.'
        );
    }

    const storageState = {
        cookies: [], // Supabase JS client primarily uses localStorage
        origins: dynamicOrigins,
    };

    fs.writeFileSync(AUTH_FILE_PATH, JSON.stringify(storageState, null, 2));
    console.log(`Authentication state saved to ${AUTH_FILE_PATH}`);

    // Optionally, set environment variables that can be picked up by playwright.config.ts
    // process.env.PLAYWRIGHT_AUTH_STATE_PATH = AUTH_FILE_PATH;
}

export default globalSetup;
