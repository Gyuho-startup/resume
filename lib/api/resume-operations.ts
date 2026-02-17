import { createBrowserClient } from '@supabase/ssr';
import type { Resume, ResumeData, ResumeSectionKey } from '@/types/resume';
import { DEFAULT_SECTION_ORDER } from '@/lib/section-order';

/**
 * Save resume to Supabase
 */
export async function saveResume(resume: Resume, userId: string): Promise<{ id: string } | null> {
  try {
    // Use untyped client to avoid type inference issues
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Persist sectionOrder inside the JSONB data blob
    const dataWithOrder = { ...resume.data, sectionOrder: resume.sectionOrder };

    // Check if resume already exists
    if (resume.id) {
      // Update existing resume
      const { data, error } = await supabase
        .from('resumes')
        .update({
          title: resume.title,
          role_slug: resume.roleSlug || null,
          template_slug: resume.templateSlug,
          data: dataWithOrder as any,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', resume.id)
        .eq('user_id', userId)
        .select('id')
        .single();

      if (error) {
        console.error('Error updating resume:', error);
        return null;
      }

      return data;
    } else {
      // Create new resume
      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: userId,
          title: resume.title,
          role_slug: resume.roleSlug || null,
          country: resume.country,
          template_slug: resume.templateSlug,
          data: dataWithOrder as any,
        } as any)
        .select('id')
        .single();

      if (error) {
        console.error('Error creating resume:', error);
        return null;
      }

      return data;
    }
  } catch (error) {
    console.error('Error saving resume:', error);
    return null;
  }
}

/**
 * Load resume from Supabase
 */
export async function loadResume(resumeId: string, userId: string): Promise<Resume | null> {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .eq('user_id', userId)
        .single();

    if (error || !data) {
      console.error('Error loading resume:', error);
      return null;
    }

    const resumeData = data.data as ResumeData & { sectionOrder?: ResumeSectionKey[] };
    // Backward compat: existing resumes without sectionOrder fall back to default
    const sectionOrder: ResumeSectionKey[] = resumeData.sectionOrder ?? DEFAULT_SECTION_ORDER;

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      roleSlug: data.role_slug,
      country: data.country,
      templateSlug: data.template_slug,
      sectionOrder,
      data: resumeData,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error loading resume:', error);
    return null;
  }
}

/**
 * Log export to database
 */
export async function logExport(
  resumeId: string,
  userId: string,
  templateId: string,
  watermark: boolean
): Promise<void> {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase.from('exports').insert({
      user_id: userId,
      resume_id: resumeId,
      template_id: templateId,
      watermark,
      source: 'user',
    });
  } catch (error) {
    console.error('Error logging export:', error);
  }
}
