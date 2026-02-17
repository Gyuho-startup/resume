import type { ResumeData, ResumeSectionKey, TemplateSlug } from '@/types/resume';
import { generatePDFFromHTML } from './export-client';

/**
 * Client-side API for exporting resume to PDF
 */
export async function exportResumeToPDF(
  templateSlug: TemplateSlug,
  resumeData: ResumeData,
  watermark: boolean = true,
  email?: string, // Required when watermark=false and user is not logged in (guest pass)
  sectionOrder?: ResumeSectionKey[]
): Promise<Blob> {
  const response = await fetch('/api/export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      templateSlug,
      resumeData,
      watermark,
      ...(email && { email }),
      ...(sectionOrder && { sectionOrder }),
    }),
  });

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  // Server returned an error — propagate the message, do NOT silently fallback
  if (!response.ok) {
    if (isJson) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Export failed (${response.status})`);
    }
    throw new Error(`Export failed (${response.status})`);
  }

  // Server returned OK JSON → PDF renderer not configured (dev mode fallback)
  if (isJson) {
    console.log('PDF Renderer not configured. Using client-side fallback.');
    const previewElement = document.querySelector('[data-pdf-preview]') as HTMLElement;
    if (!previewElement) {
      throw new Error('Preview element not found. Cannot generate PDF.');
    }
    return await generatePDFFromHTML('pdf-preview-container', 'cv.pdf');
  }

  // Server returned PDF bytes
  return await response.blob();
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
