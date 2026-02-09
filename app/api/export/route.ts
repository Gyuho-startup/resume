import { NextRequest, NextResponse } from 'next/server';
import type { ResumeData, TemplateSlug } from '@/types/resume';

export const runtime = 'edge'; // Use Edge runtime for better performance

interface ExportRequest {
  templateSlug: TemplateSlug;
  resumeData: ResumeData;
  watermark: boolean;
}

/**
 * POST /api/export
 *
 * Generates a PDF from resume data
 *
 * Flow:
 * 1. Validate request body
 * 2. Call Cloudflare Worker (PDF Renderer)
 * 3. Return PDF bytes to client
 */
export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json();
    const { templateSlug, resumeData, watermark } = body;

    // Validate required fields
    if (!templateSlug || !resumeData) {
      return NextResponse.json(
        { error: 'Missing required fields: templateSlug, resumeData' },
        { status: 400 }
      );
    }

    // TODO: Check if user has active Export Pass (for watermark=false)
    // For now, free users always get watermark
    const actualWatermark = watermark !== false; // Force watermark for MVP

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

    // Call PDF renderer
    const response = await fetch(`${pdfRendererUrl}/render/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pdfRendererToken}`,
      },
      body: JSON.stringify({
        templateSlug,
        resumeData,
        watermark: actualWatermark,
      }),
    });

    if (!response.ok) {
      throw new Error(`PDF Renderer failed: ${response.statusText}`);
    }

    // Return PDF bytes
    const pdfBytes = await response.arrayBuffer();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="cv-${templateSlug}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
