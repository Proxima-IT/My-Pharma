import Link from 'next/link';

const COOKIE_SECTIONS = [
  {
    title: 'Essential Cookies',
    description:
      'Required for core site features like authentication, cart persistence, and secure checkout.',
  },
  {
    title: 'Performance Cookies',
    description:
      'Help us understand usage patterns so we can improve page speed and reliability.',
  },
  {
    title: 'Preference Cookies',
    description:
      'Remember language, region, and other settings to personalize your experience.',
  },
];

export default function CookiesPage() {
  return (
    <section className="px-4 py-12 md:py-16">
      <div className="mx-auto w-full max-w-4xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
        <h1 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">
          Cookie Policy
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-gray-600 md:text-base">
          My Pharma uses cookies to keep the website secure, improve performance, and
          provide a better shopping experience. This page explains the main cookie
          categories currently used on the site.
        </p>

        <div className="mt-8 space-y-5">
          {COOKIE_SECTIONS.map(section => (
            <article
              key={section.title}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-4 md:p-5"
            >
              <h2 className="text-base font-bold text-gray-900 md:text-lg">
                {section.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 md:text-base">
                {section.description}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-8 text-xs text-gray-500 md:text-sm">
          To request data deletion or ask policy questions, contact
          {' '}
          <a className="font-semibold text-gray-700" href="mailto:support@mypharma.com">
            support@mypharma.com
          </a>
          .
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-(--color-primary-500) px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-(--color-primary-600)"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
