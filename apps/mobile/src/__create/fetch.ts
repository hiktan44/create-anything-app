import * as SecureStore from 'expo-secure-store';
import { fetch as expoFetch } from 'expo/fetch';

const authKey = `${process.env.EXPO_PUBLIC_PROJECT_GROUP_ID}-jwt`;

// Token cache to avoid repeated SecureStore reads
let cachedAuth: { jwt: string } | null = null;
let authFetchPromise: Promise<{ jwt: string } | null> | null = null;

const getAuthToken = async (): Promise<{ jwt: string } | null> => {
  // Return cached token if available
  if (cachedAuth) {
    return cachedAuth;
  }

  // If there's already a fetch in progress, wait for it
  if (authFetchPromise) {
    return authFetchPromise;
  }

  // Start new fetch
  authFetchPromise = SecureStore.getItemAsync(authKey)
    .then((auth) => {
      const parsed = auth ? JSON.parse(auth) : null;
      cachedAuth = parsed;
      return parsed;
    })
    .catch(() => {
      return null;
    })
    .finally(() => {
      authFetchPromise = null;
    });

  return authFetchPromise;
};

// Export function to clear cache when user logs out
export const clearAuthCache = () => {
  cachedAuth = null;
};

const getURLFromArgs = (...args: Parameters<typeof fetch>) => {
  const [urlArg] = args;
  let url: string | null;
  
  if (typeof urlArg === 'string') {
    url = urlArg;
  } else if (urlArg instanceof URL) {
    // Handle URL objects
    url = urlArg.href;
  } else if (urlArg instanceof Request) {
    // Handle Request objects
    url = urlArg.url;
  } else if (typeof urlArg === 'object' && urlArg !== null && 'url' in urlArg) {
    url = urlArg.url as string;
  } else {
    url = null;
  }
  return url;
};

const isFirstPartyURL = (url: string) => {
  return (
    url.startsWith('/') ||
    (process.env.EXPO_PUBLIC_BASE_URL && url.startsWith(process.env.EXPO_PUBLIC_BASE_URL))
  );
};

const isSecondPartyURL = (url: string) => {
  return url.startsWith('/_create/');
};

type Params = Parameters<typeof expoFetch>;
const fetchToWeb = async function fetchWithHeaders(...args: Params) {
  const firstPartyURL = process.env.EXPO_PUBLIC_BASE_URL;
  const secondPartyURL = process.env.EXPO_PUBLIC_PROXY_BASE_URL;
  if (!firstPartyURL || !secondPartyURL) {
    return expoFetch(...args);
  }
  const [input, init] = args;
  const url = getURLFromArgs(input, init);
  if (!url) {
    return expoFetch(input, init);
  }

  const isExternalFetch = !isFirstPartyURL(url);
  // we should not add headers to requests that don't go to our own server
  if (isExternalFetch) {
    return expoFetch(input, init);
  }

  // Determine final input and prepare headers
  let finalInput: RequestInfo | URL = input;
  const baseURL = isSecondPartyURL(url) ? secondPartyURL : firstPartyURL;
  
  // Build headers - start with existing headers
  let existingHeaders: HeadersInit = {};
  
  if (input instanceof Request) {
    // Clone the Request and merge headers
    existingHeaders = input.headers;
    const fullUrl = url.startsWith('/') ? `${baseURL}${url}` : url;
    finalInput = new Request(fullUrl, {
      method: input.method,
      headers: input.headers,
      body: input.body,
      mode: input.mode,
      credentials: input.credentials,
      cache: input.cache,
      redirect: input.redirect,
      referrer: input.referrer,
      integrity: input.integrity,
    });
  } else if (typeof input === 'string') {
    finalInput = input.startsWith('/') ? `${baseURL}${input}` : input;
    existingHeaders = init?.headers ?? {};
  } else if (input instanceof URL) {
    finalInput = input.href.startsWith('/') ? `${baseURL}${input.href}` : input;
    existingHeaders = init?.headers ?? {};
  }

  const finalHeaders = new Headers(existingHeaders);

  // Add custom headers
  const customHeaders = {
    'x-createxyz-project-group-id': process.env.EXPO_PUBLIC_PROJECT_GROUP_ID,
    // Note: Removed 'host' header to avoid security issues
    // The Host header is managed automatically by the HTTP client
    'x-forwarded-host': process.env.EXPO_PUBLIC_HOST,
    'x-createxyz-host': process.env.EXPO_PUBLIC_HOST,
  };

  for (const [key, value] of Object.entries(customHeaders)) {
    if (value) {
      finalHeaders.set(key, value);
    }
  }

  // Get auth token from cache or SecureStore
  const auth = await getAuthToken();

  if (auth) {
    finalHeaders.set('authorization', `Bearer ${auth.jwt}`);
  }

  return expoFetch(finalInput, {
    ...init,
    headers: finalHeaders,
  });
};

export default fetchToWeb;
