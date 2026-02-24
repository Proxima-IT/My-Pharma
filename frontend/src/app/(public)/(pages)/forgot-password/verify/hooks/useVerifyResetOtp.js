'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { verifyOtpApi, requestOtpApi } from '../../../register/api/registerApi';

export const useVerifyResetOtp = () => {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('reset_email');
    if (!storedEmail) {
      router.replace('/forgot-password');
    } else {
      setEmail(storedEmail);
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
      await requestOtpApi(email);
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
      const verifyData = await verifyOtpApi(email, otpString);
      // Store registration token for the reset-password page
      sessionStorage.setItem('reset_token', verifyData.registration_token);
      router.push('/reset-password');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
};
