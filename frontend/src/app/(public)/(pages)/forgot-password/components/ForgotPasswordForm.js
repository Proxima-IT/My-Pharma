'use client';
import React from 'react';
import Link from 'next/link';
import { FiMail, FiLock, FiCheckCircle } from 'react-icons/fi';
import { useForgotPassword } from '../hooks/useForgotPassword';
import UiInput from '@/app/(public)/components/UiInput';
import UiButton from '@/app/(public)/components/UiButton';

export default function ForgotPasswordForm() {
  const {
    email,
    setEmail,
    isLoading,
    isSuccess,
    error,
    methodError,
    handleRequestReset,
    triggerMethodError,
  } = useForgotPassword();

  if (isSuccess) {
    return (
      <div className="w-full flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
          <FiCheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Check your email
        </h2>
        <p className="text-gray-500 font-medium leading-relaxed">
          We have sent password reset instructions to <br />
          <span className="font-bold text-gray-900">{email}</span>
        </p>
        <div className="mt-8 w-full">
          <Link href="/login">
            <UiButton variant="outline">Back to Login</UiButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header Section with Multi-layered Icon */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative flex items-center justify-center w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-green-50 to-transparent opacity-80" />
          <div className="absolute inset-4 rounded-full border border-green-100 bg-white/20" />
          <div className="relative w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-b from-gray-50 to-white shadow-sm border border-white">
            <FiLock size={28} className="text-green-600" />
          </div>
        </div>

        <div className="text-center mt-6 w-full">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Forgot Password
          </h1>
          <p className="text-gray-500 mt-3 font-medium leading-relaxed w-full">
            Enter your email address and we’ll send you password reset
            instructions.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleRequestReset} className="w-full space-y-6">
        <UiInput
          label="Email Address"
          type="email"
          placeholder="johndoe@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          leftIcon={<FiMail />}
          error={error}
        />

        <div className="pt-2">
          <UiButton type="submit" isLoading={isLoading}>
            FORGOT PASSWORD
          </UiButton>
        </div>
      </form>

      {/* Footer Section */}
      <div className="mt-10 text-center space-y-1">
        <p className="text-sm text-gray-500 font-medium">
          Don’t have access anymore?
        </p>
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={triggerMethodError}
            className="text-primary-500 font-bold hover:text-primary-700 transition-colors text-sm"
          >
            Try another method
          </button>
          {methodError && (
            <span className="text-[11px] font-bold text-red-500 animate-in fade-in slide-in-from-top-1">
              {methodError}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
