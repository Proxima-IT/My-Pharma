'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  verifyOtpApi,
  completeRegistrationApi,
  requestOtpApi,
} from '../../api/registerApi';

export const useVerifyOtp = () => {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('temp_reg_email');
    if (!storedEmail) {
      router.replace('/register');
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
    // Take only the last character entered
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (error) setError(null);

    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current is empty, move back and clear previous
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      } else {
        // Just clear current
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
      if (index < 6 && !isNaN(char)) {
        newOtp[index] = char;
      }
    });

    setOtp(newOtp);

    // Focus the last filled input or the next empty one
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
      const fullName = sessionStorage.getItem('temp_reg_name');
      const password = sessionStorage.getItem('temp_reg_password');
      const [firstName, ...lastNameParts] = fullName.trim().split(/\s+/);

      const result = await completeRegistrationApi({
        registration_token: verifyData.registration_token,
        username: fullName, // Fixed: Using the Full Name input as the Username
        password: password,
        first_name: firstName,
        last_name: lastNameParts.join(' '),
      });

      localStorage.setItem('access_token', result.access);
      localStorage.setItem('user', JSON.stringify(result.user));
      sessionStorage.clear();
      router.push('/user');
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
