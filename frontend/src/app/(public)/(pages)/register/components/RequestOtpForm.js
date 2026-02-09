'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UiInput from '@/app/(public)/components/UiInput';
import UiButton from '@/app/(public)/components/UiButton';

export default function RequestOtpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [identifier, setIdentifier] = useState('');

  const getFriendlyErrorMessage = (status, data) => {
    if (status === 429)
      return "You've requested too many codes. Please wait an hour before trying again.";
    if (status === 400)
      return 'Please enter a valid email address or phone number.';
    return (
      data?.detail ||
      'Something went wrong while sending the code. Please try again.'
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Logic to determine if identifier is email or phone
    const isEmail = identifier.includes('@');
    const payload = isEmail ? { email: identifier } : { phone: identifier };

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

      if (!response.ok) {
        throw new Error(getFriendlyErrorMessage(response.status, data));
      }

      // Success: Move to verification step
      // We pass the identifier and type via URL params for the next step
      const params = new URLSearchParams({
        value: identifier,
        type: isEmail ? 'email' : 'phone',
      });

      router.push(`/register/verify?${params.toString()}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex gap-3 p-4 rounded-xl bg-(--info-25) border border-(--info-100) animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="shrink-0 w-5 h-5 text-(--info-500)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm font-bold leading-tight text-(--info-700)">
            {error}
          </p>
        </div>
      )}

      <UiInput
        label="Email or Phone Number"
        placeholder="e.g. user@email.com or 017XXXXXXXX"
        value={identifier}
        onChange={e => setIdentifier(e.target.value)}
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        }
      />

      <div className="pt-2">
        <UiButton type="submit" isLoading={isLoading}>
          GET VERIFICATION CODE
        </UiButton>
      </div>

      <p className="text-[11px] text-center text-(--gray-400) font-medium leading-relaxed">
        By continuing, you agree to receive a one-time verification code via SMS
        or Email. Standard rates may apply.
      </p>
    </form>
  );
}
