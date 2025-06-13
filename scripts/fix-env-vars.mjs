#!/usr/bin/env node

/**
 * Environment Variable Alignment Script
 * 
 * This script ensures that both prefixed (VITE_) and non-prefixed versions of
 * Supabase environment variables exist in the .env file for compatibility
 * between the main application and Playwright tests.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM context
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const envPath = path.join(rootDir, '.env');

console.log('🔍 Checking environment variables for Playwright test compatibility...');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found! Please create one first.');
  process.exit(1);
}

// Read the .env file
let envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
const envVars = {};

// Parse current environment variables
envLines.forEach(line => {
  const line_trimmed = line.trim();
  if (line_trimmed && !line_trimmed.startsWith('#')) {
    const match = line_trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      envVars[key] = value;
    }
  }
});

// Define variable pairs to ensure exist
const variablePairs = [
  ['SUPABASE_URL', 'VITE_SUPABASE_URL'],
  ['SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY'],
];

// Check for missing test user variables
const requiredTestVars = [
  'PLAYWRIGHT_TEST_USER_EMAIL',
  'PLAYWRIGHT_TEST_USER_PASSWORD'
];

console.log('\n📋 Environment Variable Check:');

// Track if changes are needed
let changes = false;
let missingVars = [];

// Check for variable pairs and ensure both formats exist
for (const [nonPrefixed, prefixed] of variablePairs) {
  // Both variables exist - check if they're the same
  if (envVars[nonPrefixed] && envVars[prefixed]) {
    if (envVars[nonPrefixed] !== envVars[prefixed]) {
      console.log(`⚠️ Warning: ${nonPrefixed} and ${prefixed} have different values`);
      console.log(`   ${nonPrefixed}=${envVars[nonPrefixed]}`);
      console.log(`   ${prefixed}=${envVars[prefixed]}`);
    } else {
      console.log(`✅ Both ${nonPrefixed} and ${prefixed} exist with matching values`);
    }
  }
  // Only non-prefixed exists - add prefixed
  else if (envVars[nonPrefixed] && !envVars[prefixed]) {
    console.log(`⚠️ Adding missing ${prefixed} based on ${nonPrefixed}`);
    envContent += `\n# Added by alignment script\n${prefixed}=${envVars[nonPrefixed]}`;
    changes = true;
  }
  // Only prefixed exists - add non-prefixed
  else if (!envVars[nonPrefixed] && envVars[prefixed]) {
    console.log(`⚠️ Adding missing ${nonPrefixed} based on ${prefixed}`);
    envContent += `\n# Added by alignment script\n${nonPrefixed}=${envVars[prefixed]}`;
    changes = true;
  }
  // Neither exists - add to missing list
  else {
    missingVars.push({ nonPrefixed, prefixed });
  }
}

// Check for required test user variables
for (const varName of requiredTestVars) {
  if (envVars[varName]) {
    console.log(`✅ ${varName} exists`);
  } else {
    console.log(`❌ Required variable ${varName} is missing`);
    missingVars.push({ single: varName });
    changes = true;
  }
}

// Handle missing variables
if (missingVars.length > 0) {
  console.log('\n⚠️ Some required variables are missing. Please add them to your .env file:');
  
  for (const missing of missingVars) {
    if (missing.single) {
      console.log(`${missing.single}=YOUR_VALUE_HERE`);
    } else {
      console.log(`${missing.nonPrefixed}=YOUR_VALUE_HERE`);
      console.log(`${missing.prefixed}=YOUR_VALUE_HERE`);
    }
  }
}

// Write changes if needed
if (changes && missingVars.length === 0) {
  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Updated .env file with missing variables');
} else if (!changes) {
  console.log('\n✅ No changes needed, all required variables exist');
}

console.log('\n📝 Environment variable alignment check complete!');