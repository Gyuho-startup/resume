'use client';

import { useState } from 'react';
import Stepper from '@/components/builder/Stepper';
import PersonalInfoForm from '@/components/builder/PersonalInfoForm';
import EducationForm from '@/components/builder/EducationForm';
import ExperienceForm from '@/components/builder/ExperienceForm';
import ProjectsForm from '@/components/builder/ProjectsForm';
import SkillsForm from '@/components/builder/SkillsForm';
import CertificationsForm from '@/components/builder/CertificationsForm';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import ExportButton from '@/components/builder/ExportButton';
import { useResumeBuilder } from '@/lib/hooks/useResumeBuilder';
import type { BuilderStep } from '@/types/resume';

export default function BuilderPage() {
  const [currentStep, setCurrentStep] = useState<BuilderStep>('personal');
  const { resume, updateResumeData, isSaving, lastSaved } = useResumeBuilder();

  const handlePersonalInfoSave = (data: typeof resume.data.personal) => {
    updateResumeData({ personal: data });
  };

  const handleEducationSave = (data: typeof resume.data.education) => {
    updateResumeData({ education: data });
  };

  const handleExperienceSave = (data: typeof resume.data.experience) => {
    updateResumeData({ experience: data });
  };

  const handleProjectsSave = (data: typeof resume.data.projects) => {
    updateResumeData({ projects: data });
  };

  const handleSkillsSave = (data: typeof resume.data.skills) => {
    updateResumeData({ skills: data });
  };

  const handleCertificationsSave = (data: typeof resume.data.certifications) => {
    updateResumeData({ certifications: data });
  };

  const handleNextStep = () => {
    const steps: BuilderStep[] = [
      'personal',
      'education',
      'experience',
      'projects',
      'skills',
      'certifications',
      'review',
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBackStep = () => {
    const steps: BuilderStep[] = [
      'personal',
      'education',
      'experience',
      'projects',
      'skills',
      'certifications',
      'review',
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">CV Builder</h1>
            <p className="text-sm text-slate-600">
              {isSaving ? (
                <span className="text-blue-600">Saving...</span>
              ) : lastSaved ? (
                <span className="text-green-600">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              ) : (
                'Not saved yet'
              )}
            </p>
          </div>
          <ExportButton resume={resume} />
        </div>
      </header>

      {/* Stepper */}
      <Stepper currentStep={currentStep} onStepChange={setCurrentStep} />

      {/* Main Content: Form + Preview */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {currentStep === 'personal' && 'Personal Information'}
              {currentStep === 'education' && 'Education'}
              {currentStep === 'experience' && 'Work Experience'}
              {currentStep === 'projects' && 'Projects'}
              {currentStep === 'skills' && 'Skills'}
              {currentStep === 'certifications' && 'Certifications'}
              {currentStep === 'review' && 'Review & Export'}
            </h2>

            {currentStep === 'personal' && (
              <PersonalInfoForm
                initialData={resume.data.personal}
                onSave={handlePersonalInfoSave}
                onNext={handleNextStep}
              />
            )}

            {currentStep === 'education' && (
              <EducationForm
                initialData={resume.data.education}
                onSave={handleEducationSave}
                onNext={handleNextStep}
                onBack={handleBackStep}
              />
            )}

            {currentStep === 'experience' && (
              <ExperienceForm
                initialData={resume.data.experience}
                onSave={handleExperienceSave}
                onNext={handleNextStep}
                onBack={handleBackStep}
              />
            )}

            {currentStep === 'projects' && (
              <ProjectsForm
                initialData={resume.data.projects}
                onSave={handleProjectsSave}
                onNext={handleNextStep}
                onBack={handleBackStep}
              />
            )}

            {currentStep === 'skills' && (
              <SkillsForm
                initialData={resume.data.skills}
                onSave={handleSkillsSave}
                onNext={handleNextStep}
                onBack={handleBackStep}
              />
            )}

            {currentStep === 'certifications' && (
              <CertificationsForm
                initialData={resume.data.certifications || []}
                onSave={handleCertificationsSave}
                onNext={handleNextStep}
                onBack={handleBackStep}
              />
            )}

            {currentStep === 'review' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    Ready to Export!
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Review your CV in the preview panel on the right, then export to PDF.
                  </p>
                  <ExportButton resume={resume} />
                </div>

                <div className="pt-6 border-t border-slate-200">
                  <button
                    onClick={handleBackStep}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
                  >
                    ← Back to Edit
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Live Preview */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Live Preview
              </h3>
              <div className="border border-slate-200 rounded overflow-hidden">
                <div
                  id="pdf-preview-container"
                  data-pdf-preview
                  className="scale-50 origin-top-left"
                  style={{ width: '200%' }}
                >
                  <TemplateRenderer
                    templateSlug={resume.templateSlug}
                    data={resume.data}
                    watermark={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
