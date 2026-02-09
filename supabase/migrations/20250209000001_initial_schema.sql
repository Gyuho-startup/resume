-- UK Resume Builder MVP - Initial Schema
-- Migration: 20250209000001_initial_schema.sql
-- Description: Core tables for resume builder, templates, exports, and purchases

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TEMPLATES TABLE (Public)
-- ============================================================================
-- ATS-friendly CV templates available to all users
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    is_ats_safe BOOLEAN DEFAULT true NOT NULL,
    version TEXT DEFAULT '1.0',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for performance
CREATE INDEX idx_templates_slug ON public.templates(slug);
CREATE INDEX idx_templates_display_order ON public.templates(display_order);

-- ============================================================================
-- RESUMES TABLE (User-owned)
-- ============================================================================
-- Stores resume data for logged-in users only (guests use LocalStorage)
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    role_slug TEXT,
    country TEXT DEFAULT 'UK' NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX idx_resumes_role_slug ON public.resumes(role_slug);
CREATE INDEX idx_resumes_updated_at ON public.resumes(updated_at DESC);

-- ============================================================================
-- RESUME_VERSIONS TABLE (User-owned, optional)
-- ============================================================================
-- Version history for resumes (recommended for undo/history features)
CREATE TABLE IF NOT EXISTS public.resume_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_resume_versions_resume_id ON public.resume_versions(resume_id);
CREATE INDEX idx_resume_versions_user_id ON public.resume_versions(user_id);
CREATE INDEX idx_resume_versions_created_at ON public.resume_versions(created_at DESC);

-- ============================================================================
-- EXPORTS TABLE (User-owned)
-- ============================================================================
-- Tracks PDF exports (metadata only for guests, full records for logged-in)
CREATE TABLE IF NOT EXISTS public.exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE RESTRICT,
    watermark BOOLEAN DEFAULT true NOT NULL,
    source TEXT CHECK (source IN ('guest', 'user')) NOT NULL,
    storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_exports_user_id ON public.exports(user_id);
CREATE INDEX idx_exports_resume_id ON public.exports(resume_id);
CREATE INDEX idx_exports_created_at ON public.exports(created_at DESC);

-- ============================================================================
-- PURCHASES TABLE (User-owned or Guest)
-- ============================================================================
-- Stripe Export Pass purchases (24h window)
-- user_id is NULLABLE to support guest purchases
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    stripe_checkout_session_id TEXT UNIQUE NOT NULL,
    stripe_payment_intent_id TEXT,
    status TEXT CHECK (status IN ('paid', 'failed', 'refunded')) DEFAULT 'paid' NOT NULL,
    pass_start_at TIMESTAMPTZ,
    pass_end_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX idx_purchases_email ON public.purchases(email);
CREATE INDEX idx_purchases_stripe_session ON public.purchases(stripe_checkout_session_id);
CREATE INDEX idx_purchases_status ON public.purchases(status);
CREATE INDEX idx_purchases_pass_window ON public.purchases(pass_start_at, pass_end_at);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON public.templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at
    BEFORE UPDATE ON public.resumes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at
    BEFORE UPDATE ON public.purchases
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- SEED DATA: 5 ATS-FRIENDLY TEMPLATES
-- ============================================================================
INSERT INTO public.templates (name, slug, description, is_ats_safe, version, display_order) VALUES
    ('Education-First', 'education-first', 'Ideal for recent graduates. Highlights education and academic achievements at the top.', true, '1.0', 1),
    ('Projects-First', 'projects-first', 'Perfect for entry-level candidates with strong project portfolios. Showcases projects before experience.', true, '1.0', 2),
    ('Skills-Emphasis', 'skills-emphasis', 'Emphasizes technical and soft skills. Great for candidates with diverse skill sets.', true, '1.0', 3),
    ('Minimal Classic', 'minimal-classic', 'Traditional chronological layout. Clean and professional for any industry.', true, '1.0', 4),
    ('Modern ATS-Safe', 'modern-ats-safe', 'Contemporary design with subtle styling while maintaining ATS compatibility.', true, '1.0', 5)
ON CONFLICT (slug) DO NOTHING;
