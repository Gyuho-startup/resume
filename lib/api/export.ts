import type { ResumeData, TemplateSlug } from '@/types/resume';
import { generatePDFFromHTML } from './export-client';

/**
 * Client-side API for exporting resume to PDF
 */
export async function exportResumeToPDF(
  templateSlug: TemplateSlug,
  resumeData: ResumeData,
  watermark: boolean = true
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
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to export PDF');
  }

  // Check if response is JSON (renderer not configured)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    // Fallback to client-side PDF generation
    console.log('PDF Renderer not configured, using client-side generation');

    // Find the preview element (it should be rendered on the page)
    const previewElement = document.querySelector('[data-pdf-preview]') as HTMLElement;

    if (!previewElement) {
      throw new Error('Preview element not found. Cannot generate PDF.');
    }

    // Generate PDF from the preview HTML
    return await generatePDFFromHTML('pdf-preview-container', 'cv.pdf');
  }

  // Return PDF blob from server
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
