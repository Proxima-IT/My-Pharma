import Image from 'next/image';
import RegisterForm from './components/RegisterForm';

export const metadata = {
  title: 'Register | My Pharma',
};

export default function RegisterPage() {
  const pageStyle = {
    backgroundColor: 'var(--color-primary-25)',
    minHeight: '100vh',
  };

  return (
    <main style={pageStyle} className="w-full flex flex-col lg:flex-row items-center">
      
      {/* LEFT SECTION: Independent Image Box */}
      <section className="hidden lg:block lg:w-1/2 h-screen p-6">
        <div className="relative w-full h-full rounded-[32px] overflow-hidden shadow-sm">
          <Image
            src="/assets/images/register-page-image.png"
            alt="Register Illustration"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* RIGHT SECTION: Independent Form Card (Expanded Width) */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[580px] bg-white rounded-[40px] p-10 md:p-16 border border-gray-100/50">
          <RegisterForm />
        </div>
      </section>

    </main>
  );
}