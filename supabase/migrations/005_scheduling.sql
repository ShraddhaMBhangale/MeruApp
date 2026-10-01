-- ============================================================
-- 005 — Phase 2: Scheduling fields
-- Run in Supabase SQL editor after 004_form1_enquiry.sql
-- ============================================================

-- Add time and duration to sessions
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS session_time     time;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS duration_minutes integer NOT NULL DEFAULT 60;

-- Package type on clients (replaces total_sessions_planned for display)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS package_type text
  CHECK (package_type IN ('free', '1', '3', '11', '16', '24', 'custom'));

-- Practitioner availability slots (for future self-booking)
CREATE TABLE IF NOT EXISTS public.availability_slots (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week  integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun
  start_time   time NOT NULL,
  end_time     time NOT NULL,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "practitioner_all_availability" ON public.availability_slots FOR ALL
  USING  (auth.jwt() -> 'app_metadata' ->> 'role' = 'practitioner')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'practitioner');
