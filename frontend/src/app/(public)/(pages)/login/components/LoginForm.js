'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UiInput from '@/app/(public)/components/UiInput';
import UiButton from '@/app/(public)/components/UiButton';

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ identifier: '', password: '' });

  const getFriendlyErrorMessage = (status, data) => {
    switch (status) {
      case 401:
        return "Oops! Those details don't match our records. Please double-check your email/phone and password.";
      case 423:
        return 'For your security, your account is temporarily locked due to too many failed attempts. Please try again in 30 minutes.';
      case 429:
        return "You're moving a bit too fast! Please wait a moment before trying to sign in again.";
      case 400:
        return 'It looks like some information is missing or incorrect. Please check the form and try again.';
      case 500:
        return "We're having some trouble on our end right now. Please try again in a few minutes.";
      default:
        return (
          data?.detail ||
          "We couldn't sign you in. Please check your connection and try again."
        );
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const isEmail = formData.identifier.includes('@');
    const payload = {
      [isEmail ? 'email' : 'phone']: formData.identifier,
      password: formData.password,
    };

    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        const message = getFriendlyErrorMessage(response.status, data);
        throw new Error(message);
      }

      localStorage.setItem('access_token', data.access);
      localStorage.setItem('user', JSON.stringify(data.user));

      const routes = {
        SUPER_ADMIN: '/admin',
        PHARMACY_ADMIN: '/pharmacy',
        DOCTOR: '/doctor',
        REGISTERED_USER: '/user',
      };

      router.push(routes[data.user.role] || '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        label="Email or Phone"
        placeholder="Enter your email or phone"
        value={formData.identifier}
        onChange={e => setFormData({ ...formData, identifier: e.target.value })}
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

      <UiInput
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        value={formData.password}
        onChange={e => setFormData({ ...formData, password: e.target.value })}
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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        }
        icon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-1 text-gray-400 hover:text-primary-500 transition-colors"
          >
            {showPassword ? (
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
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                />
              </svg>
            ) : (
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        }
      />

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-[11px] font-black uppercase tracking-widest text-primary-500 hover:text-primary-700 transition-colors"
        >
          Forgot Password?
        </Link>
      </div>

      <UiButton type="submit" isLoading={isLoading}>
        SIGN IN TO ACCOUNT
      </UiButton>
    </form>
  );
}
