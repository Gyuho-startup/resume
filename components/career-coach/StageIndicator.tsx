'use client';

import type { InterviewStage } from '@/lib/coach/types';

interface StageIndicatorProps {
  currentStage: InterviewStage;
}

const STAGES: { key: InterviewStage; label: string }[] = [
  { key: 'onboarding', label: 'About You' },
  { key: 'deep_dive', label: 'Experiences' },
  { key: 'structuring', label: 'Strengths' },
  { key: 'generation', label: 'Draft CV' },
  { key: 'review', label: 'Refine' },
];

export default function StageIndicator({ currentStage }: StageIndicatorProps) {
  const currentIndex = STAGES.findIndex(s => s.key === currentStage);

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between max-w-2xl">
          {STAGES.map((stage, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <div key={stage.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                    aria-label={`Step ${index + 1}: ${stage.label}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <span
                    className={`text-xs mt-1 whitespace-nowrap ${
                      isCurrent ? 'text-blue-600 font-medium' : 'text-slate-500'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
                {index < STAGES.length - 1 && (
                  <div
                    className={`h-0.5 w-8 sm:w-16 mx-1 mb-4 transition-colors ${
                      isCompleted ? 'bg-green-500' : 'bg-slate-200'
                    }`}
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
