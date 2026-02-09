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

  return (
    <nav className="bg-white border-b border-slate-200 px-4 py-3">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between overflow-x-auto">
          {STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < currentIndex;
            const isAccessible = index <= currentIndex + 1;

            return (
              <button
                key={step.id}
                onClick={() => isAccessible && onStepChange(step.id)}
                disabled={!isAccessible}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition whitespace-nowrap ${
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
