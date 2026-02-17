-- Migration: Convert ResumeProject.description → ResumeProject.highlights
-- This is a breaking schema change for HR-quality bullet points

-- BEFORE: {"name": "Project", "description": "I built a website..."}
-- AFTER:  {"name": "Project", "highlights": ["Built website using React", "Served 500+ users"]}

-- Step 1: Update existing resumes to convert description → highlights array
UPDATE public.resumes
SET data = jsonb_set(
  data,
  '{projects}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN project ? 'description' THEN
          -- Convert description string to highlights array
          jsonb_set(
            project - 'description',
            '{highlights}',
            jsonb_build_array(project->>'description')
          )
        WHEN project ? 'highlights' THEN
          -- Already has highlights, keep as-is
          project
        ELSE
          -- No description or highlights, add empty highlights array
          jsonb_set(project, '{highlights}', '[]'::jsonb)
      END
    )
    FROM jsonb_array_elements(data->'projects') AS project
  ),
  true
)
WHERE data ? 'projects'
  AND jsonb_typeof(data->'projects') = 'array'
  AND (
    -- Only update if at least one project has old structure
    EXISTS (
      SELECT 1
      FROM jsonb_array_elements(data->'projects') AS proj
      WHERE proj ? 'description'
    )
  );

-- Step 2: Verify migration
DO $$
DECLARE
  total_resumes INTEGER;
  migrated_resumes INTEGER;
  old_format_count INTEGER;
BEGIN
  -- Count total resumes with projects
  SELECT COUNT(*)
  INTO total_resumes
  FROM public.resumes
  WHERE data ? 'projects'
    AND jsonb_typeof(data->'projects') = 'array';

  -- Count resumes that now have highlights
  SELECT COUNT(*)
  INTO migrated_resumes
  FROM public.resumes,
       jsonb_array_elements(data->'projects') AS proj
  WHERE data ? 'projects'
    AND jsonb_typeof(data->'projects') = 'array'
    AND proj ? 'highlights';

  -- Count resumes still with old format
  SELECT COUNT(DISTINCT resumes.id)
  INTO old_format_count
  FROM public.resumes,
       jsonb_array_elements(data->'projects') AS proj
  WHERE data ? 'projects'
    AND jsonb_typeof(data->'projects') = 'array'
    AND proj ? 'description';

  RAISE NOTICE 'Migration complete:';
  RAISE NOTICE '  Total resumes with projects: %', total_resumes;
  RAISE NOTICE '  Resumes migrated to highlights: %', migrated_resumes;
  RAISE NOTICE '  Resumes still with description: %', old_format_count;

  IF old_format_count > 0 THEN
    RAISE WARNING 'Some resumes still have old format. Migration may need review.';
  END IF;
END;
$$;

-- Step 3: Add data validation function (optional but recommended)
CREATE OR REPLACE FUNCTION public.validate_resume_projects()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Ensure all projects have highlights array (not description string)
  IF NEW.data ? 'projects' THEN
    IF EXISTS (
      SELECT 1
      FROM jsonb_array_elements(NEW.data->'projects') AS proj
      WHERE proj ? 'description'
    ) THEN
      RAISE EXCEPTION 'Projects must use "highlights" array, not "description" string';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Apply trigger to enforce new schema going forward
-- Note: Commented out to allow backward compatibility during transition
-- Uncomment after confirming all clients updated to new schema

-- CREATE TRIGGER validate_resume_projects_trigger
--   BEFORE INSERT OR UPDATE ON public.resumes
--   FOR EACH ROW
--   EXECUTE FUNCTION public.validate_resume_projects();

COMMENT ON FUNCTION public.validate_resume_projects IS 'Validates that resume projects use highlights array instead of description string';
