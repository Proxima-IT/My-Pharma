"use client";

import Image from "next/image";
import Link from "next/link";
import React, { use } from "react";
import { RiArrowRightLine } from "react-icons/ri";
import { FaFacebook } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MdOutlineWhatsapp } from "react-icons/md";


const Footer = () => {

  return (
    <div className="bg-primary-900 px-3 lg:px-7 py-12 text-white/70">
      {/* footer container  */}
      <footer className=" flex flex-col lg:flex-row gap-7">
        {/* left content  */}
        <div className="bg-white/8 rounded-2xl w-full lg:w-4/12">
          <div className=" py-8 px-6 space-y-5">

            <Image
              src="/assets/images/footer-logo.png"
              alt="Logo"
              width={700}
              height={475}
              sizes="100vw"
              style={{
                width: "50%",
                height: "auto",
              }}
            />

            <p>
              Your trusted online pharmacy for genuine medicines and healthcare
              essentials.
            </p>

            <div className="relative space-y-3 mt-10">
              <h4 className="text-lg">Subscribe to our emails</h4>
              <input
                type="email"
                name=""
                id=""
                placeholder="Email"
                className="w-full rounded-[55px] border-2 border-white/10 bg-white/10 px-4 py-3 h-full"
              />
              <button className="absolute top-1/2 right-5">
                <RiArrowRightLine className="text-2xl" />
              </button>
            </div>
            <div className="flex gap-3 z-10">
              <div className="w-[40] h-[40] rounded-full bg-white/10 flex justify-center items-center hover:scale-125 duration-500 transition-all">
                <Link href="/">
                  <FaFacebook className="text-xl" />
                </Link>
              </div>
              <div className="w-[40] h-[40] rounded-full bg-white/10 flex justify-center items-center hover:scale-125 duration-500 transition-all">
                <Link href="/">
                  <FaInstagram />

                </Link>
              </div>
              <div className="w-[40] h-[40] rounded-full bg-white/10 flex justify-center items-center hover:scale-125 duration-500 transition-all">
                <Link href="/">
                  <FaXTwitter />

                </Link>
              </div>
              <div className="w-[40] h-[40] rounded-full bg-white/10 flex justify-center items-center hover:scale-125 duration-500 transition-all">
                <Link href="/">
                  <MdOutlineWhatsapp />
                </Link>
              </div>
            </div>
          </div>
        </div>


        {/* right content  */}
        <div className="bg-white/8 rounded-2xl p-4 lg:p-8 w-full  lg:w-8/12 ">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* column 1 */}
            <div>
              <h3 className="text-white text-base font-extrabold ">Quick Links</h3>
              <div className="text-[13px] space-y-3 mt-6">
                <p>Home</p>
                <p>Order Medicines</p>
                <p>Upload Prescription</p>
                <p>Health Products</p>
                <p>Doctor Consultation</p>
              </div>
            </div>
            {/* column 2 */}
            <div>
              <h3 className="text-white text-base font-extrabold mb-2">Services</h3>
              <div className="text-[13px] space-y-3 mt-6">

                <p>Prescription Medicines</p>
                <p>Over-the-Counter Medicines</p>
                <p>Chronic Care (Diabetes, BP)</p>
                <p>Lab Tests at Home</p>
                <p>Medicine Refill</p>
              </div>
            </div>
            {/* column 3 */}
            <div>
              <h3 className="text-white text-base font-extrabold mb-2">Trust & Compliance</h3>
              <div className="text-[13px] space-y-3 mt-6">
                <p>Pharmacy License</p>
                <p>Regulatory Compliance</p>
                <p>Quality Assurance</p>
                <p>Privacy Policy</p>
                <p>Terms & Conditions</p>
              </div>

            </div>
            {/* column 4 */}
            <div>
              <h3 className="text-white text-base font-extrabold mb-4">
                Go through
              </h3>

              <div className="flex flex-col items-start gap-6">
                {/* Item 1 */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-white/10 flex justify-center items-center hover:scale-110 transition">
                    <Link href="/">
                      <FaFacebook className="text-white text-sm" />
                    </Link>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-white text-sm font-bold">
                      Hot Line
                    </h3>
                    <p className="text-xs text-white/80">
                      +8809612316708
                    </p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-white/10 flex justify-center items-center hover:scale-110 transition">
                    <Link href="/">
                      <FaFacebook className="text-white text-sm" />
                    </Link>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-white text-sm font-bold">
                      Support
                    </h3>
                    <p className="text-xs text-white/80 ">
                      support@mypharma.com
                    </p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-white/10 flex justify-center items-center hover:scale-110 transition">
                    <Link href="/">
                      <FaFacebook className="text-white text-sm" />
                    </Link>
                  </div>

                  <div className="space-y-1 ">
                    <h3 className="text-white text-sm font-bold">
                      Address
                    </h3>
                    <p className="text-xs text-white/80 leading-relaxed">
                      B/19-2, Road-54, Mirpur, Dhaka-1208
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="flex items-center gap-4 mt-8 md:mt-12 lg:mt-20">
            <p className="text-sm lg:text-base">We accept:</p>
            <Image
              src="/assets/images/visa.png"
              alt="Logo"
              width={700}
              height={475}
              sizes="100vw"
              style={{
                width: "10%",
                height: "auto",
              }}
            />
            <Image
              src="/assets/images/masterclass.png"
              alt="Logo"
              width={700}
              height={475}
              sizes="100vw"
              style={{
                width: "10%",
                height: "auto",
              }}
            />
            <Image
              src="/assets/images/american.png"
              alt="Logo"
              width={700}
              height={475}
              sizes="100vw"
              style={{
                width: "10%",
                height: "auto",
              }}
            />
            <Image
              src="/assets/images/pay4.png"
              alt="Logo"
              width={700}
              height={475}
              sizes="100vw"
              style={{
                width: "10%",
                height: "auto",
              }}
            />
            <Image
              src="/assets/images/discover.png"
              alt="Logo"
              width={700}
              height={475}
              sizes="100vw"
              style={{
                width: "10%",
                height: "auto",
              }}
            />
          </div>
        </div>
      </footer>
      <p className="flex justify-center mt-6 text-sm">© 2026 My Pharma. All rights reserved.</p>
    </div>
  );
};

export default Footer;
