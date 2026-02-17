'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { TEMPLATES } from '@/lib/templates';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { sampleResumeData } from '@/lib/sample-data';
import { DEFAULT_SECTION_ORDER } from '@/lib/section-order';
import type { TemplateSlug } from '@/types/resume';

// A4 is 794px wide at 96dpi; we display at 300px → scale ≈ 0.378
const PREVIEW_WIDTH = 300;
const A4_PX_WIDTH = 794;
const SCALE = PREVIEW_WIDTH / A4_PX_WIDTH;
const PREVIEW_HEIGHT = Math.round(PREVIEW_WIDTH * (297 / 210)); // A4 ratio ≈ 424px

const AUTO_PLAY_MS = 3800;

export default function TemplateCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setDirection('next');
      setAnimating(true);
      setTimeout(() => {
        setActiveIndex((i) => (i + 1) % TEMPLATES.length);
        setAnimating(false);
      }, 350);
    }, AUTO_PLAY_MS);
  }, []);

  useEffect(() => {
    startTimer();
    return stopTimer;
  }, [startTimer]);

  const goTo = (index: number, dir: 'next' | 'prev' = 'next') => {
    if (animating) return;
    stopTimer();
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setActiveIndex(index);
      setAnimating(false);
      startTimer();
    }, 350);
  };

  const prev = () =>
    goTo((activeIndex - 1 + TEMPLATES.length) % TEMPLATES.length, 'prev');
  const next = () => goTo((activeIndex + 1) % TEMPLATES.length, 'next');

  const current = TEMPLATES[activeIndex];

  // Show up to 20 dots — use small thin lines so 20 fit neatly
  const visibleDots = TEMPLATES.length;

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            20 Professional Templates
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Every template is ATS-friendly and optimised for UK entry-level positions.
          </p>
        </div>

        {/* Carousel stage */}
        <div className="flex items-center justify-center gap-6">
          {/* Prev arrow */}
          <button
            onClick={prev}
            aria-label="Previous template"
            className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-900 hover:shadow-md transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Preview card */}
          <div className="relative" style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}>
            {/* Decorative shadow behind the card */}
            <div
              className="absolute inset-0 rounded-xl bg-slate-300 translate-y-2 translate-x-2 opacity-40 blur-sm"
              aria-hidden
            />

            {/* The actual CV preview */}
            <div
              className="relative rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xl"
              style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
            >
              {/* Animated slide */}
              <div
                key={activeIndex}
                className="absolute inset-0"
                style={{
                  animation: animating
                    ? direction === 'next'
                      ? 'slideOutLeft 0.35s ease forwards'
                      : 'slideOutRight 0.35s ease forwards'
                    : 'slideIn 0.35s ease forwards',
                }}
              >
                <div
                  className="origin-top-left pointer-events-none select-none"
                  style={{
                    transform: `scale(${SCALE})`,
                    width: A4_PX_WIDTH,
                  }}
                >
                  <TemplateRenderer
                    templateSlug={current.slug as TemplateSlug}
                    data={sampleResumeData}
                    sectionOrder={DEFAULT_SECTION_ORDER}
                    watermark={false}
                  />
                </div>
              </div>

              {/* Gradient fade at bottom so it doesn't look cut off */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Next arrow */}
          <button
            onClick={next}
            aria-label="Next template"
            className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-900 hover:shadow-md transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Template info */}
        <div
          key={`info-${activeIndex}`}
          className="text-center mt-6 transition-opacity duration-300"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-slate-900">{current.name}</h3>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              ATS-Friendly
            </span>
          </div>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">{current.description}</p>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center items-center gap-1 mt-5">
          {Array.from({ length: visibleDots }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > activeIndex ? 'next' : 'prev')}
              aria-label={`Go to template ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-5 h-2 bg-blue-500'
                  : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        {/* Counter + CTA */}
        <div className="flex items-center justify-center gap-6 mt-5">
          <span className="text-xs text-slate-400">
            {activeIndex + 1} / {TEMPLATES.length}
          </span>
          <Link
            href={`/builder`}
            className="px-5 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition shadow"
          >
            Use this template →
          </Link>
          <Link
            href="/preview"
            className="text-sm text-slate-500 hover:text-slate-700 font-medium transition"
          >
            View all →
          </Link>
        </div>
      </div>

      {/* Keyframe animations injected via style tag */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutLeft {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-24px); }
        }
        @keyframes slideOutRight {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(24px); }
        }
      `}</style>
    </section>
  );
}
