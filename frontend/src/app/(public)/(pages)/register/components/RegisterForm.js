'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useRegister } from '../hooks/useRegister';
import { useGoogleAuth } from '../../login/hooks/useGoogleAuth';
import UiInput from '@/app/(public)/components/UiInput';
import UiButton from '@/app/(public)/components/UiButton';

export default function RegisterForm() {
  const {
    formData,
    setFormData,
    isLoading,
    error,
    setError,
    handleStartRegistration,
  } = useRegister();

  const {
    handleGoogleSignIn,
    isLoading: isGoogleLoading,
    error: googleError,
  } = useGoogleAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Password Requirement Logic
  const passwordRules = [
    { label: 'at least 8 characters', test: pw => pw.length >= 8 },
    { label: 'one uppercase letter', test: pw => /[A-Z]/.test(pw) },
    { label: 'one lowercase letter', test: pw => /[a-z]/.test(pw) },
    { label: 'one digit', test: pw => /\d/.test(pw) },
    {
      label: 'one special character (@$!%*?&#)',
      test: pw => /[@$!%*?&#]/.test(pw),
    },
  ];

  const validateForm = e => {
    e.preventDefault();
    let errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    const failedRules = passwordRules
      .filter(rule => !rule.test(formData.password))
      .map(rule => rule.label);

    if (!formData.password) {
      errors.password = 'Please enter your password';
    } else if (failedRules.length > 0) {
      errors.password = `Use ${failedRules.join(', ').replace(/, ([^,]*)$/, ' and $1')}`;
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      handleStartRegistration(e);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header Section */}
      <div className="flex flex-col items-center mb-12">
        <div className="relative flex items-center justify-center w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-(--success-50) opacity-50" />
          <div className="absolute inset-4 rounded-full border border-(--success-100)" />
          <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xs">
            <FiUser size={28} className="text-(--success-500)" />
          </div>
        </div>

        <div className="text-center mt-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Create New Account
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Enter your details to sign up
          </p>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={validateForm} noValidate className="w-full space-y-6">
        <UiInput
          label="Full Name"
          placeholder="Enter your name"
          value={formData.fullName}
          onChange={e => {
            setFormData({ ...formData, fullName: e.target.value });
            if (fieldErrors.fullName)
              setFieldErrors({ ...fieldErrors, fullName: null });
          }}
          error={fieldErrors.fullName}
          leftIcon={<FiUser />}
        />

        <UiInput
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={e => {
            setFormData({ ...formData, email: e.target.value });
            if (fieldErrors.email)
              setFieldErrors({ ...fieldErrors, email: null });
            if (error) setError(null);
          }}
          error={
            fieldErrors.email ||
            (error?.toLowerCase().includes('email')
              ? 'This email is already registered'
              : error)
          }
          leftIcon={<FiMail />}
        />

        <div className="space-y-3">
          <UiInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={formData.password}
            onChange={e => {
              setFormData({ ...formData, password: e.target.value });
              if (fieldErrors.password)
                setFieldErrors({ ...fieldErrors, password: null });
            }}
            error={fieldErrors.password}
            leftIcon={<FiLock />}
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
        </div>

        <div className="pt-4">
          <UiButton type="submit" isLoading={isLoading}>
            CREATE ACCOUNT
          </UiButton>
        </div>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 mt-6">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          or
        </span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Google Sign-Up Button */}
      <div className="mt-4 w-full">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-full border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.97] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGoogleLoading ? (
            <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          <span className="text-[13px] font-bold text-gray-700 uppercase tracking-[0.1em]">
            {isGoogleLoading ? 'Signing up...' : 'Continue with Google'}
          </span>
        </button>

        {/* Google Error */}
        {googleError && (
          <p className="mt-3 text-center text-xs font-bold text-red-500 animate-in fade-in">
            {googleError}
          </p>
        )}
      </div>

      <p className="mt-8 text-sm text-gray-500 font-medium">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-primary-500 font-bold hover:underline underline-offset-4"
        >
          Login
        </Link>
      </p>
    </div>
  );
}
