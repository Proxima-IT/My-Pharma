'use client';
import React from 'react';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useResetPassword } from '../hooks/useResetPassword';
import UiInput from '@/app/(public)/components/UiInput';
import UiButton from '@/app/(public)/components/UiButton';

export default function ResetPasswordForm() {
  const {
    formData,
    setFormData,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isLoading,
    error,
    handleResetSubmit,
  } = useResetPassword();

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header Section with Multi-layered Icon */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative flex items-center justify-center w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-green-50 to-transparent opacity-80" />
          <div className="absolute inset-4 rounded-full border border-green-100 bg-white/20" />
          <div className="relative w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-b from-gray-50 to-white border border-white">
            <FiLock size={28} className="text-green-600" />
          </div>
        </div>

        <div className="text-center mt-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Create New Password
          </h1>
          <p className="text-gray-500 mt-3 font-medium leading-relaxed">
            Please enter a new password. Your new password must be different
            from previous password.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleResetSubmit} className="w-full space-y-6">
        <UiInput
          label="New Password*"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter new password"
          value={formData.password}
          onChange={e => setFormData({ ...formData, password: e.target.value })}
          required
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

        <UiInput
          label="Confirm New Password*"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirm new password"
          value={formData.confirmPassword}
          onChange={e =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          required
          leftIcon={<FiLock />}
          icon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-primary-500 transition-colors"
            >
              {showConfirmPassword ? (
                <FiEyeOff size={18} />
              ) : (
                <FiEye size={18} />
              )}
            </button>
          }
          error={error}
        />

        <div className="pt-4">
          <UiButton type="submit" isLoading={isLoading}>
            RESET PASSWORD
          </UiButton>
        </div>
      </form>
    </div>
  );
}
