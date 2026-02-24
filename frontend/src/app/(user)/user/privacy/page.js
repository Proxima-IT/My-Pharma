'use client';

import React from 'react';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function PrivacyPage() {
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Mobile Back Button */}
      <div className="flex items-center gap-4 lg:hidden mb-2">
        <Link href="/user" className="p-2 -ml-2 text-gray-600">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Privacy Policy</h1>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[32px] p-8 md:p-12 border border-gray-100/50">
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight mb-8">
          Privacy Policy
        </h1>

        <div className="space-y-8 text-[15px] text-gray-600 leading-relaxed">
          <p>
            Please read this Privacy Policy carefully. By accessing or using the
            website or app, you agree to be bound by the terms described herein
            and all the terms incorporated by reference. If you do not agree to
            all of these terms, do not use the website or app.
          </p>

          <section>
            <h2 className="font-bold text-gray-900 mb-3 text-lg">
              Content & Purpose
            </h2>
            <p className="mb-4">
              This Privacy Policy (“Privacy Policy”) applies to your use of the
              domain name www.mypharma.com, an internet-based portal, and My
              Pharma, a mobile application, owned and operated by My Pharma
              Limited, a company duly incorporated under the provisions of the
              Companies Act, 1994 (hereinafter referred to as “My Pharma” or
              “We” or “Our” or “Us” or “Company”). The domain name and the
              mobile application are collectively referred to as the “Website.”
            </p>
            <p className="mb-4">
              The Website is a platform that facilitates the purchase of
              pharmaceuticals, healthcare products, lab tests, wellness items,
              beauty products, nutritional supplements, pet care essentials, and
              food items sold by various relevant suppliers such as
              manufacturers, importers, and distributors (referred to as
              “Services”, with the relevant suppliers referred to as “Sellers”).
            </p>
            <p>
              We have implemented reasonable security practices and procedures
              to protect information assets and the nature of our business.
              While we strive to provide security commensurate with industry
              standards, we cannot ensure or warrant the complete security of
              all information transmitted to us due to the inherent
              vulnerabilities of the internet.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-3 text-lg">
              Information Collection and Usage
            </h2>
            <p className="mb-3">
              This Privacy Policy helps you understand the following:
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li>
                The type of Personal Information (including Sensitive Personal
                Data or Information) that My Pharma collects from Users.
              </li>
              <li>
                The purpose of collecting, means, and modes of usage of such
                Personal Information.
              </li>
              <li>How and to whom My Pharma will disclose such information.</li>
              <li>
                How My Pharma will protect Personal Information, including
                Sensitive Personal Data or Information collected from Users.
              </li>
              <li>
                How Users may access and/or modify their Personal Information.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-3 text-lg">
              Types of Personal Information Collected
            </h2>
            <p className="mb-3">
              As part of the registration process, My Pharma may collect the
              following categories of Personal Information (“User Information”):
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Name</li>
              <li>User ID</li>
              <li>Email address</li>
              <li>Address (including country and ZIP/postal code)</li>
              <li>Gender</li>
              <li>Age</li>
              <li>Phone Number</li>
              <li>Password chosen by the User</li>
              <li>Valid financial account information</li>
              <li>Other details volunteered by the User</li>
            </ul>
            <p className="mt-3">
              Users may be required to upload copies of their prescriptions,
              which will be stored/disclosed only as specified in this Privacy
              Policy and the Terms of Use.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-3 text-lg">
              Internet Use and Cookies
            </h2>
            <p>
              My Pharma may collect information about the User’s browsing
              history, including the URL of the site visited before our Website,
              IP address, operating system, browser type, and ISP. The Website
              uses temporary cookies to store certain non-sensitive data used
              for technical administration, research, and user administration.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-3 text-lg">
              Use of Personal Information
            </h2>
            <p className="mb-3">Information collected may be used for:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>User registration and account management</li>
              <li>Processing orders and providing Services</li>
              <li>Completing transactions and billing</li>
              <li>Technical administration and Website customization</li>
              <li>
                Delivering personalized information and targeted advertisements
              </li>
              <li>Improving Services, features, and functionality</li>
              <li>Research, surveys, and statistical analysis</li>
              <li>Customer support and complaint resolution</li>
              <li>Communicating changes in Services or policies</li>
              <li>Verifying user identity and preventing fraud</li>
              <li>Investigating disputes and enforcing Terms of Use</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-3 text-lg">
              Disclosure and Transfer of Personal Information
            </h2>
            <p className="mb-3">
              My Pharma may disclose/transfer User Information to third parties
              including:
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Sellers and service providers under contract</li>
              <li>Affiliates in Bangladesh or other countries</li>
              <li>Government institutions/authorities as required by law</li>
              <li>Employees and data processors on a need-to-know basis</li>
              <li>
                Non-personally identifiable information to ad servers, agencies,
                and research firms
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-3 text-lg">
              Retention of Information
            </h2>
            <p>
              Information collected/stored under this Privacy Policy is
              maintained in electronic form and may be converted to physical
              form. Regardless of storage, My Pharma keeps all User Information
              confidential and uses/discloses it only as specified.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-3 text-lg">
              Security Practices and Procedures
            </h2>
            <p>
              My Pharma adopts reasonable security practices and procedures to
              protect Personal Information from loss, misuse, unauthorized
              access, disclosure, alteration, and destruction. However, we are
              not responsible for any intercepted information sent via the
              internet and release us from claims arising out of such use.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-3 text-lg">
              User Rights
            </h2>
            <p>
              Users can access, modify, correct, and delete Personal Information
              provided to My Pharma. Withdrawal of consent will not be
              retroactive. To update or correct information, email us at
              support@mypharma.com. If a User does not agree with the
              information collected, they can request its deletion.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-3 text-lg">
              Changes to the Privacy Policy
            </h2>
            <p>
              My Pharma may update this Privacy Policy at any time. Significant
              changes will be notified via the Website or email. Continued use
              of the Service after notice of changes constitutes consent to the
              updated practices.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-3 text-lg">Contact Us</h2>
            <p>
              For questions relating to this Privacy Policy, contact us at
              +8801XXXXXXXXX or support@mypharma.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
