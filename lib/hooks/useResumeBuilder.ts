import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useDebounce } from './useDebounce';
import { useAuth } from '@/lib/contexts/AuthContext';
import { saveResume, loadResume } from '@/lib/api/resume-operations';
import type { Resume, ResumeData } from '@/types/resume';
import { emptyResumeData } from '@/lib/sample-data';
import { DEFAULT_SECTION_ORDER } from '@/lib/section-order';

const STORAGE_KEY = 'uk-resume-builder:draft';

/**
 * Hook for managing resume builder state
 * Guest: LocalStorage autosave with debouncing
 * Logged-in: Supabase autosave with debouncing
 */
export function useResumeBuilder(resumeId?: string) {
  const { user } = useAuth();
  const [resume, setResume] = useLocalStorage<Resume>(STORAGE_KEY, {
    title: 'My CV',
    country: 'UK',
    templateSlug: 'education-first',
    sectionOrder: DEFAULT_SECTION_ORDER,
    data: emptyResumeData,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load resume from Supabase if resumeId is provided and user is logged in
  useEffect(() => {
    const loadExistingResume = async () => {
      if (resumeId && user) {
        setIsLoading(true);
        try {
          const loadedResume = await loadResume(resumeId, user.id);
          if (loadedResume) {
            setResume(loadedResume);
            setLastSaved(new Date(loadedResume.updatedAt || loadedResume.createdAt || ''));
          }
        } catch (error) {
          console.error('Failed to load resume:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadExistingResume();
  }, [resumeId, user]);

  // Debounce resume changes for autosave
  const debouncedResume = useDebounce(resume, 2000); // 2 second delay

  // Auto-save: localStorage for guests, Supabase for logged-in users
  useEffect(() => {
    const autoSave = async () => {
      if (!debouncedResume) return;

      setIsSaving(true);

      try {
        if (user) {
          // Save to Supabase for logged-in users
          const result = await saveResume(debouncedResume, user.id);
          if (result) {
            // Update resume ID if it's a new resume
            if (!debouncedResume.id && result.id) {
              setResume((prev) => ({ ...prev, id: result.id }));
            }
            setLastSaved(new Date());
          }
        } else {
          // For guest users, localStorage is already handled by useLocalStorage
          // Just update the lastSaved indicator
          const timer = setTimeout(() => {
            setLastSaved(new Date());
          }, 200);
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    };

    autoSave();
  }, [debouncedResume, user]);

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
      sectionOrder: DEFAULT_SECTION_ORDER,
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
    isLoading,
    isLoggedIn: !!user,
  };
}
