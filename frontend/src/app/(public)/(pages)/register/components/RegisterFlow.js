'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UiInput from '@/app/(public)/components/UiInput';
import UiButton from '@/app/(public)/components/UiButton';

export default function RegisterFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify OTP
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ identifier: '', otp: '' });

  const getFriendlyErrorMessage = (status, data) => {
    switch (status) {
      case 429:
        return "You're moving a bit too fast! Please wait a moment before requesting another code.";
      case 401:
      case 400:
        if (step === 2)
          return "That code doesn't seem right. Please check your messages and try again.";
        return 'Please enter a valid email address or phone number to continue.';
      case 500:
        return "We're having some trouble on our end. Please try again in a few minutes.";
      default:
        return (
          data?.detail ||
          "We couldn't complete this step. Please check your connection and try again."
        );
    }
  };

  const handleRequestOtp = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const isEmail = formData.identifier.includes('@');
    const payload = isEmail
      ? { email: formData.identifier }
      : { phone: formData.identifier };
    try {
      const response = await fetch(
        'http://localhost:8000/api/auth/request-otp/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(getFriendlyErrorMessage(response.status, data));
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const isEmail = formData.identifier.includes('@');
    const payload = {
      [isEmail ? 'email' : 'phone']: formData.identifier,
      otp: formData.otp,
    };
    try {
      const response = await fetch(
        'http://localhost:8000/api/auth/verify-otp/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(getFriendlyErrorMessage(response.status, data));
      // Store tokens and metadata for the final "Complete Registration" step
      sessionStorage.setItem('registration_token', data.registration_token);
      sessionStorage.setItem('verified_identifier', formData.identifier);
      sessionStorage.setItem('verified_type', isEmail ? 'email' : 'phone');
      router.push('/register/complete');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={step === 1 ? handleRequestOtp : handleVerifyOtp}
        className="space-y-6"
      >
        {error && (
          <div className="flex gap-3 p-4 rounded-xl bg-info-25 border border-info-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="shrink-0 w-5 h-5 text-info-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm font-bold leading-tight text-info-700">
              {error}
            </p>
          </div>
        )}

        <UiInput
          label="Email or Phone Number"
          placeholder="name@email.com"
          disabled={step === 2}
          value={formData.identifier}
          onChange={e =>
            setFormData({ ...formData, identifier: e.target.value })
          }
          required
          leftIcon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          }
        />

        {step === 2 && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <UiInput
              label="Verification Code"
              placeholder="000000"
              value={formData.otp}
              onChange={e => setFormData({ ...formData, otp: e.target.value })}
              required
              maxLength={6}
              leftIcon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              }
            />
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-3 text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline"
            >
              Change email/phone
            </button>
          </div>
        )}

        <UiButton type="submit" isLoading={isLoading}>
          {step === 1 ? 'GET VERIFICATION CODE' : 'VERIFY & CONTINUE'}
        </UiButton>
      </form>
    </div>
  );
}
