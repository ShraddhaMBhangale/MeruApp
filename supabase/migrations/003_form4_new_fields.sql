-- ============================================================
-- 003 — Add new Form 4 fields
-- Run in Supabase SQL editor after 002_fix_column_mismatches.sql
-- ============================================================

ALTER TABLE public.form4_sessions ADD COLUMN IF NOT EXISTS occiput_internal       text;
ALTER TABLE public.form4_sessions ADD COLUMN IF NOT EXISTS occiput_external       text;
ALTER TABLE public.form4_sessions ADD COLUMN IF NOT EXISTS reorganisational_levels jsonb default '{}';
ALTER TABLE public.form4_sessions ADD COLUMN IF NOT EXISTS time_taken_minutes     integer;
ALTER TABLE public.form4_sessions ADD COLUMN IF NOT EXISTS contact_types          jsonb default '{}';
ALTER TABLE public.form4_sessions ADD COLUMN IF NOT EXISTS contacts_used          text;
ALTER TABLE public.form4_sessions ADD COLUMN IF NOT EXISTS add_ons               text;
ALTER TABLE public.form4_sessions ADD COLUMN IF NOT EXISTS sri_used              boolean;
