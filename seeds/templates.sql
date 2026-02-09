-- UK Resume Builder MVP - Template Seed Data
-- Created: 2026-02-09
-- Description: Initial ATS-friendly resume templates

-- Clear existing templates (optional, for development)
-- TRUNCATE TABLE templates CASCADE;

-- Insert 5 ATS-friendly templates
INSERT INTO templates (id, name, description, is_ats_safe, version) VALUES

-- Template 1: Education-First
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Education-First',
  'Perfect for students and recent graduates with limited work experience. Highlights academic achievements, coursework, and projects. Single-column layout with clear section headings. Optimized for ATS scanning.',
  true,
  '1.0'
),

-- Template 2: Projects-First
(
  '550e8400-e29b-41d4-a716-446655440002',
  'Projects-First',
  'Showcases hands-on projects and technical work at the top. Ideal for entry-level developers, designers, and makers. Emphasizes practical skills through project descriptions. ATS-friendly single-column design.',
  true,
  '1.0'
),

-- Template 3: Skills-Emphasis
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Skills-Emphasis',
  'Highlights technical and soft skills prominently. Great for career changers and bootcamp graduates. Features a dedicated skills section at the top. Clean, scannable layout for ATS systems.',
  true,
  '1.0'
),

-- Template 4: Minimal Classic
(
  '550e8400-e29b-41d4-a716-446655440004',
  'Minimal Classic',
  'Timeless, professional design with maximum readability. Traditional chronological layout starting with experience. Suitable for all industries and roles. Guaranteed ATS compatibility with zero decorative elements.',
  true,
  '1.0'
),

-- Template 5: Modern ATS-Safe
(
  '550e8400-e29b-41d4-a716-446655440005',
  'Modern ATS-Safe',
  'Contemporary design with subtle styling while maintaining ATS compatibility. Balanced layout with clear visual hierarchy. Uses modern typography and spacing. Perfect blend of aesthetics and functionality.',
  true,
  '1.0'
);

-- Verify insert
SELECT
  id,
  name,
  is_ats_safe,
  version,
  created_at
FROM templates
ORDER BY name;
