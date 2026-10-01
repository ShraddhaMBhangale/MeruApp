-- ============================================================
-- 002 — Fix column name mismatches between schema and code
-- Run this in Supabase SQL editor (after 001_initial_schema.sql)
-- ============================================================

-- ---- CLIENTS ----
-- Rename columns to match what the server action inserts
ALTER TABLE public.clients RENAME COLUMN phone TO mobile;
ALTER TABLE public.clients RENAME COLUMN emergency_name TO emergency_contact_name;
ALTER TABLE public.clients RENAME COLUMN emergency_phone TO emergency_contact_phone;
ALTER TABLE public.clients RENAME COLUMN emergency_relation TO emergency_contact_relationship;

-- Add columns missing from initial schema
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS blood_group text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS educational_qualification text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS referral_source text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS had_sessions_before boolean not null default false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS previous_sessions_count integer;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS profile_photo_url text;

-- ---- FORM 2 CONSENT ----
-- Add minor guardian fields used by practitioner form
ALTER TABLE public.form2_consent ADD COLUMN IF NOT EXISTS guardian_name text;
ALTER TABLE public.form2_consent ADD COLUMN IF NOT EXISTS guardian_relationship text;

-- ---- FORM 3 CASE HISTORY ----
-- Rename practitioner_signature → client_signature_data (it is the client who signs)
ALTER TABLE public.form3_case_history RENAME COLUMN practitioner_signature TO client_signature_data;

-- Add lifestyle/wellness columns that the practitioner form captures
-- but have no flat column in the initial schema
ALTER TABLE public.form3_case_history ADD COLUMN IF NOT EXISTS smoking text;
ALTER TABLE public.form3_case_history ADD COLUMN IF NOT EXISTS alcohol text;
ALTER TABLE public.form3_case_history ADD COLUMN IF NOT EXISTS daily_routine text;
ALTER TABLE public.form3_case_history ADD COLUMN IF NOT EXISTS support_system text;
ALTER TABLE public.form3_case_history ADD COLUMN IF NOT EXISTS hobbies text;
