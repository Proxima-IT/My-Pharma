import RegisterFlow from './components/RegisterFlow';
import Link from 'next/link';
import Logo from '@/app/(public)/components/Logo';

export const metadata = {
  title: 'Create Account | My Pharma',
};

export default function RegisterPage() {
  // Inline style to ensure the background color applies regardless of Tailwind's state
  const pageStyle = {
    backgroundColor: 'var(--color-primary-25)',
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
        <div className="flex flex-col items-center text-center">
          <Link
            href="/"
            className="mb-8 block hover:opacity-80 transition-opacity duration-300"
          >
            <Logo className="h-14 w-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Create your account
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Join My Pharma to manage your healthcare needs.
          </p>
        </div>

        {/* Form Card - Pure White, No Border */}
        <div className="bg-white rounded-2xl p-8 sm:p-10">
          <RegisterFlow />
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col items-center gap-6">
          <p className="text-sm text-gray-500 font-medium">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-bold text-primary-500 hover:underline underline-offset-4 transition-all"
            >
              Sign in
            </Link>
          </p>

          {/* Professional Footer */}
          <div className="flex flex-col items-center gap-2 pt-6 border-t border-gray-100 w-full">
            <div className="flex gap-4 mb-1">
              <Link
                href="/terms"
                className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
              >
                Privacy
              </Link>
            </div>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-tighter">
              &copy; {new Date().getFullYear()} My Pharma. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
