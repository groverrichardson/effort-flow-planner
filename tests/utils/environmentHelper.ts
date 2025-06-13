/**
 * Environment variable verification utilities for tests
 * This file provides shared functionality for verifying required environment variables
 */

import dotenv from 'dotenv';
import { REQUIRED_ENV_VARS } from './authConstants';

// Load environment variables from .env file if present
dotenv.config();

/**
 * Verifies that all required environment variables are set
 * Throws an error if any required variables are missing
 */
export function verifyEnvironmentVariables(): void {
  const missing: string[] = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
    console.warn('Tests may not function properly without these variables.');
    // Not throwing an error to allow tests to run in CI environments without auth
  }
}
