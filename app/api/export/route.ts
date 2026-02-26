import { NextRequest, NextResponse } from 'next/server';
import type { ResumeData, ResumeSectionKey, TemplateSlug } from '@/types/resume';
import { createClient } from '@/lib/supabase/server';
import { createRouteClient } from '@/lib/supabase/route-client';
import { DEFAULT_SECTION_ORDER } from '@/lib/section-order';
import { renderTemplateToFullHtml } from '@/lib/templates/html-renderer';
import { captureExportError, captureRendererError, trackExportDuration, trackExportResult } from '@/lib/sentry';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

interface ExportRequest {
  templateSlug: TemplateSlug;
  resumeData: ResumeData;
  watermark: boolean;
  email?: string; // For guest Export Pass holders
  sectionOrder?: ResumeSectionKey[]; // User-defined section order
}

/**
 * POST /api/export
 *
 * Generates a PDF from resume data
 *
 * Flow:
 * 1. Validate request body
 * 2. Server-side verify Export Pass (never trust client watermark=false claim)
 * 3. Call Cloudflare Worker (PDF Renderer)
 * 4. Return PDF bytes to client
 */
export async function POST(request: NextRequest) {
  // Rate limit: 10 req/min per IP (applies to guests and authenticated users alike).
  // Authenticated users benefit from the same limit here; abuse prevention is primary goal.
  const ip = getClientIp(request);
  const rl = rateLimit(`export:${ip}`, 10, 60_000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body: ExportRequest = await request.json();
    const { templateSlug, resumeData, watermark, email, sectionOrder } = body;

    // Validate required fields
    if (!templateSlug || !resumeData) {
      return NextResponse.json(
        { error: 'Missing required fields: templateSlug, resumeData' },
        { status: 400 }
      );
    }

    // Validate templateSlug against a strict allowlist to prevent template injection
    const ALLOWED_TEMPLATE_SLUGS: TemplateSlug[] = [
      'education-first',
      'projects-first',
      'skills-emphasis',
      'minimal-classic',
      'modern-ats-safe',
    ];
    if (!ALLOWED_TEMPLATE_SLUGS.includes(templateSlug)) {
      return NextResponse.json(
        { error: 'Invalid templateSlug value' },
        { status: 400 }
      );
    }

    // Cap resumeData payload to 500 KB to prevent abuse / DoS via oversized bodies
    const resumeDataBytes = JSON.stringify(resumeData).length;
    if (resumeDataBytes > 512_000) {
      return NextResponse.json(
        { error: 'Resume data exceeds maximum allowed size (500 KB)' },
        { status: 413 }
      );
    }

    // Server-side Export Pass verification — never trust the client's watermark flag.
    // Exception: internal server-to-server calls from /api/coach/generate-cv are
    // pre-verified (service-client DB check) and identified by INTERNAL_API_SECRET.
    // For all other callers, re-verify via DB to prevent client-side bypass.
    const internalSecret = process.env.INTERNAL_API_SECRET;
    const authHeader = request.headers.get('authorization');
    const isInternalCall = !!(internalSecret && authHeader === `Bearer ${internalSecret}`);

    let actualWatermark = true;
    if (watermark === false) {
      if (isInternalCall) {
        // Trust the watermark flag — the calling route already verified via service client
        actualWatermark = false;
      } else {
        actualWatermark = !(await hasValidExportPass(email));
      }
    }

    // Call Cloudflare Worker to generate PDF
    const pdfRendererUrl = process.env.PDF_RENDERER_URL;
    const pdfRendererToken = process.env.PDF_RENDERER_TOKEN;

    if (!pdfRendererUrl) {
      // Fallback: Return mock PDF for development
      return NextResponse.json({
        message: 'PDF Renderer not configured. Returning mock response.',
        templateSlug,
        watermark: actualWatermark,
        // In production, this would be PDF bytes
      });
    }

    // Render the template to a full HTML document (no React SSR — pure string generation
    // to avoid Next.js 15 react-dom/server restrictions in route handlers)
    const resolvedSectionOrder = sectionOrder ?? DEFAULT_SECTION_ORDER;
    const fullHtml = renderTemplateToFullHtml(
      templateSlug,
      resumeData,
      resolvedSectionOrder,
      actualWatermark
    );

    // Call PDF renderer — send the pre-rendered HTML directly; the worker no
    // longer needs template or resume data (the HTML already contains everything)
    const renderStart = Date.now();
    const response = await fetch(`${pdfRendererUrl}/render/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pdfRendererToken}`,
      },
      body: JSON.stringify({
        html: fullHtml,
        watermark: actualWatermark,
      }),
    });

    if (!response.ok) {
      const durationMs = Date.now() - renderStart;
      let workerError = response.statusText;
      try {
        const errBody = await response.json();
        workerError = errBody.message || errBody.error || response.statusText;
      } catch { /* non-JSON body */ }
      captureRendererError(new Error(`PDF Renderer failed (${response.status}): ${workerError}`), {
        templateId: templateSlug,
        watermark: actualWatermark,
        workerStatus: response.status,
        durationMs,
      });
      trackExportDuration(durationMs, false);
      trackExportResult(false, !email);
      throw new Error(`PDF Renderer failed (${response.status}): ${workerError}`);
    }

    // Return PDF bytes
    const pdfBytes = await response.arrayBuffer();
    const durationMs = Date.now() - renderStart;
    trackExportDuration(durationMs, true);
    trackExportResult(true, !email);

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="cv-${templateSlug}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    captureExportError(error, {
      templateId: 'unknown',
      watermark: true,
      isGuest: true,
    });
    trackExportResult(false, true);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

/**
 * Server-side check: does this request have a valid paid Export Pass?
 * Checks by authenticated user_id first, then by email for guest purchases.
 * Fails safe — returns false on any error so watermark is always applied.
 */
async function hasValidExportPass(email?: string): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    const db = createRouteClient();

    // Check authenticated user session
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (user) {
      const { data } = await db
        .from('purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .lte('pass_start_at', now)
        .gte('pass_end_at', now)
        .limit(1)
        .single();
      if (data) return true;
    }

    // Check by email for guest pass holders
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const { data } = await db
        .from('purchases')
        .select('id')
        .eq('email', email)
        .eq('status', 'paid')
        .lte('pass_start_at', now)
        .gte('pass_end_at', now)
        .limit(1)
        .single();
      if (data) return true;
    }

    return false;
  } catch {
    // Fail safe: if DB check errors, force watermark on
    return false;
  }
}
