# Testing Documentation for Effort Flow Planner

This project uses multiple testing frameworks for different types of tests:
- **Vitest** - Unit tests (`.test.ts` files)
- **Playwright** - UI and integration tests (`.spec.ts` files)

## Test Commands

### Unit Tests (Vitest)
```bash
# Run all unit tests once
npm run test

# Run unit tests in watch mode
npm run test:unit
```

### UI Tests (Playwright)
```bash
# Run all UI tests
npm run test:ui

# Run UI tests in headed mode (visible browser)
npm run test:ui:headed

# Run UI tests in watch mode
npm run test:ui:watch

# Run UI tests and update screenshots
npm run test:ui:update

# Run a specific UI test (provide test name pattern)
npm run test:ui:single "test name pattern"

# Debug UI tests
npm run test:ui:debug
```

## Test Utilities

### Task Seeder
The project includes a robust task seeding system for creating test data. See [TASK_SEEDER.md](./utils/TASK_SEEDER.md) for detailed documentation.

### Port Management
Tests automatically manage Playwright HTML reporter ports to prevent conflicts:
- `setupPort.js` - Dynamically assigns available ports
- `cleanupUtility.mjs` - Releases ports after tests complete
- Global teardown ensures proper resource cleanup

## File Naming Conventions

- **Unit Tests**: `*.test.ts` - For Vitest framework
- **UI Tests**: `*.spec.ts` - For Playwright framework

**Important:** Do not mix test frameworks. Use the appropriate command for the type of test you're running.

## Known Issues

### Vitest Environment Variables
Some unit tests (`.test.ts` files) require Supabase environment variables to run properly:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

If you run into errors like "Supabase URL and Anon Key must be provided in environment variables", make sure these are set in your environment or `.env` file before running unit tests.

### Screenshot Differences
Playwright visual testing may show small pixel differences (1% or less) that are normal due to rendering variations. Use the update snapshots command to refresh baseline images:
```bash
npm run test:ui:update
```
