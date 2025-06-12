/**
 * Authentication file helper functions
 * Provides utilities for reading, validating, and repairing auth files
 */
import fs from 'fs';
import { AUTH_FILE_PATH } from './authConstants';

/**
 * Safely reads and validates the auth file
 * Includes repair attempts for common issues
 */
export function safeReadAuthFile(authFilePath: string = AUTH_FILE_PATH): { 
  data: any; 
  success: boolean;
  message: string;
  wasRepaired: boolean;
} {
  try {
    if (!fs.existsSync(authFilePath)) {
      return {
        data: null,
        success: false,
        message: `Auth file does not exist at ${authFilePath}`,
        wasRepaired: false
      };
    }

    // Read the file content
    const content = fs.readFileSync(authFilePath, 'utf-8');
    
    // First try to parse as-is
    try {
      const data = JSON.parse(content);
      return {
        data,
        success: true,
        message: 'Auth file parsed successfully',
        wasRepaired: false
      };
    } catch (parseError) {
      // If parsing failed, try to repair common issues
      console.log(`Auth file parsing failed, attempting repair: ${parseError.message}`);
      
      // Try to repair the file
      const repaired = repairAuthFile(content, authFilePath);
      
      if (repaired.success) {
        // Try parsing the repaired content
        try {
          const data = JSON.parse(repaired.content);
          return {
            data,
            success: true,
            message: `Auth file was repaired: ${repaired.message}`,
            wasRepaired: true
          };
        } catch (secondParseError) {
          return {
            data: null,
            success: false,
            message: `Auth file repair attempt failed: ${secondParseError.message}`,
            wasRepaired: true
          };
        }
      } else {
        return {
          data: null,
          success: false,
          message: `Auth file could not be repaired: ${repaired.message}`,
          wasRepaired: false
        };
      }
    }
  } catch (fsError) {
    return {
      data: null,
      success: false,
      message: `File system error: ${fsError.message}`,
      wasRepaired: false
    };
  }
}

/**
 * Attempts to repair common auth file issues
 */
function repairAuthFile(content: string, authFilePath: string): { 
  success: boolean; 
  message: string;
  content: string;
} {
  // Check if the file starts with unexpected characters like 'P'
  if (content.trim().startsWith('P')) {
    // This might be a "Promise" string or other invalid JSON
    console.log('Auth file appears to contain invalid content (starts with P)');
    
    // Create a minimal valid auth state object
    const minimalAuthState = {
      cookies: [],
      origins: []
    };
    
    // Write the repaired file
    try {
      fs.writeFileSync(authFilePath, JSON.stringify(minimalAuthState, null, 2));
      console.log('Auth file repaired with minimal valid structure');
      
      return {
        success: true,
        message: 'Created minimal valid auth structure',
        content: JSON.stringify(minimalAuthState)
      };
    } catch (writeError) {
      return {
        success: false,
        message: `Failed to write repaired auth file: ${writeError.message}`,
        content: content
      };
    }
  }
  
  // Add more repair strategies here as needed
  
  return {
    success: false,
    message: 'No applicable repair strategy found',
    content: content
  };
}

/**
 * Validates an auth file and returns clean
 * @returns True if auth file exists and is valid
 */
export function validateAuthFile(authFilePath: string = AUTH_FILE_PATH): boolean {
  const result = safeReadAuthFile(authFilePath);
  return result.success;
}

/**
 * Creates a minimal valid auth file if one doesn't exist
 */
export function ensureMinimalAuthFile(authFilePath: string = AUTH_FILE_PATH): boolean {
  if (!fs.existsSync(authFilePath)) {
    const dir = authFilePath.substring(0, authFilePath.lastIndexOf('/'));
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Create minimal auth file
    const minimalAuthState = {
      cookies: [],
      origins: []
    };
    
    try {
      fs.writeFileSync(authFilePath, JSON.stringify(minimalAuthState, null, 2));
      return true;
    } catch (error) {
      console.error(`Failed to create minimal auth file: ${error.message}`);
      return false;
    }
  }
  
  return validateAuthFile(authFilePath);
}
