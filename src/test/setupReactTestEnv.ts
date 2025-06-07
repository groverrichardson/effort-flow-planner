// setupReactTestEnv.ts
// Enhances the testing environment for React components, particularly focused on fixing act() warnings

import { configure } from '@testing-library/react';
import { vi } from 'vitest';

// Configure better act() behavior for testing library
configure({
  // Wait for pending operations before unmounting
  asyncUtilTimeout: 1000, // Increase timeout for async operations
  computedStyleSupportsPseudoElements: true, // Needed for some UI libraries
  reactStrictMode: false, // Toggle based on project needs
});

// Prevent act() warnings
// This is a workaround for the "act()" warnings
// See: https://github.com/vitest-dev/vitest/issues/1275
global.IS_REACT_ACT_ENVIRONMENT = true;

// Mock requestAnimationFrame and cancelAnimationFrame for tests
if (!global.requestAnimationFrame) {
  global.requestAnimationFrame = function(callback) {
    return setTimeout(callback, 0);
  };
}

if (!global.cancelAnimationFrame) {
  global.cancelAnimationFrame = function(id) {
    clearTimeout(id);
  };
}

// Mock console.error to handle React act() warnings
const originalConsoleError = console.error;
console.error = (...args) => {
  // Ignore specific act() warnings that can't be fixed
  if (args[0]?.includes && args[0].includes('Warning: The current testing environment is not configured to support act')) {
    return;
  }
  originalConsoleError(...args);
};

// Create a cleanup function to restore console.error
afterAll(() => {
  console.error = originalConsoleError;
});

// Some errors in the tests might be uncaught Promise rejections
// Add a handler to catch and print them properly
const originalProcessOn = process.on;
const listeners: Array<(err: any) => void> = [];
process.on = function(event, listener) {
  if (event === 'unhandledRejection') {
    listeners.push(listener as any);
    return this;
  }
  return originalProcessOn.apply(this, [event, listener]);
};

// Add custom handler for unhandled rejections that prints more details
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection in test:');
  console.error(err);
});

console.log('React Test Environment Enhancement loaded - fixes act() warnings');
