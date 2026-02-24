'use client';
import React from 'react';
import Link from 'next/link';
import {
  FiCamera,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiShield,
  FiChevronDown,
  FiSave,
  FiCheck,
  FiArrowLeft,
} from 'react-icons/fi';
import { IoMaleFemaleOutline } from 'react-icons/io5';
import { useProfile } from '../../hooks/useProfile';
import UiInput from '@/app/(public)/components/UiInput';
import UiButton from '@/app/(public)/components/UiButton';

export default function UserProfilePage() {
  const {
    formData,
    setFormData,
    initialData,
    isLoading,
    isUpdating,
    error,
    showSuccess,
    verifyingType,
    setVerifyingType,
    otp,
    setOtp,
    handleUpdate,
    requestVerification,
    verifyCode,
  } = useProfile();

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-40">
        <div className="w-10 h-10 border-4 border-(--primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-700 pb-20">
      {/* Mobile Back Button */}
      <Link
        href="/user"
        className="inline-flex lg:hidden items-center gap-2 text-sm font-semibold text-(--primary-500) hover:text-(--primary-700) transition-colors mb-6"
      >
        <FiArrowLeft /> Back to Menu
      </Link>

      <div className="bg-white rounded-[32px] p-8 md:p-12 border border-gray-100/50 w-full shadow-none">
        {/* 1. Header Section: Avatar + Info (Responsive Stack) */}
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-10 text-center sm:text-left">
          <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gray-50 border-[6px] border-white ring-1 ring-gray-100 overflow-hidden">
              {formData.avatar_preview ? (
                <img
                  src={formData.avatar_preview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                  <FiUser size={48} />
                </div>
              )}
            </div>
            <label className="absolute bottom-1 right-1 w-9 h-9 bg-white/70 backdrop-blur-md border border-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-all shadow-sm">
              <FiCamera size={16} className="text-gray-600" />
              <input
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file)
                    setFormData({
                      ...formData,
                      profile_picture: file,
                      avatar_preview: URL.createObjectURL(file),
                    });
                }}
              />
            </label>
          </div>

          <div className="flex flex-col min-w-0 w-full">
            <h2 className="text-2xl font-bold text-black tracking-tight truncate">
              {formData.fullName || formData.username}
            </h2>
            <p className="text-gray-400 font-medium mt-1 truncate">
              {formData.email || formData.phone}
            </p>
          </div>
        </div>

        {/* 2. Modern Separator */}
        <div className="h-px bg-gray-100 w-full mb-10" />

        {/* 3. Form Section */}
        <form onSubmit={handleUpdate} className="space-y-8">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            {/* Full Name - Full Width */}
            <div className="md:col-span-2">
              <UiInput
                label="Full Name"
                placeholder="Enter your name"
                value={formData.fullName}
                onChange={e =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                leftIcon={<FiUser />}
              />
            </div>

            {/* Email Field with Inline Verification Replacement */}
            <div className="flex flex-col gap-1">
              {verifyingType === 'email' ? (
                <UiInput
                  label="Enter OTP for Email"
                  placeholder="000000"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  maxLength={6}
                  icon={
                    <button
                      type="button"
                      onClick={verifyCode}
                      className="text-[10px] font-bold text-(--primary-500) uppercase tracking-widest"
                    >
                      Verify
                    </button>
                  }
                />
              ) : (
                <UiInput
                  label="Email Address"
                  value={formData.email}
                  readOnly={!!initialData.email}
                  disabled={!!initialData.email}
                  placeholder="Enter email address"
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  leftIcon={<FiMail />}
                  icon={
                    !initialData.email &&
                    formData.email.includes('@') && (
                      <button
                        type="button"
                        onClick={() => requestVerification('email')}
                        className="text-[10px] font-bold text-(--primary-500) uppercase tracking-widest"
                      >
                        Verify
                      </button>
                    )
                  }
                />
              )}
              {verifyingType === 'email' && (
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1 ml-4">
                  Verifying: {formData.email}
                </p>
              )}
            </div>

            {/* Phone Field with Inline Verification Replacement */}
            <div className="flex flex-col gap-1">
              {verifyingType === 'phone' ? (
                <UiInput
                  label="Enter OTP for Phone"
                  placeholder="000000"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  maxLength={6}
                  icon={
                    <button
                      type="button"
                      onClick={verifyCode}
                      className="text-[10px] font-bold text-(--primary-500) uppercase tracking-widest"
                    >
                      Verify
                    </button>
                  }
                />
              ) : (
                <UiInput
                  label="Phone Number"
                  value={formData.phone}
                  readOnly={!!initialData.phone}
                  disabled={!!initialData.phone}
                  placeholder="Enter phone number"
                  onChange={e =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  leftIcon={<FiPhone />}
                  icon={
                    !initialData.phone &&
                    formData.phone.length >= 10 && (
                      <button
                        type="button"
                        onClick={() => requestVerification('phone')}
                        className="text-[10px] font-bold text-(--primary-500) uppercase tracking-widest"
                      >
                        Verify
                      </button>
                    )
                  }
                />
              )}
              {verifyingType === 'phone' && (
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1 ml-4">
                  Verifying: {formData.phone}
                </p>
              )}
            </div>

            {/* Gender Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-gray-600 ml-5">
                Gender
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-(--primary-500) transition-colors z-10 pointer-events-none">
                  <IoMaleFemaleOutline />
                </div>
                <select
                  className="w-full py-3.5 pl-12 pr-10 bg-white border border-gray-200 rounded-full text-sm text-gray-900 outline-none appearance-none cursor-pointer transition-all duration-300 focus:ring-4 focus:ring-(--primary-50)/50 focus:border-(--primary-500)"
                  value={formData.gender}
                  onChange={e =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-focus-within:text-(--primary-500)">
                  <FiChevronDown />
                </div>
              </div>
            </div>

            <UiInput
              label="Date of Birth"
              type="date"
              value={formData.date_of_birth}
              onChange={e =>
                setFormData({ ...formData, date_of_birth: e.target.value })
              }
              leftIcon={<FiCalendar />}
            />
          </div>

          {/* 4. Left Aligned Save Button & Success Message */}
          <div className="flex flex-col items-start pt-4">
            <div className="w-fit">
              <UiButton type="submit" isLoading={isUpdating}>
                <div className="flex items-center gap-2 px-2">
                  <FiSave />
                  <span>SAVE CHANGES</span>
                </div>
              </UiButton>
            </div>
            {showSuccess && (
              <p className="text-sm font-bold text-green-600 mt-3 flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                <FiCheck /> Saved All Changes Successfully
              </p>
            )}
            {error && (
              <p className="text-sm font-bold text-red-500 mt-3">{error}</p>
            )}
          </div>
        </form>
      </div>

      <div className="flex items-center justify-center gap-2 text-gray-400 mt-10">
        <FiShield className="text-sm" />
        <p className="text-xs font-medium uppercase tracking-widest">
          Secure Identity Management
        </p>
      </div>
    </div>
  );
}
