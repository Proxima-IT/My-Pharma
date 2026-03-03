'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
        Privacy Policy
      </h1>
      <p className="text-gray-600 text-center max-w-md mb-8">
        Privacy policy and data protection. Content coming soon.
      </p>
      <Link
        href="/"
        className="text-(--color-primary-500) font-semibold hover:underline"
      >
        Back to Home
      </Link>
    </div>
  );
}
