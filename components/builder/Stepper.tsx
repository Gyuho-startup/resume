import type { BuilderStep } from '@/types/resume';

interface StepperProps {
  currentStep: BuilderStep;
  onStepChange: (step: BuilderStep) => void;
}

const STEPS: { id: BuilderStep; label: string; required: boolean }[] = [
  { id: 'personal', label: 'Personal', required: true },
  { id: 'education', label: 'Education', required: true },
  { id: 'experience', label: 'Experience', required: false },
  { id: 'projects', label: 'Projects', required: false },
  { id: 'skills', label: 'Skills', required: true },
  { id: 'certifications', label: 'Certifications', required: false },
  { id: 'review', label: 'Review', required: false },
];

export default function Stepper({ currentStep, onStepChange }: StepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
  const currentStepInfo = STEPS[currentIndex];
  const progressPercent = ((currentIndex + 1) / STEPS.length) * 100;

  return (
    <nav className="bg-white border-b border-slate-200 px-4 py-3">
      <div className="max-w-6xl mx-auto">

        {/* Mobile: condensed step indicator + progress bar */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">
              Step {currentIndex + 1} of {STEPS.length}:{' '}
              <span className="text-blue-600">{currentStepInfo.label}</span>
              {!currentStepInfo.required && (
                <span className="text-xs font-normal text-slate-500 ml-1">(Optional)</span>
              )}
            </span>
            <div className="flex gap-1">
              {currentIndex > 0 && (
                <button
                  onClick={() => onStepChange(STEPS[currentIndex - 1].id)}
                  className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition"
                >
                  ← Back
                </button>
              )}
              {currentIndex < STEPS.length - 1 && (
                <button
                  onClick={() => onStepChange(STEPS[currentIndex + 1].id)}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full">
            <div
              className="h-1.5 bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Tablet/Desktop: full step tabs */}
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < currentIndex;
            const isAccessible = index <= currentIndex + 1;

            return (
              <button
                key={step.id}
                onClick={() => isAccessible && onStepChange(step.id)}
                disabled={!isAccessible}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'bg-blue-500 text-white font-semibold'
                    : isCompleted
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : isAccessible
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span className="text-sm">
                  {index + 1}. {step.label}
                </span>
                {!step.required && (
                  <span className="text-xs opacity-60">(Optional)</span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </nav>
  );
}
