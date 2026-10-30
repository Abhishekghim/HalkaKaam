import { NextResponse } from 'next/server';

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || 'live_secret_key_68ed922f7b164ebc86d815680149e67b';
const KHALTI_API_URL = process.env.NODE_ENV === 'production' && process.env.KHALTI_LIVE === 'true'
  ? 'https://khalti.com/api/v2/epayment/initiate/'
  : 'https://a.khalti.com/api/v2/epayment/initiate/';

export async function POST(req: Request) {
  try {
    const { amount, jobId, bidId, customerName, customerPhone } = await req.json();

    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const amountInPaisa = Math.round(Number(amount) * 100);

    const payload = {
      return_url: `${origin}/api/payments/khalti?bidId=${bidId}`,
      website_url: origin,
      amount: amountInPaisa,
      purchase_order_id: `HK-JOB-${jobId || 'demo'}-${Date.now()}`,
      purchase_order_name: `Sajha Kaam Task Payment`,
      customer_info: {
        name: customerName || 'Sajha Kaam Host',
        email: 'host@sajhakaam.com',
        phone: customerPhone || '9800000000',
      },
    };

    // If live API key is available, call Khalti API
    if (process.env.KHALTI_SECRET_KEY) {
      const resp = await fetch(KHALTI_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      return NextResponse.json(data);
    }

    // Fallback sandbox simulation response for instant pitch/testing
    return NextResponse.json({
      success: true,
      pidx: `test_pidx_${Date.now()}`,
      payment_url: `${origin}?payment=simulated_khalti&amount=${amount}`,
      expires_at: new Date(Date.now() + 1800000).toISOString(),
      expires_in: 1800,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error initiating Khalti payment';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pidx = url.searchParams.get('pidx');
  const status = url.searchParams.get('status');

  if (status === 'User canceled' || !pidx) {
    return NextResponse.redirect(`${url.origin}?payment=cancelled`);
  }

  return NextResponse.redirect(`${url.origin}?payment=success&pidx=${pidx}`);
}

