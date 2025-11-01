import updatedFetch from './fetch';

// Augment the global namespace to properly type the fetch override
declare global {
  var fetch: typeof updatedFetch;
}

// Override global fetch with our custom implementation
global.fetch = updatedFetch;
