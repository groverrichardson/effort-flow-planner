/**
 * URL Verification Utilities
 * 
 * These utilities provide robust URL verification for Playwright tests,
 * handling exact path matching, query parameters, and hash fragments.
 */

/**
 * Options for URL verification
 */
export interface UrlVerificationOptions {
  /**
   * Whether to include query parameters in the verification
   * If true, the query parameters must match exactly
   * If false, query parameters are ignored
   */
  includeQueryParams?: boolean;
  
  /**
   * Whether to include hash fragments in the verification
   * If true, the hash fragment must match exactly
   * If false, hash fragments are ignored
   */
  includeHash?: boolean;
  
  /**
   * Whether the URL must be an exact match (strict mode)
   * In strict mode, the path must match exactly, including trailing slashes
   * In non-strict mode, partial path matching is allowed
   */
  exactMatch?: boolean;
}

/**
 * Verifies if the current URL matches the expected URL
 * 
 * @param currentUrlOrPage - The current URL or Page object to verify
 * @param expectedPath - The expected path to match against
 * @param options - Options for URL verification behavior
 * @returns True if the URL matches the expected path according to options, false otherwise
 */
export function verifyUrl(
  currentUrlOrPage: string | any, // Accept string or Page object
  expectedPath: string,
  options: UrlVerificationOptions = {}
): boolean {
  const {
    includeQueryParams = false,
    includeHash = false,
    exactMatch = true
  } = options;

  try {
    // Handle if currentUrlOrPage is a Playwright Page object
    let currentUrl: string;
    if (typeof currentUrlOrPage === 'string') {
      currentUrl = currentUrlOrPage;
    } else if (currentUrlOrPage && typeof currentUrlOrPage.url === 'function') {
      // It's a Playwright Page object
      currentUrl = currentUrlOrPage.url();
    } else {
      console.error('Invalid currentUrlOrPage parameter:', currentUrlOrPage);
      return false;
    }
    
    // Parse the URLs
    const current = new URL(currentUrl);
    
    // Handle relative URLs for expected path
    let expectedUrl: URL;
    try {
      // Try to parse as absolute URL
      expectedUrl = new URL(expectedPath);
    } catch {
      // If that fails, treat as relative path
      expectedUrl = new URL(expectedPath, current.origin);
    }

    // Special handling for root path
    if (expectedPath === '/' || expectedPath === '') {
      if (exactMatch) {
        // In strict mode, pathname should be exactly '/'
        if (current.pathname !== '/') {
          return false;
        }
      } else {
        // In non-strict mode, pathname should start with '/'
        // This is always true, so we don't need to check
      }
    } else {
      // Normal path matching
      if (exactMatch) {
        // Normalize paths to handle trailing slashes consistently
        const normalizedCurrentPath = current.pathname.endsWith('/') && current.pathname !== '/' 
          ? current.pathname.slice(0, -1) 
          : current.pathname;
        
        const normalizedExpectedPath = expectedUrl.pathname.endsWith('/') && expectedUrl.pathname !== '/' 
          ? expectedUrl.pathname.slice(0, -1) 
          : expectedUrl.pathname;
        
        // In strict mode, paths must match exactly
        if (normalizedCurrentPath !== normalizedExpectedPath) {
          return false;
        }
      } else {
        // In non-strict mode, current path should include expected path
        // But we need to be careful about partial matches (e.g., /tasks vs /tasks-detail)
        // We'll use a regex that ensures we match complete path segments
        const pathRegex = new RegExp(`^${expectedUrl.pathname}(/|$)`);
        if (!pathRegex.test(current.pathname)) {
          return false;
        }
      }
    }

    // Query parameter verification
    if (includeQueryParams) {
      const currentSearchParams = current.searchParams;
      const expectedSearchParams = expectedUrl.searchParams;
      
      // Check if all expected query parameters exist with the same values
      for (const [key, value] of expectedSearchParams.entries()) {
        if (currentSearchParams.get(key) !== value) {
          return false;
        }
      }
      
      // In strict mode, ensure there are no additional parameters
      if (exactMatch) {
        if (currentSearchParams.size !== expectedSearchParams.size) {
          return false;
        }
      }
    }

    // Hash fragment verification
    if (includeHash && current.hash !== expectedUrl.hash) {
      return false;
    }

    // If we made it here, all checks passed
    return true;
  } catch (error) {
    console.error('Error verifying URL:', error);
    return false;
  }
}

/**
 * Helper function to wait for navigation to a specific URL
 * 
 * @param page - Playwright page object
 * @param expectedPath - The path to wait for
 * @param options - URL verification options
 * @param timeoutMs - Timeout in milliseconds
 * @returns Promise that resolves when navigation is complete
 */
export async function waitForUrlMatch(
  page: any,
  expectedPath: string,
  options: UrlVerificationOptions = {},
  timeoutMs: number = 5000
): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    if (verifyUrl(page, expectedPath, options)) {
      return true;
    }
    
    // Wait a bit before checking again
    await page.waitForTimeout(100);
  }
  
  // If we get here, the timeout was exceeded
  return false;
}

/**
 * Verify navigation was successful and throw a descriptive error if not
 * 
 * @param page - Playwright page object
 * @param expectedPath - The expected path after navigation
 * @param options - URL verification options
 * @returns Promise that resolves if navigation was successful, rejects otherwise
 */
export async function verifyNavigation(
  page: any,
  expectedPath: string,
  options: UrlVerificationOptions = {}
): Promise<void> {
  const currentUrl = page.url();
  
  if (!verifyUrl(currentUrl, expectedPath, options)) {
    await page.screenshot({ path: `navigation-failed-${Date.now()}.png` });
    throw new Error(`Navigation failed: Expected to be on "${expectedPath}" but got "${currentUrl}"`);
  }
}
