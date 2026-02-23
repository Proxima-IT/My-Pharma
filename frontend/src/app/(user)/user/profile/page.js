'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  FiEdit3,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiCheckCircle,
  FiShield,
  FiChevronDown,
  FiArrowLeft,
  FiX,
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
    setShowSuccess,
    verifyingType,
    setVerifyingType,
    verificationStep,
    setVerificationStep,
    otp,
    setOtp,
    handleUpdate,
    requestVerification,
    verifyCode,
  } = useProfile();

  // Disable scrolling when success popup is open
  useEffect(() => {
    if (showSuccess) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSuccess]);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-40">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700 pb-20">
      <Link
        href="/user"
        className="inline-flex lg:hidden items-center gap-2 text-sm font-semibold text-primary-500 hover:text-primary-700 transition-colors mb-2"
      >
        <FiArrowLeft /> Back to Menu
      </Link>

      {/* Success Popup Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/10"
            onClick={() => setShowSuccess(false)}
          />
          <div className="relative bg-white rounded-[40px] p-10 flex flex-col items-center text-center max-w-sm w-full shadow-[0_20px_70px_-10px_rgba(0,0,0,0.15)] border border-gray-100 animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
              <FiCheckCircle size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Your profile information has been updated successfully.
            </p>
            <UiButton onClick={() => setShowSuccess(false)}>OKAY</UiButton>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[40px] p-8 md:p-16 border border-gray-100/50 w-full">
        <form
          onSubmit={handleUpdate}
          className="flex flex-col items-center w-full"
        >
          <div className="relative group mb-16">
            <div className="w-44 h-44 rounded-full bg-primary-25 border-4 border-white ring-8 ring-primary-50/30 overflow-hidden transition-transform duration-500 group-hover:scale-105">
              {formData.avatar_preview ? (
                <img
                  src={formData.avatar_preview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary-200">
                  <FiUser size={80} />
                </div>
              )}
            </div>
            <label className="absolute bottom-2 right-2 w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-600 transition-all shadow-lg hover:scale-110">
              <FiEdit3 size={20} />
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

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="md:col-span-1">
              <UiInput
                label="Username"
                placeholder="e.g. johndoe"
                value={formData.username}
                onChange={e =>
                  setFormData({ ...formData, username: e.target.value })
                }
                leftIcon={<FiUser />}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-gray-600">
                Gender
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors z-10 pointer-events-none">
                  <IoMaleFemaleOutline />
                </div>
                <select
                  className={`
                    w-full
                    py-3.5 pl-11 pr-10
                    bg-gray-50
                    border border-gray-200
                    rounded-xl
                    text-sm text-gray-900
                    outline-none
                    appearance-none
                    cursor-pointer
                    transition-all duration-300
                    focus:bg-white
                    focus:ring-4 focus:ring-primary-50/50
                    focus:border-primary-500
                    focus:shadow-sm
                  `}
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
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-focus-within:text-primary-500">
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

            <div className="flex flex-col gap-3">
              <UiInput
                label="Email Address"
                value={formData.email}
                readOnly={!!initialData.email}
                disabled={!!initialData.email}
                placeholder="Add email address"
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
                      className="bg-primary-50 text-primary-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-primary-100 transition-all"
                    >
                      Verify
                    </button>
                  )
                }
              />
            </div>

            <div className="flex flex-col gap-3">
              <UiInput
                label="Mobile Number"
                value={formData.phone}
                readOnly={!!initialData.phone}
                disabled={!!initialData.phone}
                placeholder="Add mobile number"
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
                      className="bg-primary-50 text-primary-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-primary-100 transition-all"
                    >
                      Verify
                    </button>
                  )
                }
              />
            </div>
          </div>

          {verifyingType && (
            <div className="mt-10 w-full p-8 bg-primary-25 rounded-[32px] border border-primary-100 animate-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 uppercase tracking-widest text-xs">
                  <FiShield className="text-primary-500" /> Verify{' '}
                  {verifyingType}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setVerifyingType(null);
                    setVerificationStep(1);
                  }}
                  className="text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest"
                >
                  CANCEL
                </button>
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <UiInput
                    label="Enter 6-Digit OTP"
                    placeholder="000000"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    maxLength={6}
                  />
                </div>
                <div className="w-full md:w-auto">
                  <UiButton
                    type="button"
                    onClick={verifyCode}
                    isLoading={isUpdating}
                  >
                    VERIFY CODE
                  </UiButton>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-xl w-full text-center text-sm font-bold text-red-600">
              {error}
            </div>
          )}

          <div className="mt-16 w-full max-w-sm">
            <UiButton type="submit" isLoading={isUpdating}>
              SAVE PROFILE CHANGES
            </UiButton>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-center gap-2 text-gray-400">
        <FiShield className="text-sm" />
        <p className="text-xs font-medium uppercase tracking-widest">
          Secure Identity Management
        </p>
      </div>
    </div>
  );
}
