import { AUTH_ENDPOINTS } from '@/app/(shared)/lib/apiConfig';

export const requestOtpApi = async email => {
  const response = await fetch(AUTH_ENDPOINTS.REQUEST_OTP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to send OTP');
  return data;
};

export const verifyOtpApi = async (email, otp) => {
  const response = await fetch(AUTH_ENDPOINTS.VERIFY_OTP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Invalid OTP');
  return data;
};

export const completeRegistrationApi = async payload => {
  // Construct the complete endpoint using the base REGISTER path
  const response = await fetch(`${AUTH_ENDPOINTS.REGISTER}complete/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Registration failed');
  return data;
};
