'use client';

import { useState } from 'react';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { TEMPLATES } from '@/lib/templates';
import { DEFAULT_SECTION_ORDER } from '@/lib/section-order';
import { analytics } from '@/lib/analytics';
import type { TemplateSlug, ResumeData, ResumeSectionKey } from '@/types/resume';

// Show just the top 200px of the template to keep thumbnails fast and distinctive
const THUMB_WIDTH = 155;
const A4_WIDTH = 794;
const SCALE = THUMB_WIDTH / A4_WIDTH; // ≈ 0.195
const THUMB_VISIBLE_HEIGHT = 200;     // clipped height of each card

interface TemplatePickerPanelProps {
  selectedSlug: TemplateSlug;
  onSelect: (slug: TemplateSlug) => void;
  resumeData: ResumeData;
  sectionOrder: ResumeSectionKey[];
}

export default function TemplatePickerPanel({
  selectedSlug,
  onSelect,
  resumeData,
  sectionOrder,
}: TemplatePickerPanelProps) {
  const [open, setOpen] = useState(false);

  const selectedTemplate = TEMPLATES.find((t) => t.slug === selectedSlug);

  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
      >
        <span className="flex items-center gap-2">
          {/* Template icon */}
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
            />
          </svg>
          Change Template
        </span>
        <span className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-normal">{selectedTemplate?.name}</span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Template grid — only rendered when open */}
      {open && (
        <div className="border-t border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-3">
            Click a template to switch instantly. Your data is preserved.
          </p>
          <div className="grid grid-cols-3 gap-3 max-h-[520px] overflow-y-auto pr-1">
            {TEMPLATES.map((template) => {
              const isSelected = template.slug === selectedSlug;
              return (
                <button
                  key={template.slug}
                  type="button"
                  onClick={() => {
                    analytics.templateChange(template.slug);
                    onSelect(template.slug as TemplateSlug);
                  }}
                  className={`group relative rounded-lg overflow-hidden transition-all focus:outline-none ${
                    isSelected
                      ? 'ring-2 ring-blue-500 shadow-md'
                      : 'ring-1 ring-slate-200 hover:ring-blue-300 hover:shadow-md'
                  }`}
                  aria-label={template.name}
                  aria-pressed={isSelected}
                >
                  {/* Scaled template preview — clipped to top portion */}
                  <div
                    className="relative bg-white overflow-hidden"
                    style={{ height: THUMB_VISIBLE_HEIGHT }}
                  >
                    <div
                      className="origin-top-left pointer-events-none select-none"
                      style={{
                        transform: `scale(${SCALE})`,
                        width: A4_WIDTH,
                        transformOrigin: 'top left',
                      }}
                    >
                      <TemplateRenderer
                        templateSlug={template.slug as TemplateSlug}
                        data={resumeData}
                        sectionOrder={sectionOrder ?? DEFAULT_SECTION_ORDER}
                        watermark={false}
                      />
                    </div>
                    {/* Gradient fade at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                  </div>

                  {/* Template name label */}
                  <div className={`px-2 py-1.5 text-center border-t ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'}`}>
                    <p className={`text-xs font-medium truncate ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>
                      {template.name}
                    </p>
                  </div>

                  {/* Selected checkmark badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
