-- Migration 007: Add is_donation_client flag to clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_donation_client BOOLEAN NOT NULL DEFAULT FALSE;
