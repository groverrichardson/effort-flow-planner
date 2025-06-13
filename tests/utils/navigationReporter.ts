/**
 * Navigation Reporter
 * 
 * This utility collects data about navigation attempts and generates reports
 * to provide insights into navigation reliability and failures.
 */

import { NavigationResult } from './navigationHelperNew';
import { RouteConfig } from './routeConfig';

/**
 * Represents a single recorded navigation event.
 */
export interface NavigationEvent extends NavigationResult {
  testName?: string; // Name of the test case, if available
  timestamp: number; // Overrides NavigationResult's timestamp for clarity
}

/**
 * Stores and processes navigation events to generate reports.
 */
class NavigationReporter {
  private static instance: NavigationReporter;
  private navigationEvents: NavigationEvent[] = [];

  private constructor() {}

  /**
   * Gets the singleton instance of the NavigationReporter.
   */
  public static getInstance(): NavigationReporter {
    if (!NavigationReporter.instance) {
      NavigationReporter.instance = new NavigationReporter();
    }
    return NavigationReporter.instance;
  }

  /**
   * Logs a navigation event.
   * @param result The result of a navigation attempt.
   * @param testName Optional name of the test case.
   */
  public logNavigation(result: NavigationResult, testName?: string): void {
    const event: NavigationEvent = {
      ...result,
      testName,
      timestamp: Date.now(), // Use current timestamp for the event log
    };
    this.navigationEvents.push(event);

    // Detailed console reporting for this specific navigation event
    this.printEventDetails(event);
  }

  /**
   * Prints detailed information about a single navigation event to the console.
   * @param event The navigation event to print.
   */
  private printEventDetails(event: NavigationEvent): void {
    const routeName = event.routeConfig?.title || event.targetRoute;
    const status = event.success ? '✅ SUCCESS' : '❌ FAILED';

    console.log(`\n--- Navigation Event ---`);
    if (event.testName) {
      console.log(`Test: ${event.testName}`);
    }
    console.log(`Route: ${routeName}`);
    console.log(`Status: ${status}`);
    console.log(`Target URL: ${event.routeConfig?.path || event.targetRoute}`);
    console.log(`Actual URL: ${event.actualUrl}`);
    console.log(`URL Verified: ${event.urlVerified ? '✔️' : '✖️'}`);
    console.log(`Elements Verified: ${event.elementsVerified ? '✔️' : '✖️'}`);
    if (event.elementDetails) {
      console.log(`  Elements Found: ${event.elementDetails.found.length > 0 ? event.elementDetails.found.join(', ') : 'None'}`);
      if (event.elementDetails.notFound.length > 0) {
        console.log(`  Optional Elements Not Found: ${event.elementDetails.notFound.join(', ')}`);
      }
      if (event.elementDetails.missing && event.elementDetails.missing.length > 0) {
        console.log(`  Required Elements Missing: ${event.elementDetails.missing.join(', ')}`);
      }
    }
    console.log(`Duration: ${event.duration}ms`);
    if (!event.success && event.errorMessage) {
      console.error(`Error: ${event.errorMessage}`);
    }
    if (event.screenshotPath) {
      console.log(`Screenshot: ${event.screenshotPath}`);
    }
    console.log(`------------------------\n`);
  }

  /**
   * Generates a summary report of all navigation events.
   * This can be called at the end of a test suite.
   */
  public generateReport(): void {
    if (this.navigationEvents.length === 0) {
      console.log('\n====== Navigation Summary ======\n');
      console.log('No navigation events recorded.');
      console.log('\n==============================\n');
      return;
    }

    const totalNavigations = this.navigationEvents.length;
    const successfulNavigations = this.navigationEvents.filter(event => event.success).length;
    const failedNavigations = totalNavigations - successfulNavigations;
    const successRate = totalNavigations > 0 ? (successfulNavigations / totalNavigations) * 100 : 0;

    console.log('\n====== Navigation Summary ======\n');
    console.log(`Total Navigations: ${totalNavigations}`);
    console.log(`Successful: ${successfulNavigations}`);
    console.log(`Failed: ${failedNavigations}`);
    console.log(`Success Rate: ${successRate.toFixed(2)}%`);

    if (failedNavigations > 0) {
      console.log('\n--- Failed Navigations ---');
      this.navigationEvents.forEach((event, index) => {
        if (!event.success) {
          const routeName = event.routeConfig?.title || event.targetRoute;
          console.log(
            `${index + 1}. Test: ${event.testName || 'N/A'} | Route: ${routeName} | Error: ${event.errorMessage || 'Unknown'}${event.screenshotPath ? ' | Screenshot: ' + event.screenshotPath : ''}`
          );
        }
      });
    }
    console.log('\n==============================\n');
  }

  /**
   * Clears all recorded navigation events.
   * Useful for resetting between test runs if the reporter instance is reused.
   */
  public clearEvents(): void {
    this.navigationEvents = [];
  }
}

// Export a singleton instance
export const navigationReporter = NavigationReporter.getInstance();
