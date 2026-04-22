'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { IoCloseSharp } from 'react-icons/io5';
import LoginForm from '../(pages)/login/components/LoginForm';

const AuthModalContext = createContext();

/**
 * AuthModalProvider
 * Provides global state to trigger a login popup from any part of the application.
 * Designed for "Intent-Preserved Authentication" (logging in without losing checkout state).
 */
export const AuthModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);

  /**
   * Opens the login modal.
   * @param {string} path - Optional URL to redirect to after successful login.
   */
  const openAuthModal = (path = null) => {
    setRedirectPath(path);
    setIsOpen(true);
  };

  const closeAuthModal = () => {
    setIsOpen(false);
    setRedirectPath(null);
  };

  // Prevent background scrolling when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  return (
    <AuthModalContext.Provider
      value={{ openAuthModal, closeAuthModal, isOpen }}
    >
      {children}

      {/* Global Auth Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={closeAuthModal}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-[500px] bg-white rounded-[32px] shadow-[0_30px_100px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={closeAuthModal}
              className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition-all cursor-pointer z-10"
            >
              <IoCloseSharp size={24} />
            </button>

            {/* Content Padding */}
            <div className="p-8 pt-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                  Welcome Back
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                  Please login to continue your purchase.
                </p>
              </div>

              {/* Existing LoginForm Component used within the modal */}
              <LoginForm
                isModal={true}
                onSuccess={() => {
                  closeAuthModal();
                  // If a specific redirect path was set, the useLogin hook will handle it via searchParams
                  // Or we can manually trigger a router push if needed.
                }}
              />

              <div className="mt-8 text-center">
                <p className="text-[13px] text-gray-400">
                  By logging in, you agree to our{' '}
                  <span className="underline text-gray-600 font-bold">
                    Terms of Service
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};
