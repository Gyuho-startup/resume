/**
 * Client-side PDF export — delegates entirely to the server-side API route.
 *
 * jsPDF (v<=4.1.0) was removed due to multiple HIGH-severity CVEs
 * (GHSA-p5xg-68wr-hm3m, GHSA-9vjf-qc39-jprp, GHSA-67pg-wm7f-q7fj).
 * No patched version is available in the 4.x line.
 *
 * The production export path uses the Cloudflare Browser Rendering Worker,
 * which produces ATS-safe, server-rendered PDFs. Configure PDF_RENDERER_URL
 * in your environment variables to enable it.
 */

/**
 * Throws a descriptive error when the PDF renderer is not configured.
 * Previously this fell back to jsPDF + html2canvas on the client; that
 * fallback has been removed for security reasons.
 */
export function generatePDFFromHTML(
  _elementId: string,
  _filename: string
): never {
  throw new Error(
    'PDF Renderer is not configured. Set the PDF_RENDERER_URL environment ' +
    'variable to point to your Cloudflare Browser Rendering Worker. ' +
    'See worker/README.md for setup instructions.'
  );
}
