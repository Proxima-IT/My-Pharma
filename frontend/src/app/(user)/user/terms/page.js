'use client';

import React from 'react';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function TermsAndConditionsPage() {
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Mobile Back Button */}
      <div className="flex items-center gap-4 lg:hidden mb-2">
        <Link href="/user" className="p-2 -ml-2 text-gray-600">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Terms & Conditions</h1>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[32px] p-8 md:p-12 border border-gray-100/50">
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight mb-10">
          Premium Licenses
        </h1>

        <div className="space-y-8 text-[15px] text-gray-600 leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="font-bold text-gray-900 mb-3">1. Use of Services</h2>
            <p className="mb-3">
              My Pharma provides an online platform for ordering medicines,
              uploading prescriptions, booking lab tests, and accessing
              healthcare-related services. By using our services, you confirm
              that:
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li>You are at least 18 years old.</li>
              <li>You provide accurate and complete information.</li>
              <li>You will use the platform only for lawful purposes.</li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="font-bold text-gray-900 mb-3">
              2. Prescription Medicines
            </h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>
                Prescription medicines will only be dispensed upon submission of
                a valid prescription.
              </li>
              <li>
                Our licensed pharmacists reserve the right to verify, reject, or
                request clarification regarding any prescription.
              </li>
              <li>My Pharma does not issue prescriptions.</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="font-bold text-gray-900 mb-3">
              3. Order Acceptance & Cancellation
            </h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>
                Orders are subject to pharmacist review and stock availability.
              </li>
              <li>
                My Pharma reserves the right to cancel or refuse any order at
                its discretion.
              </li>
              <li>Customers may request cancellation before order dispatch.</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="font-bold text-gray-900 mb-3">
              4. Pricing & Payments
            </h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>All prices are listed in BDT (Bangladeshi Taka).</li>
              <li>Prices may change without prior notice.</li>
              <li>
                Payment must be completed before order processing (unless Cash
                on Delivery is selected, if available).
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="font-bold text-gray-900 mb-3">5. Delivery Policy</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>
                Delivery timelines may vary based on location and product
                availability.
              </li>
              <li>Same-day delivery is available in selected areas only.</li>
              <li>
                Delays caused by unforeseen circumstances are not the
                responsibility of My Pharma.
              </li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="font-bold text-gray-900 mb-3">
              6. Returns & Refunds
            </h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>
                Medicines once delivered cannot be returned unless damaged,
                incorrect, or expired.
              </li>
              <li>Refunds will be processed after verification.</li>
              <li>
                Prescription medicines are non-returnable except in case of
                error.
              </li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="font-bold text-gray-900 mb-3">
              7. Lab Test & Healthcare Services
            </h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>
                Lab tests are conducted by certified partner laboratories.
              </li>
              <li>
                My Pharma acts as a facilitator and is not responsible for
                medical interpretations.
              </li>
              <li>
                Patients should consult a licensed healthcare professional for
                medical advice.
              </li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2 className="font-bold text-gray-900 mb-3">
              8. User Responsibilities
            </h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Upload fake, altered, or expired prescriptions.</li>
              <li>Use the platform for fraudulent activities.</li>
              <li>Misuse the services in any unlawful manner.</li>
            </ul>
          </section>

          {/* 9 */}
          <section>
            <h2 className="font-bold text-gray-900 mb-3">
              9. Privacy & Data Protection
            </h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>
                Your personal and medical information is handled securely.
              </li>
              <li>
                We do not share medical data without consent, except where
                required by law.
              </li>
              <li>Please review our Privacy Policy for more details.</li>
            </ul>
          </section>

          {/* 10 */}
          <section>
            <h2 className="font-bold text-gray-900 mb-3">
              10. Limitation of Liability
            </h2>
            <p className="mb-3">My Pharma shall not be liable for:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Misuse of medicines.</li>
              <li>Adverse reactions due to incorrect usage.</li>
              <li>Delays caused by third-party delivery providers.</li>
            </ul>
          </section>

          {/* 11 */}
          <section>
            <h2 className="font-bold text-gray-900 mb-3">
              11. Intellectual Property
            </h2>
            <p>
              All content, branding, and materials on this website are the
              property of My Pharma and may not be copied or reused without
              permission.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="font-bold text-gray-900 mb-3">
              12. Changes to Terms
            </h2>
            <p>
              My Pharma reserves the right to modify these Terms & Conditions at
              any time. Continued use of the platform constitutes acceptance of
              updated terms.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="font-bold text-gray-900 mb-3">13. Governing Law</h2>
            <p>
              These Terms & Conditions are governed by the laws of Bangladesh.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
