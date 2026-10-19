-- Migration 006: Payments table for Razorpay integration

CREATE TABLE payments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id            UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  razorpay_order_id    TEXT NOT NULL UNIQUE,
  razorpay_payment_id  TEXT,
  razorpay_signature   TEXT,
  amount               INTEGER NOT NULL,     -- in paise (INR × 100)
  currency             TEXT NOT NULL DEFAULT 'INR',
  package_type         TEXT NOT NULL,
  package_label        TEXT,
  status               TEXT NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending','paid','failed','refunded')),
  notes                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at              TIMESTAMPTZ
);

-- Indexes
CREATE INDEX payments_client_id_idx ON payments (client_id);
CREATE INDEX payments_status_idx    ON payments (status);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Clients can view their own payments
CREATE POLICY "clients_view_own_payments" ON payments
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- Practitioner (authenticated, not a client) can view all payments
CREATE POLICY "practitioner_view_all_payments" ON payments
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    auth.uid() NOT IN (SELECT user_id FROM clients WHERE user_id IS NOT NULL)
  );

-- Service role can insert / update (used by API routes with service key)
CREATE POLICY "service_insert_payments" ON payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "service_update_payments" ON payments
  FOR UPDATE USING (true);
