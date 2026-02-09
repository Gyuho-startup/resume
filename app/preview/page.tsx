'use client';

import { useState } from 'react';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { sampleResumeData } from '@/lib/sample-data';
import { TEMPLATES } from '@/lib/templates';
import type { TemplateSlug } from '@/types/resume';

export default function PreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateSlug>('education-first');
  const [showWatermark, setShowWatermark] = useState(true);

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Template Preview
          </h1>
          <p className="text-slate-600">
            Testing Phase 1 - Template Engine
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Template Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value as TemplateSlug)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {TEMPLATES.map((template) => (
                  <option key={template.slug} value={template.slug}>
                    {template.name} - {template.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Watermark Toggle */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Watermark
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowWatermark(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    showWatermark
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  Free (Watermark)
                </button>
                <button
                  onClick={() => setShowWatermark(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    !showWatermark
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  Paid (No Watermark)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Template Preview */}
        <div className="bg-slate-200 p-8 rounded-lg">
          <TemplateRenderer
            templateSlug={selectedTemplate}
            data={sampleResumeData}
            watermark={showWatermark}
          />
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Phase 1 Progress:</strong> Template Engine is working! Next steps: Builder UI, LocalStorage autosave, PDF export.
          </p>
        </div>
      </div>
    </div>
  );
}
