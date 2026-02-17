import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    domains: [],
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry organization and project (set in CI/CD or .env)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token for uploading source maps (CI/CD only)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Suppresses Sentry CLI output during build
  silent: !process.env.CI,

  // Upload source maps only in production builds
  sourcemaps: {
    // Delete source maps after upload (don't expose in production)
    deleteSourcemapsAfterUpload: true,
  },

  // Route-based performance monitoring
  autoInstrumentServerFunctions: true,

  // Disable Sentry toolbar in development
  disableLogger: process.env.NODE_ENV !== 'production',
});
