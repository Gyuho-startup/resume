import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useDebounce } from './useDebounce';
import type { Resume, ResumeData } from '@/types/resume';
import { emptyResumeData } from '@/lib/sample-data';

const STORAGE_KEY = 'uk-resume-builder:draft';

/**
 * Hook for managing resume builder state
 * Handles guest LocalStorage autosave with debouncing
 */
export function useResumeBuilder() {
  const [resume, setResume] = useLocalStorage<Resume>(STORAGE_KEY, {
    title: 'My CV',
    country: 'UK',
    templateSlug: 'education-first',
    data: emptyResumeData,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Debounce resume changes for autosave
  const debouncedResume = useDebounce(resume, 2000); // 2 second delay

  // Auto-save to localStorage when debounced value changes
  useEffect(() => {
    if (debouncedResume) {
      setIsSaving(true);
      // Simulate save delay
      const timer = setTimeout(() => {
        setLastSaved(new Date());
        setIsSaving(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [debouncedResume]);

  const updateResume = (updates: Partial<Resume>) => {
    setResume((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const updateResumeData = (updates: Partial<ResumeData>) => {
    setResume((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        ...updates,
      },
    }));
  };

  const clearDraft = () => {
    setResume({
      title: 'My CV',
      country: 'UK',
      templateSlug: 'education-first',
      data: emptyResumeData,
    });
    setLastSaved(null);
  };

  return {
    resume,
    setResume,
    updateResume,
    updateResumeData,
    clearDraft,
    isSaving,
    lastSaved,
  };
}
