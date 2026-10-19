import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const PACKAGE_PRICES: Record<string, number> = {
  complimentary: 0,
  single:        150000,   // ₹1,500 in paise
  starter:       400000,   // ₹4,000
  discovery:    1200000,   // ₹12,000
  transform:    1600000,   // ₹16,000
  full_journey: 2200000,   // ₹22,000
}

const PACKAGE_LABELS: Record<string, string> = {
  complimentary: 'Complimentary Session',
  single:        'Single Session',
  starter:       'Starter Pack (3 sessions)',
  discovery:     'Discovery (11 sessions)',
  transform:     'Transform (16 sessions)',
  full_journey:  'Full Journey (24 sessions)',
}

export async function POST(req: NextRequest) {
  // Verify the user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Get the client profile
  const { data: client } = await supabase
    .from('clients')
    .select('id, full_name, email')
    .eq('user_id', user.id)
    .single()
  if (!client) return NextResponse.json({ error: 'Client profile not found' }, { status: 404 })

  const { packageType } = await req.json()
  if (!packageType || !(packageType in PACKAGE_PRICES)) {
    return NextResponse.json({ error: 'Invalid package type' }, { status: 400 })
  }

  const amount = PACKAGE_PRICES[packageType]

  // Complimentary — no payment needed
  if (amount === 0) {
    return NextResponse.json({ free: true })
  }

  const razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  const order = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt:  `mc_${client.id.slice(0, 8)}_${Date.now()}`,
    notes: {
      client_id:    client.id,
      package_type: packageType,
    },
  })

  // Record the pending payment in DB
  const admin = createAdminClient()
  await admin.from('payments').insert({
    client_id:         client.id,
    razorpay_order_id: order.id,
    amount,
    package_type:      packageType,
    package_label:     PACKAGE_LABELS[packageType] ?? packageType,
    status:            'pending',
  })

  return NextResponse.json({
    orderId:     order.id,
    amount,
    currency:    'INR',
    packageType,
    packageLabel: PACKAGE_LABELS[packageType],
    clientName:  client.full_name,
    clientEmail: client.email ?? '',
  })
}
