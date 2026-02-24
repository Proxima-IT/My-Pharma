const BASE_URL = 'http://localhost:8000/api/auth';

export const requestOtpApi = async (email) => {
  const response = await fetch(`${BASE_URL}/request-otp/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to send OTP');
  return data;
};

export const verifyOtpApi = async (email, otp) => {
  const response = await fetch(`${BASE_URL}/verify-otp/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Invalid OTP');
  return data;
};

export const completeRegistrationApi = async (payload) => {
  const response = await fetch(`${BASE_URL}/register/complete/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Registration failed');
  return data;
};