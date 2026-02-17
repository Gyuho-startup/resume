/**
 * Plausible Analytics event tracking utility.
 * Safe to call on server (no-ops) and client.
 * All events are fire-and-forget — never block user flows.
 */

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | boolean | number> }
    ) => void;
  }
}

function track(event: string, props?: Record<string, string | boolean | number>) {
  if (typeof window === 'undefined') return;
  try {
    window.plausible?.(event, props ? { props } : undefined);
  } catch {
    // Never let analytics errors break the app
  }
}

export const analytics = {
  startBuilder: () => track('start_builder'),

  completeSection: (sectionName: string) =>
    track('complete_section', { section_name: sectionName }),

  previewOpen: () => track('preview_open'),

  templateChange: (templateId: string) =>
    track('template_change', { template_id: templateId }),

  exportClick: (watermark: boolean) =>
    track('export_click', { watermark }),

  exportSuccess: (watermark: boolean, durationMs: number) =>
    track('export_success', { watermark, duration_ms: durationMs }),

  checkoutStart: () => track('checkout_start'),

  purchaseSuccess: () => track('purchase_success'),

  loginStart: () => track('login_start'),

  loginSuccess: () => track('login_success'),

  saveResume: () => track('save_resume'),
};
