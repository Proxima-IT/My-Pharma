import VerifyResetOtpForm from './components/VerifyResetOtpForm';

export const metadata = {
  title: 'Verify OTP | My Pharma',
};

export default function VerifyResetOtpPage() {
  return (
    <main className="min-h-screen w-full bg-[#F4F4F4] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[580px] bg-white rounded-[40px] p-6 sm:p-10 md:p-16 border border-gray-100/50">
        <VerifyResetOtpForm />
      </div>
    </main>
  );
}
