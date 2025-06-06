import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Mock for hasPointerCapture, releasePointerCapture, and scrollIntoView for Radix UI components in JSDOM
if (typeof window !== 'undefined') {
  if (!window.HTMLElement.prototype.scrollIntoView) {
    window.HTMLElement.prototype.scrollIntoView = function() {
      // Mock implementation, can be empty if no specific behavior is needed for the tests.
    };
  }

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    observe() {
        // do nothing
    }
    unobserve() {
        // do nothing
    }
    disconnect() {
        // do nothing
    }
  };

  if (!window.HTMLElement.prototype.hasPointerCapture) {
    window.HTMLElement.prototype.hasPointerCapture = function(_pointerId) {
      // For Radix, it often expects this to be a function that exists.
      // You might need to return a specific value based on Radix's internal checks,
      // but often just ensuring the function exists and returns false is enough.
      return false;
    };
  }

  if (!window.HTMLElement.prototype.releasePointerCapture) {
    window.HTMLElement.prototype.releasePointerCapture = function(_pointerId) {
      // Mock implementation, can be empty if no specific behavior is needed for the tests.
    };
  }
}

// Clean up after each test case
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia for JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});
