// Sentry configuration for the server-side (API routes, SSR)
// This file is loaded automatically by Next.js

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Capture 10% of transactions
  tracesSampleRate: 0.1,

  // Capture 100% of errors
  sampleRate: 1.0,

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,

  // Environment tagging
  environment: process.env.NODE_ENV,

  // PII safety: Never include user data in server errors
  sendDefaultPii: false,

  // Event filtering: Strip PII before sending
  beforeSend(event) {
    // Remove request body (may contain resume data / PII)
    if (event.request?.data) {
      delete event.request.data;
    }

    // Remove auth headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }

    return event;
  },
});
