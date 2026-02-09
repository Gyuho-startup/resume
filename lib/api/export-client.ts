import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { ResumeData, TemplateSlug } from '@/types/resume';

/**
 * Generate PDF from HTML element using html2canvas + jsPDF
 * This is used as a fallback when Cloudflare Worker is not configured
 */
export async function generatePDFFromHTML(
  elementId: string,
  filename: string
): Promise<Blob> {
  const element = document.getElementById(elementId);

  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Temporarily remove scale transform for proper capture
  const originalTransform = element.style.transform;
  const originalWidth = element.style.width;
  element.style.transform = 'scale(1)';
  element.style.width = '210mm'; // A4 width

  try {
    // Capture HTML as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794, // A4 width in pixels at 96 DPI (210mm)
      windowWidth: 794,
    });

    // Calculate PDF dimensions (A4 size)
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Return as blob
    return pdf.output('blob');
  } finally {
    // Restore original styles
    element.style.transform = originalTransform;
    element.style.width = originalWidth;
  }
}

/**
 * Generate PDF by rendering template to hidden div and converting to PDF
 */
export async function generatePDFFromTemplate(
  templateSlug: TemplateSlug,
  resumeData: ResumeData,
  watermark: boolean
): Promise<Blob> {
  // Create temporary container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '210mm'; // A4 width
  container.style.backgroundColor = 'white';
  document.body.appendChild(container);

  try {
    // Dynamically import the template component
    const { default: TemplateRenderer } = await import(
      '@/components/templates/TemplateRenderer'
    );

    // Render template (you'd need to use ReactDOM.render or similar here)
    // For now, we'll use a simpler approach with the preview element

    throw new Error('Direct template rendering not yet implemented. Please use the preview panel.');
  } finally {
    document.body.removeChild(container);
  }
}
