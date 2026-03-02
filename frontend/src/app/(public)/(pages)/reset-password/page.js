import ResetPasswordForm from './components/ResetPasswordForm';

export const metadata = {
  title: 'Reset Password | My Pharma',
};

export default function ResetPasswordPage() {
  const pageStyle = {
    backgroundColor: '#F4F4F4',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  };

  return (
    <main style={pageStyle}>
      <div className="w-full max-w-[580px] bg-white rounded-[40px] p-10 md:p-16 border border-gray-100/50">
        <ResetPasswordForm />
      </div>
    </main>
  );
}
