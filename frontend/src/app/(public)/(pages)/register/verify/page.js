import VerifyOtpForm from './components/VerifyOtpForm';

export const metadata = {
  title: 'Verify OTP | My Pharma',
};

export default function VerifyOtpPage() {
  return (
    <main className="min-h-screen w-full bg-[#F4F4F4] flex items-center justify-center p-6">
      <div className="w-full max-w-[520px] bg-white rounded-[40px] p-10 md:p-16">
        <VerifyOtpForm />
      </div>
    </main>
  );
}