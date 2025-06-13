# Testing Guidelines and Requirements

## Screenshot Requirements

**CRITICAL REQUIREMENT:** Screenshots must be generated for ALL tests, both passing and failing. This is a non-negotiable requirement and must be maintained in all configurations.

## Why Screenshots Matter

1. **Documentation:** Screenshots provide visual documentation of the application's state during tests
2. **Regression Detection:** They help identify visual regressions that may not be caught by code-level assertions
3. **Debugging Aid:** They significantly help with debugging by showing the exact state when a test fails
4. **User Experience Verification:** They help ensure the UI is rendering correctly

## Configuration Requirements

The following configuration settings MUST be maintained:

### 1. In `playwright.config.ts`:
```typescript
// ⚠️ CRITICAL REQUIREMENT: Always take screenshots for ALL tests ⚠️
screenshot: 'on', // Must remain 'on' - DO NOT change to 'only-on-failure'
```

### 2. In test runner scripts:
- Always include the `--update-snapshots` flag when running tests
- Ensure the Playwright configuration is respected

## Test Runner Usage

When running UI tests, use one of the following commands:

```bash
# For running tests and updating snapshots
npm run test:ui:fixed:update

# For running tests against existing snapshots
npm run test:ui:fixed
```

## Accessing Screenshots

Screenshots are saved in two locations:

1. **Baseline snapshots:** `/tests/ui.spec.ts-snapshots/` - Reference images for comparison
2. **Test run screenshots:** `/test-results/screenshots/` - Actual screenshots and diffs from the latest run
3. **HTML report:** View all screenshots via `npx playwright show-report test-results/html-report --host localhost --port 9323`

## Maintaining the Test Environment

For reliable snapshot tests:

1. Always run the tests with the fixed test runner script to ensure the dev server and Playwright are properly synchronized
2. Do not modify the screenshot or snapshot configuration in the Playwright config
3. If visual changes are intentional, use the update flag to refresh snapshots
4. Review all screenshots after test runs, even for passing tests

## Port Configuration

The test infrastructure is designed to use dynamic ports to avoid conflicts:

1. The fixed test runner automatically finds an available port
2. It sets the correct environment variables (`BASE_URL`, `PORT`, etc.)
3. It ensures the dev server is running on the same port that Playwright uses for testing
4. It skips Playwright's built-in web server to avoid port conflicts

**DO NOT hardcode ports in test files or test helpers.** Always use the baseURL provided by Playwright.
