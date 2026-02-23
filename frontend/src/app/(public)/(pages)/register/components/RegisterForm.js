'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useRegister } from '../hooks/useRegister';
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

      <p className="mt-10 text-sm text-gray-500 font-medium">
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
