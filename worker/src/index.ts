/**
 * Cloudflare Worker for PDF Rendering
 * Uses Browser Rendering API via @cloudflare/puppeteer
 *
 * POST /render/pdf
 * Body: { html: string, watermark: boolean }
 * Returns: PDF bytes
 *
 * The caller (Next.js /api/export) is responsible for rendering the React
 * template to an HTML string and wrapping it in a full HTML document before
 * sending it here.  The worker simply loads that HTML in a headless browser
 * and exports it as an A4 PDF.
 */
import puppeteer from '@cloudflare/puppeteer';
import { withSentry, captureException } from '@sentry/cloudflare';

interface Env {
  BROWSER: any; // Browser Rendering binding
  PDF_RENDERER_TOKEN: string;
  ALLOWED_ORIGINS: string;
  SENTRY_DSN?: string;
}

interface RenderRequest {
  html: string;
  watermark: boolean;
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
    // Build CORS header value from the ALLOWED_ORIGINS env var.
    // Defaults to '*' when the var is not set (e.g. local wrangler dev).
    const allowedOrigin = env.ALLOWED_ORIGINS || '*';

    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders,
      });
    }

    // Authenticate request using shared Bearer token
    const authHeader = request.headers.get('Authorization');
    const expectedToken = `Bearer ${env.PDF_RENDERER_TOKEN}`;

    if (authHeader !== expectedToken) {
      return new Response(
        JSON.stringify({ error_code: 'INVALID_TOKEN', message: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    try {
      const body: RenderRequest = await request.json();
      const { html, watermark } = body;

      // Validate that the required html field is present
      if (!html || typeof html !== 'string' || html.trim() === '') {
        return new Response(
          JSON.stringify({
            error_code: 'INVALID_INPUT',
            message: 'Missing or empty html field',
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Log non-PII metadata only
      console.log('PDF render request:', {
        watermark: Boolean(watermark),
        htmlLength: html.length,
      });

      // Use @cloudflare/puppeteer with the Browser Rendering binding
      const browser = await puppeteer.launch(env.BROWSER);
      const page = await browser.newPage();

      // waitUntil: 'networkidle0' ensures Tailwind CDN and fonts have loaded
      // before the PDF is captured
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0',
          right: '0',
          bottom: '0',
          left: '0',
        },
      });

      await browser.close();

      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="cv.pdf"',
        },
      });
    } catch (error: any) {
      // Log error message only — do not log the request body which may contain PII
      console.error('PDF generation error:', error.message);
      captureException(error);

      return new Response(
        JSON.stringify({
          error_code: 'RENDER_FAILED',
          message: 'PDF generation failed',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
}

export default withSentry(
  (env: Env) => ({
    dsn: env.SENTRY_DSN,
    enabled: !!env.SENTRY_DSN,
    sendDefaultPii: false,
    tracesSampleRate: 0.1,
  }),
  {
    fetch: handleRequest,
  }
);
