'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/app/(shared)/lib/firebaseConfig';
import { AUTH_ENDPOINTS, parseJsonResponse } from '@/app/(shared)/lib/apiConfig';

/**
 * useGoogleAuth hook
 * Handles the full Google Sign-In flow:
 * 1. Opens Firebase Google popup to get an ID token.
 * 2. Sends the ID token to the backend POST /api/auth/google/.
 * 3. Stores tokens and user, then redirects based on role.
 */
export const useGoogleAuth = ({ onSuccess = null } = {}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Get Firebase ID token via Google popup
      const idToken = await signInWithGoogle();

      // Step 2: Send ID token to backend
      const response = await fetch(AUTH_ENDPOINTS.GOOGLE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken }),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        const errorMessages = {
          firebase_not_configured: 'Google sign-in is not available right now. Please try again later.',
          invalid_google_provider: 'Invalid Google sign-in. Please try again.',
          firebase_project_mismatch: 'Google sign-in configuration error. Please contact support.',
          google_email_missing: 'Your Google account does not have a verified email address.',
          google_email_not_verified: 'Your Google account email is not verified.',
          google_email_unavailable: 'This email is not available for sign-in. Please contact support.',
          invalid_firebase_token: 'Google sign-in failed. Please try again.',
          account_locked: data.detail || 'Your account is temporarily locked. Please try again later.',
        };
        throw new Error(errorMessages[data.code] || data.detail || 'Google sign-in failed. Please try again.');
      }

      // Step 3: Store tokens and user data
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Step 4: Handle success callback (for modal usage)
      if (onSuccess) {
        onSuccess();
        return;
      }

      // Step 5: Role-based redirection
      const routes = {
        SUPER_ADMIN: '/admin',
        PHARMACY_ADMIN: '/pharmacy',
        DOCTOR: '/doctor',
        REGISTERED_USER: '/user',
      };

      router.replace(routes[data.user?.role] || '/');
    } catch (err) {
      // Handle Firebase popup closed by user
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setIsLoading(false);
        return;
      }
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleGoogleSignIn,
    isLoading,
    error,
    setError,
  };
};
