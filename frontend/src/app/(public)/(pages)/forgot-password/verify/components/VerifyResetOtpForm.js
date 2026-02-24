'use client';
import React, { useState } from 'react';
import { FiMail } from 'react-icons/fi';
import { useVerifyResetOtp } from '../hooks/useVerifyResetOtp';
import UiButton from '@/app/(public)/components/UiButton';

export default function VerifyResetOtpForm() {
  const {
    otp,
    email,
    timer,
    isLoading,
    error,
    setError,
    inputRefs,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleVerify,
    handleResend,
  } = useVerifyResetOtp();

  const [focusedIndex, setFocusedIndex] = useState(null);

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Multi-layered Icon Section */}
      <div className="relative flex items-center justify-center w-32 h-32 mb-8">
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-green-50 to-transparent opacity-80" />
        <div className="absolute inset-4 rounded-full border border-green-100 bg-white/20" />
        <div className="relative w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-b from-gray-50 to-white border border-white">
          <FiMail size={28} className="text-green-600" />
        </div>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          OTP Verification
        </h1>
        <p className="text-gray-500 mt-3 font-medium leading-relaxed">
          We have sent a verification code to email address <br />
          <span className="text-gray-900 font-bold">{email}</span>
        </p>
      </div>

      <form onSubmit={handleVerify} className="w-full space-y-8">
        <div className="grid grid-cols-6 gap-2 sm:gap-3">
          {otp.map((digit, index) => {
            const isActive = focusedIndex === index;
            const isError = !!error;
            return (
              <input
                key={index}
                ref={el => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                onPaste={handlePaste}
                onChange={e => {
                  if (error) setError(null);
                  handleChange(index, e.target.value);
                }}
                onKeyDown={e => handleKeyDown(index, e)}
                className={`
                  w-full aspect-[3/4] sm:aspect-square
                  text-center text-lg sm:text-xl font-bold 
                  rounded-xl border-[1.5px] transition-all duration-300 outline-none
                  ${isError ? 'bg-red-50 border-red-500 text-red-600' : isActive ? 'bg-green-500/10 border-green-500 ring-4 ring-green-500/20 text-gray-900' : 'bg-white border-gray-200 text-gray-900'}
                `}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-center text-sm font-bold text-red-500 animate-in fade-in">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <UiButton
            type="submit"
            isLoading={isLoading}
            disabled={otp.join('').length < 6}
          >
            VERIFY
          </UiButton>
          <div className="text-center">
            {timer > 0 ? (
              <p className="text-sm text-gray-400 font-medium">
                Resend code in{' '}
                <span className="text-primary-500 font-bold">
                  {formatTime(timer)}
                </span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-sm font-bold text-primary-500 hover:underline uppercase tracking-widest"
              >
                Resend Code
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
