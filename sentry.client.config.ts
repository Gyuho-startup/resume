// Sentry configuration for the client-side (browser)
// This file is loaded automatically by Next.js

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Capture 10% of transactions for performance monitoring
  tracesSampleRate: 0.1,

  // Capture 100% of errors in production
  // (reduce to 0.5 after launch if volume is too high)
  sampleRate: 1.0,

  // Release tracking (set via CI/CD)
  release: process.env.NEXT_PUBLIC_APP_VERSION,

  // Environment tagging
  environment: process.env.NODE_ENV,

  // PII safety: Don't include user IP by default
  sendDefaultPii: false,

  // Ignore common non-actionable errors
  ignoreErrors: [
    // Network errors (user-side connectivity issues)
    'NetworkError',
    'Failed to fetch',
    'Load failed',
    // Browser extension errors
    'chrome-extension://',
    'moz-extension://',
    // ResizeObserver benign errors
    'ResizeObserver loop limit exceeded',
  ],

  // Breadcrumb filtering: Don't log PII in breadcrumbs
  beforeBreadcrumb(breadcrumb) {
    // Scrub query strings that might contain sensitive data
    if (breadcrumb.category === 'navigation' && breadcrumb.data?.to) {
      breadcrumb.data.to = breadcrumb.data.to.replace(
        /([?&])(email|name|phone)=[^&]*/gi,
        '$1$2=[REDACTED]'
      );
    }
    return breadcrumb;
  },

  // Event filtering: Remove PII from events before sending
  beforeSend(event) {
    // Strip any accidental PII from request data
    if (event.request?.data) {
      delete event.request.data;
    }
    return event;
  },
});
