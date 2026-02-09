/**
 * Cloudflare Worker for PDF Rendering
 * Uses Browser Rendering API (Puppeteer/Playwright)
 *
 * POST /render/pdf
 * Body: { templateSlug, resumeData, watermark }
 * Returns: PDF bytes
 */

interface Env {
  BROWSER: any; // Browser Rendering binding
  PDF_RENDERER_TOKEN: string;
  ALLOWED_ORIGINS: string;
}

interface RenderRequest {
  templateSlug: string;
  resumeData: any;
  watermark: boolean;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // TODO: Restrict to ALLOWED_ORIGINS
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight
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

    // Authenticate request
    const authHeader = request.headers.get('Authorization');
    const expectedToken = `Bearer ${env.PDF_RENDERER_TOKEN}`;

    if (authHeader !== expectedToken) {
      return new Response('Unauthorized', {
        status: 401,
        headers: corsHeaders,
      });
    }

    try {
      const body: RenderRequest = await request.json();
      const { templateSlug, resumeData, watermark } = body;

      // Validate input
      if (!templateSlug || !resumeData) {
        return new Response(
          JSON.stringify({ error: 'Missing templateSlug or resumeData' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Generate HTML for PDF
      const html = generateResumeHTML(templateSlug, resumeData, watermark);

      // Use Browser Rendering API to generate PDF
      const browser = await env.BROWSER.launch();
      const page = await browser.newPage();

      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generate PDF
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

      // Return PDF
      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="cv-${templateSlug}.pdf"`,
        },
      });
    } catch (error: any) {
      console.error('PDF generation error:', error);

      return new Response(
        JSON.stringify({ error: 'PDF generation failed', message: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  },
};

/**
 * Generate HTML for PDF rendering
 * This is a simplified version - in production, use actual template HTML
 */
function generateResumeHTML(
  templateSlug: string,
  resumeData: any,
  watermark: boolean
): string {
  const { personal, education, experience, projects, skills } = resumeData;

  // Basic HTML structure with inline CSS (PDF-safe)
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #1e293b;
      background: white;
      padding: 40px;
      position: relative;
    }
    ${watermark ? `
    body::before {
      content: 'FREE EXPORT';
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      font-weight: bold;
      color: rgba(148, 163, 184, 0.1);
      z-index: -1;
      pointer-events: none;
    }
    ` : ''}
    h1 {
      font-size: 24pt;
      font-weight: bold;
      margin-bottom: 8px;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 8px;
    }
    h2 {
      font-size: 16pt;
      font-weight: bold;
      margin-top: 20px;
      margin-bottom: 10px;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
    }
    h3 {
      font-size: 12pt;
      font-weight: 600;
      margin-bottom: 4px;
    }
    p {
      margin-bottom: 8px;
    }
    ul {
      margin-left: 20px;
      margin-bottom: 12px;
    }
    li {
      margin-bottom: 4px;
    }
    .header-contact {
      font-size: 10pt;
      color: #475569;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <!-- Personal Information -->
  <header>
    <h1>${personal.name || 'Your Name'}</h1>
    <div class="header-contact">
      ${personal.email || ''} • ${personal.phone || ''} • ${personal.city || ''}
      ${personal.linkedin ? ` • ${personal.linkedin}` : ''}
      ${personal.github ? ` • ${personal.github}` : ''}
    </div>
  </header>

  <!-- Education -->
  ${education && education.length > 0 ? `
    <section>
      <h2>Education</h2>
      ${education.map((edu: any) => `
        <div style="margin-bottom: 12px;">
          <h3>${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</h3>
          <p>${edu.institution} • ${edu.startDate} – ${edu.endDate || 'Present'}</p>
          ${edu.grade ? `<p><em>Grade: ${edu.grade}</em></p>` : ''}
        </div>
      `).join('')}
    </section>
  ` : ''}

  <!-- Skills -->
  ${skills ? `
    <section>
      <h2>Skills</h2>
      ${skills.technical && skills.technical.length > 0 ? `
        <p><strong>Technical:</strong> ${skills.technical.join(', ')}</p>
      ` : ''}
      ${skills.soft && skills.soft.length > 0 ? `
        <p><strong>Soft Skills:</strong> ${skills.soft.join(', ')}</p>
      ` : ''}
    </section>
  ` : ''}

  <!-- Projects -->
  ${projects && projects.length > 0 ? `
    <section>
      <h2>Projects</h2>
      ${projects.map((project: any) => `
        <div style="margin-bottom: 12px;">
          <h3>${project.name}</h3>
          <p>${project.description}</p>
          <p><strong>Technologies:</strong> ${project.technologies.join(', ')}</p>
        </div>
      `).join('')}
    </section>
  ` : ''}

  <!-- Experience -->
  ${experience && experience.length > 0 ? `
    <section>
      <h2>Experience</h2>
      ${experience.map((exp: any) => `
        <div style="margin-bottom: 12px;">
          <h3>${exp.position}</h3>
          <p>${exp.company} • ${exp.startDate} – ${exp.endDate || 'Present'}</p>
          <ul>
            ${exp.responsibilities.map((resp: string) => `<li>${resp}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </section>
  ` : ''}
</body>
</html>
  `;
}
