// API endpoint to generate final CV from AI coach conversation
// Validates bullets, auto-improves them, and triggers PDF export

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { validateBullet } from '@/lib/coach/bullet-validator';
import { improveBullet } from '@/lib/coach/bullet-improver';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import type { ResumeData } from '@/types/resume';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerateCVRequest {
  resumeData: ResumeData;
  templateSlug?: string;
}

interface BulletImprovement {
  section: string;
  index: number;
  original: string;
  improved: string;
  score: number;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Auth guard: require a valid Supabase session (logged-in users only)
    // This prevents anonymous abuse of the expensive AI bullet-improvement pipeline.
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error_code: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Rate limit: 5 req/min per user. Each call triggers multiple Anthropic API
    // round-trips (one per weak bullet). This is the most expensive endpoint.
    const ip = getClientIp(request);
    const rlKey = `generate-cv:user:${user.id}:ip:${ip}`;
    const rl = rateLimit(rlKey, 5, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error_code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
        }
      );
    }

    const body: GenerateCVRequest = await request.json();
    const { resumeData, templateSlug = 'education-first' } = body;

    console.log('[/api/coach/generate-cv] Starting CV generation...');

    // Step 1: Validate all bullets and collect those that need improvement
    const improvements: BulletImprovement[] = [];
    let totalBullets = 0;
    let validBullets = 0;

    // Validate experience bullets
    if (resumeData.experience) {
      for (let i = 0; i < resumeData.experience.length; i++) {
        const exp = resumeData.experience[i];
        if (!exp.responsibilities) continue;

        for (let j = 0; j < exp.responsibilities.length; j++) {
          const bullet = exp.responsibilities[j];
          totalBullets++;
          const validation = validateBullet(bullet);

          if (validation.isValid) {
            validBullets++;
          } else {
            console.log(`[/api/coach/generate-cv] Weak bullet in experience[${i}].responsibilities[${j}]: ${bullet.substring(0, 100)}`);
            const improved = await improveBullet(
              bullet,
              {
                userInput: bullet,
                section: `experience[${i}] - ${exp.company} - ${exp.position}`,
              },
              client
            );

            if (improved.improved) {
              improvements.push({
                section: `experience[${i}].responsibilities`,
                index: j,
                original: bullet,
                improved: improved.finalBullet,
                score: improved.finalScore,
              });
              validBullets++; // Count as valid after improvement
            }
          }
        }
      }
    }

    // Validate project bullets
    if (resumeData.projects) {
      for (let i = 0; i < resumeData.projects.length; i++) {
        const proj = resumeData.projects[i];
        if (!proj.highlights) continue;

        for (let j = 0; j < proj.highlights.length; j++) {
          const bullet = proj.highlights[j];
          totalBullets++;
          const validation = validateBullet(bullet);

          if (validation.isValid) {
            validBullets++;
          } else {
            console.log(`[/api/coach/generate-cv] Weak bullet in projects[${i}].highlights[${j}]: ${bullet.substring(0, 100)}`);
            const improved = await improveBullet(
              bullet,
              {
                userInput: bullet,
                section: `projects[${i}] - ${proj.name}`,
              },
              client
            );

            if (improved.improved) {
              improvements.push({
                section: `projects[${i}].highlights`,
                index: j,
                original: bullet,
                improved: improved.finalBullet,
                score: improved.finalScore,
              });
              validBullets++;
            }
          }
        }
      }
    }

    // Validate education achievements
    if (resumeData.education) {
      for (let i = 0; i < resumeData.education.length; i++) {
        const edu = resumeData.education[i];
        if (!edu.achievements) continue;

        for (let j = 0; j < edu.achievements.length; j++) {
          const bullet = edu.achievements[j];
          totalBullets++;
          const validation = validateBullet(bullet);

          if (validation.isValid) {
            validBullets++;
          } else {
            console.log(`[/api/coach/generate-cv] Weak bullet in education[${i}].achievements[${j}]: ${bullet.substring(0, 100)}`);
            const improved = await improveBullet(
              bullet,
              {
                userInput: bullet,
                section: `education[${i}] - ${edu.institution}`,
              },
              client
            );

            if (improved.improved) {
              improvements.push({
                section: `education[${i}].achievements`,
                index: j,
                original: bullet,
                improved: improved.finalBullet,
                score: improved.finalScore,
              });
              validBullets++;
            }
          }
        }
      }
    }

    // Step 2: Apply improvements to resumeData
    const improvedResumeData = { ...resumeData };

    for (const improvement of improvements) {
      const [section, indexStr] = improvement.section.split('[');
      const sectionIndex = parseInt(indexStr);

      if (section === 'experience') {
        const exp = improvedResumeData.experience?.[sectionIndex];
        if (exp && exp.responsibilities) {
          exp.responsibilities[improvement.index] = improvement.improved;
        }
      } else if (section === 'projects') {
        const proj = improvedResumeData.projects?.[sectionIndex];
        if (proj && proj.highlights) {
          proj.highlights[improvement.index] = improvement.improved;
        }
      } else if (section === 'education') {
        const edu = improvedResumeData.education?.[sectionIndex];
        if (edu && edu.achievements) {
          edu.achievements[improvement.index] = improvement.improved;
        }
      }
    }

    // Calculate quality metrics
    const passRate = totalBullets > 0 ? (validBullets / totalBullets) * 100 : 0;
    console.log(`[/api/coach/generate-cv] Bullet quality: ${validBullets}/${totalBullets} (${passRate.toFixed(1)}%)`);
    console.log(`[/api/coach/generate-cv] Applied ${improvements.length} improvements`);

    // Step 3: Check if user has a valid Export Pass before generating PDF.
    // Server-side check using service client (bypasses RLS) so we have the
    // authoritative answer without relying on cookie forwarding in internal fetches.
    const db = createServiceClient();
    const now = new Date().toISOString();
    const { data: activePurchase } = await db
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'paid')
      .lte('pass_start_at', now)
      .gte('pass_end_at', now)
      .limit(1)
      .single();
    const watermark = !activePurchase; // false (no watermark) only if pass is valid

    // Build headers for internal server-to-server call.
    // INTERNAL_API_SECRET tells /api/export to trust the verified watermark flag
    // instead of re-running the auth check (which would fail without cookie forwarding).
    const internalHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (process.env.INTERNAL_API_SECRET) {
      internalHeaders['Authorization'] = `Bearer ${process.env.INTERNAL_API_SECRET}`;
    }

    // Step 4: Generate PDF via export route
    const pdfResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/export`,
      {
        method: 'POST',
        headers: internalHeaders,
        body: JSON.stringify({
          resumeData: improvedResumeData,
          templateSlug,
          watermark,
          sectionOrder: [
            'personal',
            'summary',
            'education',
            'projects',
            'experience',
            'skills',
            'certifications',
          ],
        }),
      }
    );

    if (!pdfResponse.ok) {
      throw new Error(`PDF generation failed: ${pdfResponse.statusText}`);
    }

    const pdfBlob = await pdfResponse.blob();
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());

    console.log('[/api/coach/generate-cv] PDF generated successfully');

    // Return the PDF with metadata
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(
          resumeData.personal?.name || 'My CV'
        )}_CV.pdf"`,
        'X-Quality-Score': passRate.toFixed(1),
        'X-Improvements-Made': improvements.length.toString(),
        'X-Total-Bullets': totalBullets.toString(),
      },
    });
  } catch (error: unknown) {
    console.error('[/api/coach/generate-cv] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error_code: 'GENERATION_FAILED',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
