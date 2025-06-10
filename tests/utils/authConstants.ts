/**
 * Authentication constants and utilities for tests
 * This file provides shared configuration between global setup and test data seeder
 */
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Convert import.meta.url to path for ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path where the authentication state is saved
// This ensures both global setup and test data seeder use the same path
export const AUTH_FILE_PATH = path.join(
  __dirname,
  '..',
  '..',
  'playwright',
  '.auth',
  'user.json'
);

export const AUTH_DIR_PATH = path.dirname(AUTH_FILE_PATH);

// Required environment variables for authentication
export const REQUIRED_ENV_VARS = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'PLAYWRIGHT_TEST_USER_EMAIL',
  'PLAYWRIGHT_TEST_USER_PASSWORD',
];

// Check if auth file exists and is valid JSON
export function checkAuthFile(): { exists: boolean; valid: boolean; message: string } {
  if (!fs.existsSync(AUTH_FILE_PATH)) {
    return {
      exists: false,
      valid: false,
      message: `Authentication state file not found at ${AUTH_FILE_PATH}. Run Playwright global setup first.`,
    };
  }
  
  try {
    const content = fs.readFileSync(AUTH_FILE_PATH, 'utf-8');
    JSON.parse(content); // Test if it's valid JSON
    return {
      exists: true,
      valid: true,
      message: 'Auth file exists and is valid JSON.',
    };
  } catch (error) {
    return {
      exists: true,
      valid: false,
      message: `Authentication file exists but contains invalid JSON: ${error.message}`,
    };
  }
}

// Verify required environment variables and return status
export function verifyEnvironmentVariables(): { 
  valid: boolean; 
  missing: string[]; 
  message: string; 
} {
  const missing = REQUIRED_ENV_VARS.filter(
    varName => !process.env[varName]
  );
  
  if (missing.length > 0) {
    return {
      valid: false,
      missing,
      message: `Missing required environment variables: ${missing.join(', ')}`,
    };
  }
  
  return {
    valid: true,
    missing: [],
    message: 'All required environment variables are present.',
  };
}

// Create auth directory if it doesn't exist
export function ensureAuthDirectoryExists(): void {
  if (!fs.existsSync(AUTH_DIR_PATH)) {
    fs.mkdirSync(AUTH_DIR_PATH, { recursive: true });
  }
}
