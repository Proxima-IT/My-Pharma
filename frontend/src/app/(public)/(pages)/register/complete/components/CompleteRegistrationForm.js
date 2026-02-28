'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UiInput from '@/app/(public)/components/UiInput';
import UiButton from '@/app/(public)/components/UiButton';

export default function CompleteRegistrationForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState('');

  // State for verified data
  const [verifiedValue, setVerifiedValue] = useState('');
  const [verifiedType, setVerifiedType] = useState('');
  const [fullName, setFullName] = useState('');

  // States for secondary identifier verification
  const [otherStep, setOtherStep] = useState(0); // 0: idle, 1: otp-sent, 2: verified
  const [otherOtp, setOtherOtp] = useState('');
  const [isVerifyingOther, setIsVerifyingOther] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    address: '',
    email: '',
    phone: '',
    profile_picture: null,
  });

  useEffect(() => {
    const token = sessionStorage.getItem('registration_token');
    const identifier = sessionStorage.getItem('verified_identifier');
    const type = sessionStorage.getItem('verified_type');
    const storedName = sessionStorage.getItem('temp_reg_name'); // Get name from step 1

    if (!token || !identifier || !type) {
      router.replace('/register');
    } else {
      setVerifiedValue(identifier);
      setVerifiedType(type);
      setFullName(storedName || '');
      setIsAuthorized(true);
    }
  }, [router]);

  const handleRequestOtherOtp = async () => {
    const value = verifiedType === 'phone' ? formData.email : formData.phone;
    if (!value) {
      setError(
        `Please enter a valid ${verifiedType === 'phone' ? 'email' : 'phone number'} first.`,
      );
      return;
    }

    setIsVerifyingOther(true);
    setError('');

    try {
      const payload =
        verifiedType === 'phone' ? { email: value } : { phone: value };
      const response = await fetch(
        'http://localhost:8000/api/auth/request-otp/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) throw new Error('Failed to send verification code.');
      setOtherStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsVerifyingOther(false);
    }
  };

  const handleVerifyOtherOtp = async () => {
    const value = verifiedType === 'phone' ? formData.email : formData.phone;
    setIsVerifyingOther(true);
    setError('');

    try {
      const payload =
        verifiedType === 'phone'
          ? { email: value, otp: otherOtp }
          : { phone: value, otp: otherOtp };

      const response = await fetch(
        'http://localhost:8000/api/auth/verify-otp/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) throw new Error('Invalid verification code.');
      setOtherStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsVerifyingOther(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const otherValue =
      verifiedType === 'phone' ? formData.email : formData.phone;
    if (otherValue && otherStep !== 2) {
      setError(
        `Please verify your ${verifiedType === 'phone' ? 'email' : 'phone number'} before continuing.`,
      );
      return;
    }

    setIsLoading(true);
    setError('');

    const token = sessionStorage.getItem('registration_token');
    const data = new FormData();

    // 1. Required Authentication Data
    data.append('registration_token', token);
    data.append('username', formData.username);
    data.append('password', formData.password);
    data.append('full_name', fullName); // Include name from step 1

    // 2. Primary Verified Identifier (CRITICAL FIX)
    // We must send the identifier that was verified in the previous step
    if (verifiedType === 'email') {
      data.append('email', verifiedValue);
      if (formData.phone && otherStep === 2)
        data.append('phone', formData.phone);
    } else {
      data.append('phone', verifiedValue);
      if (formData.email && otherStep === 2)
        data.append('email', formData.email);
    }

    // 3. Optional Profile Data
    if (formData.address) data.append('address', formData.address);
    if (formData.profile_picture)
      data.append('profile_picture', formData.profile_picture);

    try {
      const response = await fetch(
        'http://localhost:8000/api/auth/register/complete/',
        {
          method: 'POST',
          body: data,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        // If there are field-specific errors, show the first one
        const firstError =
          result && typeof result === 'object'
            ? Object.values(result)[0][0] || Object.values(result)[0]
            : null;

        throw new Error(
          firstError ||
            result.detail ||
            'Registration failed. Please check your details.',
        );
      }

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

  if (!isAuthorized) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-2 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isOtherValid =
    verifiedType === 'phone'
      ? formData.email.includes('@') && formData.email.length > 5
      : formData.phone.length >= 10;

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Strictly only PNG, JPG, and JPEG files are allowed.');
      e.target.value = '';
      return;
    }
    setFormData({ ...formData, profile_picture: file });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 animate-in fade-in duration-700"
    >
      {error && (
        <div className="flex gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 font-bold text-xs animate-in fade-in slide-in-from-top-2">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Display Full Name from Step 1 */}
        <div className="px-5 py-3 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Full Name
          </p>
          <p className="text-sm font-bold text-gray-900">{fullName}</p>
        </div>

        <UiInput
          label="Username"
          placeholder="johndoe123"
          value={formData.username}
          onChange={e => setFormData({ ...formData, username: e.target.value })}
          required
        />

        <UiInput
          label="Create Password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={e => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <UiInput
          label={verifiedType === 'email' ? 'Verified Email' : 'Verified Phone'}
          value={verifiedValue}
          readOnly
          disabled
        />

        {/* Secondary Identifier Section */}
        <div className="space-y-4">
          {verifiedType === 'phone' ? (
            <UiInput
              label="Email Address (Optional)"
              placeholder="Add an email for recovery"
              type="email"
              disabled={otherStep === 2}
              value={formData.email}
              onChange={e =>
                setFormData({ ...formData, email: e.target.value })
              }
              icon={
                otherStep === 0 && isOtherValid ? (
                  <button
                    type="button"
                    onClick={handleRequestOtherOtp}
                    className="bg-primary-50 text-primary-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-primary-100 transition-all cursor-pointer"
                  >
                    {isVerifyingOther ? '...' : 'Verify'}
                  </button>
                ) : otherStep === 2 ? (
                  <div className="text-green-500 font-bold text-[10px] uppercase">
                    Verified
                  </div>
                ) : null
              }
            />
          ) : (
            <UiInput
              label="Phone Number (Optional)"
              placeholder="e.g. 017XXXXXXXX"
              disabled={otherStep === 2}
              value={formData.phone}
              onChange={e =>
                setFormData({ ...formData, phone: e.target.value })
              }
              icon={
                otherStep === 0 && isOtherValid ? (
                  <button
                    type="button"
                    onClick={handleRequestOtherOtp}
                    className="bg-primary-50 text-primary-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-primary-100 transition-all cursor-pointer"
                  >
                    {isVerifyingOther ? '...' : 'Verify'}
                  </button>
                ) : otherStep === 2 ? (
                  <div className="text-green-500 font-bold text-[10px] uppercase">
                    Verified
                  </div>
                ) : null
              }
            />
          )}

          {otherStep === 1 && (
            <div className="animate-in slide-in-from-top-2">
              <UiInput
                label="Verification Code"
                placeholder="Enter 6-digit OTP"
                value={otherOtp}
                onChange={e => setOtherOtp(e.target.value)}
                maxLength={6}
                icon={
                  <button
                    type="button"
                    onClick={handleVerifyOtherOtp}
                    className="bg-primary-50 text-primary-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-primary-100 transition-all cursor-pointer"
                  >
                    {isVerifyingOther ? '...' : 'Confirm'}
                  </button>
                }
              />
            </div>
          )}
        </div>

        <UiInput
          label="Address"
          placeholder="Your full address"
          value={formData.address}
          onChange={e => setFormData({ ...formData, address: e.target.value })}
        />

        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-bold text-gray-600 ml-5">
            Profile Picture
          </label>
          <div className="relative group">
            <input
              type="file"
              accept=".png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-full py-5 px-4 bg-gray-50 border border-dashed border-gray-300 rounded-[24px] flex items-center gap-4 group-hover:border-(--color-primary-500) transition-colors">
              <div className="p-2 bg-white rounded-xl border border-gray-200">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-700">
                  {formData.profile_picture
                    ? formData.profile_picture.name
                    : 'Choose a photo'}
                </span>
                <span className="text-xs text-gray-400">
                  PNG, JPG, JPEG up to 5MB
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <UiButton type="submit" isLoading={isLoading}>
          COMPLETE REGISTRATION
        </UiButton>
      </div>
    </form>
  );
}
