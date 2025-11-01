import { usePathname, useRouter, Slot } from 'expo-router';
import React, { memo, useEffect } from 'react';
import { ErrorBoundaryWrapper } from './__create/SharedErrorBoundary';
import './src/__create/polyfills';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';
import { AlertModal } from './polyfills/web/alerts.web';
import './global.css';

const GlobalErrorReporter = () => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const errorHandler = (event: ErrorEvent) => {
      // Log error but don't prevent default browser behavior for better debugging
      console.error('[Global Error]:', event.error);
      
      // Consider integrating error tracking service here (e.g., Sentry)
      // Example: Sentry.captureException(event.error);
    };
    
    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      // Log unhandled promise rejections
      console.error('[Unhandled Promise Rejection]:', event.reason);
      
      // Consider integrating error tracking service here
      // Example: Sentry.captureException(event.reason);
      
      // Prevent default only for promise rejections to avoid console noise
      if (typeof event.preventDefault === 'function') event.preventDefault();
    };
    
    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', unhandledRejectionHandler);
    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
    };
  }, []);
  return null;
};

const Wrapper = memo(() => {
  return (
    <ErrorBoundaryWrapper>
      {/* SafeAreaProvider will automatically detect device safe areas */}
      <SafeAreaProvider>
        <Slot />
        <GlobalErrorReporter />
        <Toaster />
      </SafeAreaProvider>
    </ErrorBoundaryWrapper>
  );
});
const healthyResponse = {
  type: 'sandbox:mobile:healthcheck:response',
  healthy: true,
};

// Target origin for postMessage - '*' should only be used in controlled sandbox environments
// For production, replace with specific origin (e.g., window.location.origin or specific URL)
const TARGET_ORIGIN = typeof window !== 'undefined' && window.location.ancestorOrigins?.length 
  ? window.location.ancestorOrigins[0] 
  : '*';

const useHandshakeParent = () => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate message origin in production
      // if (event.origin !== 'https://expected-origin.com') return;
      
      if (event.data.type === 'sandbox:mobile:healthcheck') {
        window.parent.postMessage(healthyResponse, TARGET_ORIGIN);
      }
    };
    window.addEventListener('message', handleMessage);
    // Immediately respond to the parent window with a healthy response in
    // case we missed the healthcheck message
    window.parent.postMessage(healthyResponse, TARGET_ORIGIN);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
};

const CreateApp = () => {
  const router = useRouter();
  const pathname = usePathname();
  useHandshakeParent();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate message origin in production
      // if (event.origin !== 'https://expected-origin.com') return;
      
      if (event.data.type === 'sandbox:navigation' && event.data.pathname !== pathname) {
        router.push(event.data.pathname);
      }
    };

    window.addEventListener('message', handleMessage);
    window.parent.postMessage({ type: 'sandbox:mobile:ready' }, TARGET_ORIGIN);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [router, pathname]);

  useEffect(() => {
    window.parent.postMessage(
      {
        type: 'sandbox:mobile:navigation',
        pathname,
      },
      TARGET_ORIGIN
    );
  }, [pathname]);

  return (
    <>
      <Wrapper />
      <AlertModal />
    </>
  );
};

export default CreateApp;
