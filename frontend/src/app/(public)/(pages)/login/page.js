import Image from 'next/image';
import LoginForm from './components/LoginForm';

export const metadata = {
  title: 'Login | My Pharma',
};

export default function LoginPage() {
  const pageStyle = {
    backgroundColor: 'var(--color-primary-25)',
    minHeight: '100vh',
  };

  return (
    <main style={pageStyle} className="w-full flex flex-col lg:flex-row-reverse items-center">
      
      {/* RIGHT SECTION: Independent Image Box */}
      <section className="hidden lg:block lg:w-1/2 h-screen p-6">
        <div className="relative w-full h-full rounded-[32px] overflow-hidden shadow-sm">
          <Image
            src="/assets/images/login-page-image.png"
            alt="Login Illustration"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* LEFT SECTION: Independent Form Card */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[580px] bg-white rounded-[40px] p-10 md:p-16 border border-gray-100/50">
          <LoginForm />
        </div>
      </section>

    </main>
  );
}