/**
 * Navigation Helper Utilities
 *
 * This file provides robust navigation functions with verification and retries
 * to ensure stable end-to-end tests using route configuration objects.
 */

import { Page } from '@playwright/test';
import {
    verifyUrl,
    waitForUrlMatch,
    verifyNavigation,
} from './urlVerification';
import { getRouteById, getRouteByPath, RouteConfig } from './routeConfig';
import {
    verifyRouteElements,
    waitForRouteReady,
    ElementVerificationResult,
    ElementVerificationOptions,
} from './routeElementVerifier';

/**
 * Navigation result object returned by navigation functions
 */
export interface NavigationResult {
    /** Whether navigation was successful */
    success: boolean;

    /** The target route that was navigated to (ID or path) */
    targetRoute: string;

    /** Route configuration object used */
    routeConfig?: RouteConfig;

    /** The actual URL after navigation */
    actualUrl: string;

    /** Whether the URL was verified to match the expected route */
    urlVerified: boolean;

    /** Whether the page elements were verified */
    elementsVerified: boolean;

    /** Details about element verification */
    elementDetails?: {
        /** Elements that were successfully found */
        found: string[];

        /** Optional elements that were not found */
        notFound: string[];

        /** Required elements that were not found */
        missing?: string[];
    };

    /** Error message if navigation failed */
    errorMessage?: string;

    /** Path to screenshot if one was taken */
    screenshotPath?: string;

    /** Timestamp when navigation completed */
    timestamp: number;

    /** Duration in milliseconds that navigation took */
    duration: number;
}

/**
 * Options for navigation functions
 */
export interface NavigationOptions {
    /** Maximum number of retries if navigation fails */
    maxRetries?: number;

    /** Timeout for navigation in milliseconds */
    timeout?: number;

    /** Whether to throw an error if navigation fails */
    throwOnFailure?: boolean;

    /** Options for route element verification */
    verificationOptions?: ElementVerificationOptions;

    /** Whether to log detailed navigation steps */
    verifyElements?: boolean;

    /** Whether to print detailed logs */
    verbose?: boolean;
}

/**
 * Navigate to a route with comprehensive verification
 *
 * @param page Playwright page object
 * @param routeIdOrPath Route ID or path to navigate to
 * @param options Navigation options
 * @returns Navigation result
 */
export async function navigateWithVerification(
    page: Page,
    routeIdOrPath: string,
    options: NavigationOptions = {}
): Promise<NavigationResult> {
    const {
        maxRetries = 2,
        timeout = 10000,
        throwOnFailure = true,
        verificationOptions = {},
        screenshotOnFailure = true,
        verifyUrl: shouldVerifyUrl = true,
        verifyElements: shouldVerifyElements = true,
        verbose = true,
    } = options;

    const result: NavigationResult = {
        success: false,
        route,
        finalUrl: '',
        urlVerified: false,
        elementsVerified: false,
    };

    const screenshotPath = `navigation-failed-${routeIdOrPath.replace(
        /\//g,
        '_'
    )}-${Date.now()}.png`;

    if (verbose) {
        console.log(`🚀 Navigating to route: ${routeIdOrPath}`);
    }

    let lastError: Error | null = null;
    let attempt = 0;

    // Retry logic for navigation
    while (attempt <= maxRetries) {
        try {
            if (attempt > 0 && verbose) {
                console.log(
                    `⟳ Retry attempt ${attempt} of ${maxRetries} for route: ${route}`
                );
            }

            // Navigate to the route
            await page.goto(route, { timeout });

            // Basic page load waiting
            await page.waitForLoadState('domcontentloaded', { timeout });
            try {
                await page.waitForLoadState('networkidle', { timeout: 3000 });
            } catch (networkError) {
                if (verbose) {
                    console.log(
                        `⚠️ Network did not reach idle state: ${networkError.message}`
                    );
                }
                // Continue anyway
            }

            // Get the final URL after navigation
            result.finalUrl = page.url();

            // Verify URL
            result.urlVerified =
                !shouldVerifyUrl || verifyUrl(result.finalUrl, route);

            if (shouldVerifyUrl && !result.urlVerified) {
                if (verbose) {
                    console.log(
                        `⚠️ URL verification failed. Expected: ${route}, Actual: ${result.finalUrl}`
                    );
                }

                // Check if we're on login page and need authentication
                const isOnLoginPage = verifyUrl(result.finalUrl, '/login', {
                    exactMatch: false,
                });
                if (route !== '/login' && isOnLoginPage) {
                    if (verbose) {
                        console.log(
                            '🔑 Detected redirect to login page. Authentication required.'
                        );
                    }

                    // Authentication should be handled by the caller
                    throw new Error('Authentication required');
                }

                throw new Error(
                    `URL verification failed. Expected: ${route}, Got: ${result.finalUrl}`
                );
            }

            // Verify route elements if specified
            if (shouldVerifyElements) {
                try {
                    const elementVerification = await verifyRouteElements(
                        page,
                        route,
                        {
                            ...verificationOptions,
                            throwOnFailure: false,
                            verbose,
                        }
                    );

                    result.elementsVerified = elementVerification.success;
                    result.elementDetails = elementVerification.details;

                    if (!result.elementsVerified) {
                        if (verbose) {
                            console.log(
                                `⚠️ Element verification failed: ${elementVerification.errorMessage}`
                            );
                        }
                        throw new Error(
                            elementVerification.errorMessage ||
                                'Element verification failed'
                        );
                    }
                } catch (elementError) {
                    if (verbose) {
                        console.log(
                            `❌ Error during element verification: ${elementError.message}`
                        );
                    }
                    throw elementError;
                }
            } else {
                result.elementsVerified = true;
            }

            // If we made it here, navigation was successful
            result.success = true;

            if (verbose) {
                console.log(`✅ Successfully navigated to ${route}`);
                if (shouldVerifyElements && result.elementDetails) {
                    console.log(
                        `📋 Found elements: ${result.elementDetails.found.join(
                            ', '
                        )}`
                    );
                    if (result.elementDetails.notFound.length > 0) {
                        console.log(
                            `⚠️ Optional elements not found: ${result.elementDetails.notFound.join(
                                ', '
                            )}`
                        );
                    }
                }
            }

            return result;
        } catch (error) {
            lastError = error;

            // Log the error but continue with retry if we have attempts left
            if (verbose) {
                console.log(
                    `❌ Navigation attempt ${attempt + 1} failed: ${
                        error.message
                    }`
                );
            }

            // Increment attempt counter
            attempt++;

            // If we have attempts left, wait a bit before retrying
            if (attempt <= maxRetries) {
                const retryDelay = 1000 * attempt; // Increase delay with each retry
                if (verbose) {
                    console.log(`⏱️ Waiting ${retryDelay}ms before retry...`);
                }
                await page.waitForTimeout(retryDelay);
            }
        }
    }

    // If we get here, all attempts failed
    result.success = false;
    result.errorMessage = lastError
        ? lastError.message
        : 'Navigation failed for unknown reason';

    if (screenshotOnFailure) {
        try {
            await page.screenshot({ path: screenshotPath });
            result.screenshotPath = screenshotPath;
            if (verbose) {
                console.log(
                    `📸 Failure screenshot saved to: ${screenshotPath}`
                );
            }
        } catch (screenshotError) {
            if (verbose) {
                console.error(
                    `Failed to take screenshot: ${screenshotError.message}`
                );
            }
        }
    }

    if (throwOnFailure && lastError) {
        throw new Error(
            `Navigation to ${route} failed after ${maxRetries + 1} attempts: ${
                lastError.message
            }`
        );
    }

    return result;
}

/**
 * Handle authentication during navigation when needed
 *
 * @param page - Playwright page object
 * @param authenticateFn - Function to perform authentication
 * @returns Promise resolving when authentication is complete
 */
export async function handleAuthentication(
    page: Page,
    authenticateFn: (page: Page) => Promise<void>,
    verbose = true
): Promise<void> {
    if (verbose) {
        console.log('🔑 Performing authentication...');
    }

    try {
        await authenticateFn(page);
        if (verbose) {
            console.log('✅ Authentication successful');
        }
    } catch (authError) {
        if (verbose) {
            console.error(`❌ Authentication failed: ${authError.message}`);
        }
        throw new Error(`Authentication failed: ${authError.message}`);
    }
}

/**
 * Integrated navigation helper that handles authentication when needed
 *
 * @param page - Playwright page object
 * @param route - The route to navigate to
 * @param authenticateFn - Function to perform authentication
 * @param options - Navigation options
 * @returns Promise resolving to navigation result
 */
export async function navigateTo(
    page: Page,
    route: string,
    authenticateFn: (page: Page) => Promise<void>,
    options: NavigationOptions = {}
): Promise<NavigationResult> {
    const { verbose = true } = options;

    // First navigation attempt
    try {
        const result = await navigateWithVerification(page, route, options);
        return result;
    } catch (error) {
        // Check if authentication is required
        if (error.message.includes('Authentication required')) {
            if (verbose) {
                console.log('🔒 Authentication required, performing login...');
            }

            // Perform authentication
            await handleAuthentication(page, authenticateFn, verbose);

            // Try navigation again after authentication
            try {
                if (verbose) {
                    console.log(
                        `🔄 Retrying navigation to ${route} after authentication`
                    );
                }
                const result = await navigateWithVerification(
                    page,
                    route,
                    options
                );
                return result;
            } catch (retryError) {
                if (verbose) {
                    console.error(
                        `❌ Navigation failed after authentication: ${retryError.message}`
                    );
                }

                if (options.throwOnFailure !== false) {
                    throw new Error(
                        `Navigation failed after authentication: ${retryError.message}`
                    );
                }

                return {
                    success: false,
                    route,
                    finalUrl: page.url(),
                    urlVerified: false,
                    elementsVerified: false,
                    errorMessage: `Navigation failed after authentication: ${retryError.message}`,
                };
            }
        } else {
            // For other errors, propagate them
            if (verbose) {
                console.error(`❌ Navigation failed: ${error.message}`);
            }

            if (options.throwOnFailure !== false) {
                throw error;
            }

            return {
                success: false,
                route,
                finalUrl: page.url(),
                urlVerified: false,
                elementsVerified: false,
                errorMessage: error.message,
            };
        }
    }
}
