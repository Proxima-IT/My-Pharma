'use client';
import React, { useState, useEffect } from 'react';

const LoadingOverlay = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isGranted, setIsGranted] = useState(false);
  const [shouldExit, setShouldExit] = useState(false);

  const statusTexts = [
    'INITIALIZING_SECURE_CONNECTION...',
    'VERIFYING_AUTHORITY_LEVEL...',
    'LOADING_PHARMACY_MODULES...',
    'FINALIZING_TERMINAL_ACCESS...',
  ];

  useEffect(() => {
    // Progress Bar Logic
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30); // 3 seconds total approx

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Status Text Logic based on progress
    if (progress < 30) setStatusIndex(0);
    else if (progress < 60) setStatusIndex(1);
    else if (progress < 90) setStatusIndex(2);
    else setStatusIndex(3);

    // When 100% is reached
    if (progress === 100) {
      setTimeout(() => {
        setIsGranted(true);
        // After 3 blinks (approx 1.5s), start exit animation
        setTimeout(() => {
          setShouldExit(true);
          // After exit animation finishes, notify parent
          setTimeout(() => {
            onFinish();
          }, 800);
        }, 1600);
      }, 500);
    }
  }, [progress, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-(--color-admin-bg) ${shouldExit ? 'animate-exit-up' : ''}`}
    >
      <div className="w-full max-w-md px-10 flex flex-col items-center">
        {!isGranted ? (
          <div className="w-full space-y-6">
            {/* Terminal Header */}
            <div className="flex justify-between items-end font-mono text-[10px] font-bold text-(--color-admin-primary) uppercase tracking-[0.2em]">
              <span>System_Boot_Sequence</span>
              <span>{progress}%</span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full h-4 border border-(--color-admin-border) p-0.5 bg-white">
              <div
                className="h-full bg-(--color-admin-primary) transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Status Text */}
            <div className="h-4">
              <p className="font-mono text-[11px] font-bold text-(--color-text-secondary) text-center uppercase tracking-widest animate-pulse">
                {statusTexts[statusIndex]}
              </p>
            </div>
          </div>
        ) : (
          /* Access Granted Message */
          <div className="flex flex-col items-center gap-4">
            <div className="border-2 border-(--color-admin-success) px-8 py-4 bg-white">
              <h2 className="font-mono text-2xl font-black text-(--color-admin-success) tracking-[0.3em] animate-access-blink uppercase">
                Access_Granted
              </h2>
            </div>
            <p className="font-mono text-[10px] font-bold text-(--color-admin-navy) uppercase tracking-[0.4em]">
              Redirecting_To_Terminal...
            </p>
          </div>
        )}

        {/* Decorative Corner Borders */}
        <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-(--color-admin-border)" />
        <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-(--color-admin-border)" />
        <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-(--color-admin-border)" />
        <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-(--color-admin-border)" />
      </div>
    </div>
  );
};

export default LoadingOverlay;
