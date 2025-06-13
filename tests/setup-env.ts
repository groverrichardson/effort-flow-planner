import * as path from 'path';
import * as fs from 'fs';
import { config } from 'dotenv';

/**
 * Setup Environment Variables for Testing
 * 
 * This helper ensures environment variables are loaded properly for tests.
 * It loads from .env file if available and provides clear error messages
 * when required variables are missing.
 */

// Try to load from .env file
function loadEnvVariables() {
  // Path to .env file
  const envPath = path.resolve(process.cwd(), '.env');
  
  // Check if file exists
  if (fs.existsSync(envPath)) {
    console.log('Loading environment variables from .env file');
    config({ path: envPath });
  } else {
    console.log('No .env file found, using existing environment variables');
  }
  
  // Verify required variables are set
  const requiredVariables = [
    'SUPABASE_URL', 'VITE_SUPABASE_URL',
    'SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY',
    'PLAYWRIGHT_TEST_USER_EMAIL',
    'PLAYWRIGHT_TEST_USER_PASSWORD'
  ];
  
  // Check for missing variables
  const missing = requiredVariables.filter(variable => !process.env[variable]);
  
  // Set Supabase variables if only one format is available
  if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
    process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
    console.log('Copied VITE_SUPABASE_URL to SUPABASE_URL');
  }
  
  if (!process.env.VITE_SUPABASE_URL && process.env.SUPABASE_URL) {
    process.env.VITE_SUPABASE_URL = process.env.SUPABASE_URL;
    console.log('Copied SUPABASE_URL to VITE_SUPABASE_URL');
  }
  
  if (!process.env.SUPABASE_ANON_KEY && process.env.VITE_SUPABASE_ANON_KEY) {
    process.env.SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
    console.log('Copied VITE_SUPABASE_ANON_KEY to SUPABASE_ANON_KEY');
  }
  
  if (!process.env.VITE_SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY) {
    process.env.VITE_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    console.log('Copied SUPABASE_ANON_KEY to VITE_SUPABASE_ANON_KEY');
  }
  
  // Re-check after potential copies
  const stillMissing = requiredVariables.filter(variable => !process.env[variable]);
  
  if (stillMissing.length > 0) {
    console.warn(`⚠️ Missing required environment variables: ${stillMissing.join(', ')}`);
    console.warn('Please create a .env file with these variables or set them in your environment');
    console.warn('See .env.example for reference');
    
    // Critical auth variables check
    const missingAuth = ['PLAYWRIGHT_TEST_USER_EMAIL', 'PLAYWRIGHT_TEST_USER_PASSWORD']
      .filter(v => !process.env[v]);
      
    if (missingAuth.length > 0) {
      console.error('❌ Critical authentication credentials missing. Tests will fail.');
    }
  } else {
    console.log('✅ All required environment variables are set');
  }
}

// Export the function to be called from tests or setup scripts
export { loadEnvVariables };
