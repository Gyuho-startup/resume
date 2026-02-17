'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Stepper from '@/components/builder/Stepper';
import PersonalInfoForm from '@/components/builder/PersonalInfoForm';
import EducationForm from '@/components/builder/EducationForm';
import ExperienceForm from '@/components/builder/ExperienceForm';
import ProjectsForm from '@/components/builder/ProjectsForm';
import SkillsForm from '@/components/builder/SkillsForm';
import CertificationsForm from '@/components/builder/CertificationsForm';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import ExportButton from '@/components/builder/ExportButton';
import SectionReorderPanel from '@/components/builder/SectionReorderPanel';
import TemplatePickerPanel from '@/components/builder/TemplatePickerPanel';
import Header from '@/components/layout/Header';
import { useResumeBuilder } from '@/lib/hooks/useResumeBuilder';
import { useAuth } from '@/lib/contexts/AuthContext';
import { DEFAULT_SECTION_ORDER } from '@/lib/section-order';
import { analytics } from '@/lib/analytics';
import type { BuilderStep, ResumeSectionKey, TemplateSlug } from '@/types/resume';

function BuilderContent() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('resume');
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<BuilderStep>('personal');
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => { analytics.startBuilder(); }, []);
  const { resume, updateResume, updateResumeData, isSaving, lastSaved, isLoading, isLoggedIn } =
    useResumeBuilder(resumeId || undefined);

  const handlePersonalInfoSave = (data: typeof resume.data.personal) => {
    updateResumeData({ personal: data });
  };

  const handleSummarySave = (summaryText: string) => {
    updateResumeData({ summary: summaryText });
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

  const handleSectionOrderChange = (newOrder: ResumeSectionKey[]) => {
    updateResume({ sectionOrder: newOrder });
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
      <Header />

      {/* Builder Status Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3 text-sm min-w-0">
            <p className="text-slate-600 whitespace-nowrap">
              {isLoading ? (
                <span className="text-blue-600">Loading...</span>
              ) : isSaving ? (
                <span className="text-blue-600">Saving...</span>
              ) : lastSaved ? (
                <span className="text-green-600">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              ) : (
                <span className="text-slate-400">Not saved</span>
              )}
            </p>
            {!isLoggedIn && (
              <span className="hidden sm:block text-slate-500 text-xs truncate">
                Sign in to save your progress
              </span>
            )}
          </div>
          <div className="flex-shrink-0">
            <ExportButton
              resume={resume}
              userEmail={user?.email}
              userId={user?.id}
              compact
            />
          </div>
        </div>
      </div>

      {/* Stepper */}
      <Stepper currentStep={currentStep} onStepChange={setCurrentStep} />

      {/* Mobile: Edit / Preview tab switcher */}
      <div className="lg:hidden bg-white border-b border-slate-200">
        <div className="flex">
          <button
            onClick={() => setMobileTab('edit')}
            className={`flex-1 py-2.5 text-sm font-medium transition border-b-2 ${
              mobileTab === 'edit'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2.5 text-sm font-medium transition border-b-2 ${
              mobileTab === 'preview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Main Content: Form + Preview */}
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Form — hidden on mobile when preview tab active */}
          <div className={`bg-white rounded-lg shadow p-4 lg:p-6 ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}>
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
                summary={resume.data.summary}
                onSave={handlePersonalInfoSave}
                onSummarySave={handleSummarySave}
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
              <div className="space-y-4">
                <TemplatePickerPanel
                  selectedSlug={resume.templateSlug}
                  onSelect={(slug: TemplateSlug) => updateResume({ templateSlug: slug })}
                  resumeData={resume.data}
                  sectionOrder={resume.sectionOrder ?? DEFAULT_SECTION_ORDER}
                />

                <SectionReorderPanel
                  order={resume.sectionOrder ?? DEFAULT_SECTION_ORDER}
                  onChange={handleSectionOrderChange}
                />

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
          {/* Desktop: always visible sticky panel */}
          {/* Mobile: shown only when preview tab is active */}
          <div className={`lg:sticky lg:top-6 h-fit ${mobileTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
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
                  {mounted && (
                    <TemplateRenderer
                      templateSlug={resume.templateSlug}
                      data={resume.data}
                      sectionOrder={resume.sectionOrder ?? DEFAULT_SECTION_ORDER}
                      watermark={true}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-lg text-slate-600">Loading builder...</div>
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
