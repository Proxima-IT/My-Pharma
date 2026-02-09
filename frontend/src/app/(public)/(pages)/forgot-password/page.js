import ForgotPasswordForm from './components/ForgotPasswordForm';
import Logo from '@/app/(public)/components/Logo';
import Link from 'next/link';

export const metadata = {
  title: 'Forgot Password | My Pharma',
};

export default function ForgotPasswordPage() {
  // Inline style to ensure the background color applies regardless of Tailwind's state
  const pageStyle = {
    backgroundColor: 'var(--primary-25)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  };

  return (
    <main style={pageStyle}>
      <div className="w-full max-w-105 flex flex-col gap-10">
        {/* Brand Identity & Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Link
            href="/"
            className="mb-4 block hover:opacity-80 transition-opacity duration-300"
          >
            <Logo className="h-14 w-auto" />
          </Link>

          <h1 className="text-3xl font-bold text-(--gray-900) tracking-tight">
            Reset Password
          </h1>

          <p className="text-base font-normal text-(--gray-500) max-w-xs leading-relaxed">
            No worries! Enter your email and we&apos;ll help you get back into
            your account.
          </p>
        </div>

        {/* Form Card - Pure White, No Border, Smooth Corners */}
        <div className="bg-white rounded-[32px] p-10 sm:p-12">
          <ForgotPasswordForm />
        </div>

        {/* Professional Footer */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-2 pt-6 border-t border-(--gray-100) w-full">
            <div className="flex gap-4 mb-1">
              <Link
                href="/terms"
                className="text-[11px] font-bold text-(--gray-400) uppercase tracking-widest hover:text-(--gray-600) transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-[11px] font-bold text-(--gray-400) uppercase tracking-widest hover:text-(--gray-600) transition-colors"
              >
                Privacy
              </Link>
            </div>
            <p className="text-[11px] text-(--gray-400) font-medium uppercase tracking-tighter text-center">
              &copy; {new Date().getFullYear()} My Pharma. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
