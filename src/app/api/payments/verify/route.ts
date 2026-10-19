import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
  }

  // Verify HMAC signature — prevents tampered payment IDs
  const body = `${razorpay_order_id}|${razorpay_payment_id}`
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
  }

  // Mark payment as paid
  const admin = createAdminClient()
  const { error } = await admin
    .from('payments')
    .update({
      razorpay_payment_id,
      razorpay_signature,
      status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('razorpay_order_id', razorpay_order_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
