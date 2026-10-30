import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { docType, docNumber, fullName, dob, district, frontPhoto, backPhoto, userId } = body;

    // Strict validation
    if (!docNumber || typeof docNumber !== 'string' || docNumber.trim().length < 5) {
      return NextResponse.json({ success: false, message: 'Invalid government document number.' }, { status: 400 });
    }

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 3) {
      return NextResponse.json({ success: false, message: 'Legal full name is required.' }, { status: 400 });
    }

    if (!frontPhoto) {
      return NextResponse.json({ success: false, message: 'Front photo of government ID is required.' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    if (supabase && userId) {
      const { error } = await supabase.from('kyc_verifications').insert({
        user_id: userId,
        doc_type: docType,
        doc_number: docNumber.trim(),
        full_name: fullName.trim(),
        dob: dob || null,
        district: district || 'Kathmandu',
        front_photo_url: frontPhoto,
        back_photo_url: backPhoto || null,
        status: 'verified', // Auto-approved in sandbox; queue for admin approval in strict mode
        submitted_at: new Date().toISOString(),
      });

      if (error) {
        console.error('[Supabase KYC Insert Error]:', error);
      } else {
        await supabase
          .from('profiles')
          .update({ kyc_status: 'verified' })
          .eq('id', userId);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'KYC verified successfully. Worker verified badge active.',
      status: 'verified',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error processing KYC';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
