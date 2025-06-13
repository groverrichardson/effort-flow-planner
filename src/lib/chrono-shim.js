// This is a minimal shim for chrono-node to satisfy imports
// while avoiding the ENOENT errors from the missing dist directory

// Export a basic parser function that does nothing but won't crash
export const parse = () => {
  console.warn('Using chrono-node shim instead of actual implementation');
  return [];
};

// Export an object with the same structure as chrono-node
export default {
  parse,
  parseDate: () => new Date(),
  casual: { parse },
  strict: { parse },
};
