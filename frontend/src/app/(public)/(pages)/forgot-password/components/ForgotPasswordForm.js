'use client';

import { useState } from 'react';
import Link from 'next/link';
import UiInput from '@/app/(public)/components/UiInput';
import UiButton from '@/app/(public)/components/UiButton';

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        'http://localhost:8000/api/auth/password-reset/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        },
      );

      // The backend returns 200 even if email doesn't exist for security
      if (!response.ok) {
        throw new Error(
          "We couldn't process your request. Please try again later.",
        );
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-success-50 text-success-500 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8"
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
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-(--gray-900)">
            Check your email
          </h2>
          <p className="text-sm text-(--gray-500) leading-relaxed">
            If an account exists for{' '}
            <span className="font-semibold text-(--gray-900)">{email}</span>,
            you will receive instructions to reset your password shortly.
          </p>
        </div>
        <div className="pt-4">
          <Link href="/login">
            <UiButton variant="outline">Back to Login</UiButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-(--info-25) border border-(--info-100) text-(--info-700) font-bold text-xs animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <UiInput
        label="Email Address"
        placeholder="Enter your registered email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
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
          SEND RESET LINK
        </UiButton>
      </div>

      <div className="text-center">
        <Link
          href="/login"
          className="text-xs font-bold text-(--gray-400) uppercase tracking-widest hover:text-(--primary-500) transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </form>
  );
}
