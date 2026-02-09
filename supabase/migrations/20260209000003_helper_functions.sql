-- UK Resume Builder MVP - Helper Functions
-- Created: 2026-02-09
-- Description: Utility functions for purchase validation and data management

-- =============================================================================
-- FUNCTION: Check if user has active export pass
-- =============================================================================
CREATE OR REPLACE FUNCTION has_active_export_pass(check_user_id UUID, check_email TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check for logged-in user by user_id
  IF check_user_id IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM purchases
      WHERE user_id = check_user_id
        AND status = 'paid'
        AND pass_start_at IS NOT NULL
        AND pass_end_at IS NOT NULL
        AND now() >= pass_start_at
        AND now() <= pass_end_at
    );
  END IF;

  -- Check for guest user by email
  IF check_email IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM purchases
      WHERE email = check_email
        AND user_id IS NULL
        AND status = 'paid'
        AND pass_start_at IS NOT NULL
        AND pass_end_at IS NOT NULL
        AND now() >= pass_start_at
        AND now() <= pass_end_at
    );
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FUNCTION: Get active export pass details
-- =============================================================================
CREATE OR REPLACE FUNCTION get_active_export_pass(check_user_id UUID, check_email TEXT DEFAULT NULL)
RETURNS TABLE (
  purchase_id UUID,
  pass_start_at TIMESTAMPTZ,
  pass_end_at TIMESTAMPTZ,
  remaining_seconds INTEGER
) AS $$
BEGIN
  -- Check for logged-in user by user_id
  IF check_user_id IS NOT NULL THEN
    RETURN QUERY
    SELECT
      p.id,
      p.pass_start_at,
      p.pass_end_at,
      EXTRACT(EPOCH FROM (p.pass_end_at - now()))::INTEGER as remaining_seconds
    FROM purchases p
    WHERE p.user_id = check_user_id
      AND p.status = 'paid'
      AND p.pass_start_at IS NOT NULL
      AND p.pass_end_at IS NOT NULL
      AND now() >= p.pass_start_at
      AND now() <= p.pass_end_at
    ORDER BY p.pass_end_at DESC
    LIMIT 1;
    RETURN;
  END IF;

  -- Check for guest user by email
  IF check_email IS NOT NULL THEN
    RETURN QUERY
    SELECT
      p.id,
      p.pass_start_at,
      p.pass_end_at,
      EXTRACT(EPOCH FROM (p.pass_end_at - now()))::INTEGER as remaining_seconds
    FROM purchases p
    WHERE p.email = check_email
      AND p.user_id IS NULL
      AND p.status = 'paid'
      AND p.pass_start_at IS NOT NULL
      AND p.pass_end_at IS NOT NULL
      AND now() >= p.pass_start_at
      AND now() <= p.pass_end_at
    ORDER BY p.pass_end_at DESC
    LIMIT 1;
    RETURN;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FUNCTION: Create resume version snapshot
-- =============================================================================
CREATE OR REPLACE FUNCTION create_resume_version_snapshot(
  p_resume_id UUID,
  p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_resume_data JSONB;
  v_version_id UUID;
BEGIN
  -- Get current resume data
  SELECT data INTO v_resume_data
  FROM resumes
  WHERE id = p_resume_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Resume not found or access denied';
  END IF;

  -- Insert version snapshot
  INSERT INTO resume_versions (resume_id, user_id, data)
  VALUES (p_resume_id, p_user_id, v_resume_data)
  RETURNING id INTO v_version_id;

  RETURN v_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FUNCTION: Clean up old resume versions (keep last N)
-- =============================================================================
CREATE OR REPLACE FUNCTION cleanup_old_resume_versions(
  p_resume_id UUID,
  p_keep_count INTEGER DEFAULT 10
)
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  WITH versions_to_keep AS (
    SELECT id
    FROM resume_versions
    WHERE resume_id = p_resume_id
    ORDER BY created_at DESC
    LIMIT p_keep_count
  )
  DELETE FROM resume_versions
  WHERE resume_id = p_resume_id
    AND id NOT IN (SELECT id FROM versions_to_keep);

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON FUNCTION has_active_export_pass IS 'Check if user or guest has an active 24-hour export pass';
COMMENT ON FUNCTION get_active_export_pass IS 'Get active export pass details including remaining time';
COMMENT ON FUNCTION create_resume_version_snapshot IS 'Create a version snapshot of a resume';
COMMENT ON FUNCTION cleanup_old_resume_versions IS 'Delete old resume versions, keeping only the most recent N versions';
