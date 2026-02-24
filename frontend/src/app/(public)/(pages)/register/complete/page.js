import CompleteRegistrationForm from './components/CompleteRegistrationForm';
import Logo from '@/app/(public)/components/Logo';
import Link from 'next/link';

export const metadata = {
  title: 'Complete Profile | My Pharma',
};

export default function CompleteRegistrationPage() {
  const pageStyle = {
    backgroundColor: 'var(--color-primary-25)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
  };

  return (
    <main style={pageStyle}>
      <div className="w-full max-w-150 flex flex-col gap-12">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="mb-4 transition-transform duration-500 hover:scale-105">
            <Logo className="h-12 w-auto" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight leading-tight">
            Almost there!
          </h1>
          <p className="text-base font-normal text-gray-500 max-w-sm leading-relaxed">
            Complete your profile to unlock all features of the{' '}
            <span className="text-primary-500 font-medium">My Pharma</span>{' '}
            ecosystem.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[32px] p-10 sm:p-16 transition-all duration-500">
          <CompleteRegistrationForm />
        </div>

        {/* Footer Section */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3 pt-8 border-t border-gray-100 w-full">
            <div className="flex gap-8 mb-1">
              <Link
                href="/terms"
                className="text-xs font-semibold text-gray-400 uppercase tracking-[0.2em] hover:text-primary-500 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-xs font-semibold text-gray-400 uppercase tracking-[0.2em] hover:text-primary-500 transition-colors"
              >
                Privacy
              </Link>
            </div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.1em]">
              &copy; {new Date().getFullYear()} My Pharma. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
