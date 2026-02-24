import ForgotPasswordForm from './components/ForgotPasswordForm';

export const metadata = {
  title: 'Forgot Password | My Pharma',
};

export default function ForgotPasswordPage() {
  const pageStyle = {
    backgroundColor: 'var(--color-primary-25)',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  };

  return (
    <main style={pageStyle}>
      <div className="w-full max-w-[580px] bg-white rounded-[40px] p-10 md:p-16 border border-gray-100/50">
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
