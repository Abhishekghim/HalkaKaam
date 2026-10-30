import { NextResponse } from 'next/server';
import crypto from 'crypto';

// eSewa ePay v2 credentials (defaults to official eSewa test merchant for testing/pitching)
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
const ESEWA_FORM_URL = process.env.NODE_ENV === 'production' && process.env.ESEWA_LIVE === 'true'
  ? 'https://epay.esewa.com.np/api/epay/main/v2/form'
  : 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

export async function POST(req: Request) {
  try {
    const { action, amount, jobId, bidId } = await req.json();

    if (action === 'initiate') {
      const transactionUuid = `HK-${jobId || 'demo'}-${Date.now()}`;
      const totalAmount = Number(amount).toFixed(2);

      // Signature data for eSewa v2: "total_amount=...,transaction_uuid=...,product_code=..."
      const signatureData = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
      
      const signature = crypto
        .createHmac('sha256', ESEWA_SECRET_KEY)
        .update(signatureData)
        .digest('base64');

      return NextResponse.json({
        success: true,
        gateway: 'esewa',
        formUrl: ESEWA_FORM_URL,
        payload: {
          amount: totalAmount,
          tax_amount: '0',
          total_amount: totalAmount,
          transaction_uuid: transactionUuid,
          product_code: ESEWA_PRODUCT_CODE,
          product_service_charge: '0',
          product_delivery_charge: '0',
          success_url: `${req.headers.get('origin') || 'http://localhost:3000'}/api/payments/esewa?status=success&bidId=${bidId}`,
          failure_url: `${req.headers.get('origin') || 'http://localhost:3000'}/api/payments/esewa?status=failure`,
          signed_field_names: 'total_amount,transaction_uuid,product_code',
          signature,
        },
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error initiating eSewa payment';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const encodedData = url.searchParams.get('data');

  if (!encodedData) {
    return NextResponse.redirect(`${url.origin}?payment=cancelled`);
  }

  try {
    // Decode base64 response from eSewa
    const decodedStr = Buffer.from(encodedData, 'base64').toString('utf-8');
    const paymentData = JSON.parse(decodedStr);

    if (paymentData.status === 'COMPLETE') {
      return NextResponse.redirect(`${url.origin}?payment=success&ref=${paymentData.transaction_code}`);
    } else {
      return NextResponse.redirect(`${url.origin}?payment=failed`);
    }
  } catch {
    return NextResponse.redirect(`${url.origin}?payment=error`);
  }
}
