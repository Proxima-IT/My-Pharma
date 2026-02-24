'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useLogin } from '../hooks/useLogin';
import UiInput from '@/app/(public)/components/UiInput';
import UiButton from '@/app/(public)/components/UiButton';
import { AUTH_ENDPOINTS } from '@/app/(user)/lib/apiConfig';

export default function LoginForm() {
  const { formData, setFormData, isLoading, error, handleLogin } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
<<<<<<< HEAD
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
      const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
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
=======
>>>>>>> 94d8241dcb9f04f8a8fc060fb3bb889a6bb74268

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header Section */}
      <div className="flex flex-col items-center mb-12">
        <div className="relative flex items-center justify-center w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-green-50 to-transparent opacity-80" />
          <div className="absolute inset-4 rounded-full border border-green-100 bg-white/20" />
          <div className="relative w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-b from-gray-50 to-white shadow-sm border border-white">
            <FiUser size={28} className="text-green-600" />
          </div>
        </div>

        <div className="text-center mt-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 mt-2 font-medium">Glad to see you again. Log in to your account</p>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleLogin} className="w-full space-y-6">
        <UiInput
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          leftIcon={<FiMail />}
          error={error?.toLowerCase().includes('email') ? error : null}
        />

        <UiInput
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          leftIcon={<FiLock />}
          error={error?.toLowerCase().includes('password') ? error : null}
          icon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-primary-500 transition-colors"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          }
        />

        {/* Options Row */}
        <div className="flex items-center justify-between px-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500 transition-all"
              checked={formData.keepLogin}
              onChange={(e) => setFormData({ ...formData, keepLogin: e.target.checked })}
            />
            <span className="text-xs font-bold text-gray-500 group-hover:text-gray-700 transition-colors uppercase tracking-wider">
              Keep me login
            </span>
          </label>
          <Link 
            href="/forgot-password" 
            className="text-xs font-bold text-primary-500 hover:text-primary-700 uppercase tracking-wider transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        {/* General Error (if not specific to fields) */}
        {error && !error.toLowerCase().includes('email') && !error.toLowerCase().includes('password') && (
          <p className="text-center text-xs font-bold text-red-500 animate-in fade-in">{error}</p>
        )}

        <div className="pt-4">
          <UiButton type="submit" isLoading={isLoading}>LOGIN</UiButton>
        </div>
      </form>

      {/* Footer Section */}
      <p className="mt-10 text-sm text-gray-500 font-medium">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary-500 font-bold hover:underline underline-offset-4">
          Register
        </Link>
      </p>
    </div>
  );
}