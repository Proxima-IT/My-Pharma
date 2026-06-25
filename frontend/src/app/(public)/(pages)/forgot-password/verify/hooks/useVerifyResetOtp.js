'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { requestPasswordResetApi, verifyPasswordResetOtpApi } from '../../api/forgotPasswordApi';

export const useVerifyResetOtp = () => {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [identifierType, setIdentifierType] = useState('phone');
  const inputRefs = useRef([]);

  useEffect(() => {
    const storedIdentifier = sessionStorage.getItem('reset_identifier') || sessionStorage.getItem('reset_email');
    const storedType = sessionStorage.getItem('reset_type') || (storedIdentifier?.includes('@') ? 'email' : 'phone');
    if (!storedIdentifier) {
      router.replace('/forgot-password');
    } else {
      setEmail(storedIdentifier);
      setIdentifierType(storedType);
    }
  }, [router]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (error) setError(null);
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (index, e) => {
    if (error) setError(null);
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = e => {
    if (error) setError(null);
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    pasteData.forEach((char, index) => {
      if (index < 6 && !isNaN(char)) newOtp[index] = char;
    });
    setOtp(newOtp);
    const nextFocusIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextFocusIndex].focus();
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      const payload = identifierType === 'email' ? { email } : { phone: email };
      await requestPasswordResetApi(payload);
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerify = async e => {
    if (e) e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) return;
    setIsLoading(true);
    setError(null);

    try {
      const verifyData = await verifyPasswordResetOtpApi(email, otpString);
      router.push(`/reset-password?token=${verifyData.token}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    otp,
    email,
    identifierType,
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
  };
};
