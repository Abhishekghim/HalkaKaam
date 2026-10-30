'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NepalDocType, KycData } from '../types';
import { compressImageFile } from '../lib/image-compress';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Camera,
  FileCheck,
  CreditCard,
  FileText,
  Car,
  Globe,
  Wand2,
  AlertCircle,
  UploadCloud,
} from 'lucide-react';

const NEPAL_DISTRICTS = [
  'Kathmandu (काठमाडौँ)',
  'Lalitpur (ललितपुर)',
  'Bhaktapur (भक्तपुर)',
  'Kaski / Pokhara (कास्की)',
  'Chitwan (चितवन)',
  'Morang / Biratnagar (मोरङ)',
  'Jhapa (झापा)',
  'Rupandehi / Butwal (रुपन्देही)',
  'Sunsari / Dharan (सुनसरी)',
  'Kavrepalanchok (काभ्रे)',
  'Makwanpur / Hetauda (मकवानपुर)',
  'Dhanusha / Janakpur (धनुषा)',
  'Banke / Nepalgunj (बाँके)',
  'Kailali / Dhangadhi (कैलाली)',
];

export const KycModal: React.FC<{ jobId?: string }> = ({ jobId }) => {
  const { lang, me, submitKyc, closeSheet, openSheet, showToast } = useApp();

  const [docType, setDocType] = useState<NepalDocType>('citizenship');
  const [docNumber, setDocNumber] = useState(me?.kycData?.docNumber || '');
  const [fullName, setFullName] = useState(me?.kycData?.fullName || me?.name || '');
  const [dob, setDob] = useState(me?.kycData?.dob || '2056-04-12');
  const [district, setDistrict] = useState(me?.kycData?.district || 'Kathmandu (काठमाडौँ)');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(me?.kycData?.frontPhoto || null);
  const [backPhoto, setBackPhoto] = useState<string | null>(me?.kycData?.backPhoto || null);
  const [consent, setConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Handle Photo File Upload with Offscreen Canvas Compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, { maxWidth: 1000, quality: 0.72 });
      if (side === 'front') setFrontPhoto(compressed);
      else setBackPhoto(compressed);
    } catch {
      showToast(lang === 'ne' ? 'तस्बिर प्रशोधन गर्न सकिएन।' : 'Could not process image.');
    } finally {
      e.target.value = '';
    }
  };

  // Quick Demo Autofill for fast testing
  const handleAutofillDemo = () => {
    setDocType('citizenship');
    setDocNumber('27-01-78-04921');
    setFullName(me?.name || 'Abhishek Ghimire');
    setDob('2056-08-15');
    setDistrict('Kathmandu (काठमाडौँ)');
    setFrontPhoto('https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80');
    setBackPhoto('https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80');
    showToast(lang === 'ne' ? 'परीक्षणको लागि नमूना नेपाली नागरिकता विवरण भरियो।' : 'Sample Nepali citizenship details loaded.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber.trim()) {
      showToast(lang === 'ne' ? 'कृपया परिचयपत्र नम्बर लेख्नुहोस्।' : 'Please enter your document number.');
      return;
    }
    if (!fullName.trim()) {
      showToast(lang === 'ne' ? 'कृपया पूरा नाम लेख्नुहोस्।' : 'Please enter your legal name.');
      return;
    }
    if (!consent) {
      showToast(lang === 'ne' ? 'कृपया सर्तहरू स्वीकार गर्नुहोस्।' : 'Please accept the declaration consent.');
      return;
    }

    setSubmitting(true);

    const data: KycData = {
      docType,
      docNumber: docNumber.trim(),
      fullName: fullName.trim(),
      dob,
      district,
      frontPhoto: frontPhoto || undefined,
      backPhoto: backPhoto || undefined,
      submittedAt: Date.now(),
      verifiedAt: Date.now(),
    };

    setTimeout(() => {
      submitKyc(data, true);
      setSubmitting(false);

      if (jobId) {
        openSheet('offerForm', { jobId });
      } else {
        closeSheet();
      }
    }, 600);
  };

  const docOptions: { type: NepalDocType; label: string; neLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { type: 'citizenship', label: 'Citizenship', neLabel: 'नागरिकता', icon: FileCheck },
    { type: 'nid', label: 'National ID (NID)', neLabel: 'राष्ट्रिय परिचयपत्र', icon: CreditCard },
    { type: 'driving_license', label: 'Driving License', neLabel: 'सवारी चालक अनुमति', icon: Car },
    { type: 'passport', label: 'Passport', neLabel: 'राहदानी', icon: Globe },
  ];

  return (
    <div className="text-[var(--fg)] pb-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4 pr-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-bold border border-[var(--primary)]/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'ne' ? 'नेपाल सरकार परिचयपत्र' : 'Nepal Government ID'}</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">
            {lang === 'ne' ? 'केवाईसी पहिचान प्रमाणीकरण' : 'Worker KYC Verification'}
          </h2>
          <p className="text-xs text-[var(--fg-muted)] mt-1 leading-relaxed">
            {lang === 'ne'
              ? 'हाइपरलोकल कामको सुरक्षा र विश्वसनीयताका लागि काममा आवेदन दिन केवाईसी अनिवार्य छ।'
              : 'To protect local hosts and workers, identity verification is required before applying for gigs.'}
          </p>
        </div>
      </div>

      {/* Info Notice about Rules */}
      <div className="p-3.5 rounded-2xl bg-[var(--warning-soft)] border border-[var(--warning)]/30 text-xs text-[var(--fg)] mb-5 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-[var(--warning)] flex-none mt-0.5" />
        <div>
          <p className="font-bold text-[var(--fg)]">
            {lang === 'ne' ? 'सुरक्षा नियम:' : 'Marketplace Safety Rule:'}
          </p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--fg-muted)]">
            {lang === 'ne'
              ? 'काम पोस्ट गर्न केवाईसी आवश्यक पर्दैन। तर कामदारका रूपमा अफर पठाउन (Apply) नेपाल सरकारको परिचयपत्र प्रमाणीकरण अनिवार्य छ।'
              : 'Posting tasks does not require KYC. However, submitting offers or pitching as a worker requires a verified Nepali document.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Document Type Selector */}
        <div>
          <label className="block text-xs font-bold text-[var(--fg)] mb-2">
            {lang === 'ne' ? 'परिचयपत्रको प्रकार छान्नुहोस्' : 'Select Document Type'}
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {docOptions.map((opt) => {
              const active = docType === opt.type;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setDocType(opt.type)}
                  className={`p-3 rounded-xl border text-left font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                    active
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                      : 'bg-[var(--surface-2)] text-[var(--fg)] border-[var(--line)] hover:border-[var(--line-hover)]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[var(--primary)]'}`} />
                  <span className="truncate">{lang === 'ne' ? opt.neLabel : opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legal Name */}
        <div>
          <label className="block text-xs font-bold text-[var(--fg)] mb-1.5">
            {lang === 'ne' ? 'कागजात अनुसार पूरा नाम' : 'Full Legal Name (as on document)'}
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Abhishek Ghimire / अभिषेक घिमिरे"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg)] text-sm font-medium focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 shadow-2xs"
          />
        </div>

        {/* Document Number & Date of Birth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[var(--fg)] mb-1.5">
              {docType === 'citizenship'
                ? (lang === 'ne' ? 'नागरिकता नम्बर' : 'Citizenship Number')
                : docType === 'nid'
                ? (lang === 'ne' ? 'राष्ट्रिय परिचयपत्र नम्बर' : 'NID Number')
                : (lang === 'ne' ? 'परिचयपत्र नम्बर' : 'Document Number')}
            </label>
            <input
              type="text"
              required
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              placeholder="e.g. 27-01-78-04921"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg)] text-sm font-medium focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 shadow-2xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--fg)] mb-1.5">
              {lang === 'ne' ? 'जन्म मिति (Date of Birth)' : 'Date of Birth (BS / AD)'}
            </label>
            <input
              type="text"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              placeholder="YYYY-MM-DD"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg)] text-sm font-medium focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 shadow-2xs font-mono"
            />
          </div>
        </div>

        {/* Issue District */}
        <div>
          <label className="block text-xs font-bold text-[var(--fg)] mb-1.5">
            {lang === 'ne' ? 'जारी भएको जिल्ला' : 'Issued District (Nepal)'}
          </label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg)] text-sm font-medium focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 shadow-2xs cursor-pointer"
          >
            {NEPAL_DISTRICTS.map((d) => (
              <option key={d} value={d} className="bg-[var(--surface)] text-[var(--fg)]">
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Document Photos Upload Box */}
        <div>
          <label className="block text-xs font-bold text-[var(--fg)] mb-2">
            {lang === 'ne' ? 'परिचयपत्रको फोटो अपलोड' : 'Upload Document Photos (Front & Back)'}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Front Photo */}
            <div className="relative border-2 border-dashed border-[var(--line)] rounded-2xl p-3 text-center bg-[var(--surface-2)] hover:border-[var(--primary)] transition-colors">
              {frontPhoto ? (
                <div className="relative">
                  <img src={frontPhoto} alt="Front" className="w-full h-24 object-cover rounded-xl" />
                  <span className="absolute bottom-1 right-1 bg-[var(--success)] text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Front
                  </span>
                </div>
              ) : (
                <label className="cursor-pointer block py-2">
                  <div className="w-9 h-9 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center mx-auto mb-1.5">
                    <Camera className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[var(--fg)] block">
                    {lang === 'ne' ? 'अगाडिको भाग' : 'Front Side'}
                  </span>
                  <span className="text-[10px] text-[var(--fg-muted)] block mt-0.5">JPG / PNG</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'front')}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Back Photo */}
            <div className="relative border-2 border-dashed border-[var(--line)] rounded-2xl p-3 text-center bg-[var(--surface-2)] hover:border-[var(--primary)] transition-colors">
              {backPhoto ? (
                <div className="relative">
                  <img src={backPhoto} alt="Back" className="w-full h-24 object-cover rounded-xl" />
                  <span className="absolute bottom-1 right-1 bg-[var(--success)] text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Back
                  </span>
                </div>
              ) : (
                <label className="cursor-pointer block py-2">
                  <div className="w-9 h-9 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center mx-auto mb-1.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[var(--fg)] block">
                    {lang === 'ne' ? 'पछाडिको भाग' : 'Back Side'}
                  </span>
                  <span className="text-[10px] text-[var(--fg-muted)] block mt-0.5">JPG / PNG</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'back')}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Declaration Checkbox */}
        <div className="flex items-start gap-2.5 pt-1">
          <input
            id="kyc-consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-[var(--primary)] focus:ring-[var(--primary)]/20 border-[var(--line)] cursor-pointer"
          />
          <label htmlFor="kyc-consent" className="text-xs text-[var(--fg-muted)] leading-relaxed cursor-pointer select-none">
            {lang === 'ne'
              ? 'म घोषणा गर्दछु कि माथि दिइएको विवरण मेरो वास्तविक नेपाली सरकारी परिचयपत्र अनुसार सत्य र सही छ।'
              : 'I declare that the details provided match my official Nepali government issued ID document.'}
          </label>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-2.5">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl bg-[var(--accent-fill)] hover:bg-[var(--accent-hover)] text-white font-extrabold text-sm transition-all shadow-[var(--shadow-cta)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>
              {submitting
                ? (lang === 'ne' ? 'प्रमाणीकरण हुँदैछ…' : 'Verifying…')
                : (lang === 'ne' ? 'केवाईसी प्रमाणित गर्नुहोस्' : 'Submit & Verify KYC')}
            </span>
          </button>

          {/* Quick Demo Fill Helper */}
          <button
            type="button"
            onClick={handleAutofillDemo}
            className="w-full py-2.5 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] hover:bg-[var(--line)] text-[var(--fg-muted)] hover:text-[var(--fg)] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Wand2 className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>{lang === 'ne' ? 'परीक्षणको लागि नमूना नागरिकता भर्नुहोस्' : 'Auto-fill sample Nepali ID (Demo)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
