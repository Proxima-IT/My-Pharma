"use client";

import Image from "next/image";
import Link from "next/link";
import React, { use } from "react";
import { RiArrowRightLine } from "react-icons/ri";
import { FaFacebook } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MdOutlineWhatsapp } from "react-icons/md";
import { SlPhone } from "react-icons/sl";
import { CiMail } from "react-icons/ci";
import { CiLocationOn } from "react-icons/ci";

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
              <button className="absolute top-[45%] right-5">
                <RiArrowRightLine className="text-2xl" />
              </button>
            </div>
            <div className="flex gap-3 z-10">
              <div className="w-[40] h-[40] rounded-full bg-white/10 flex justify-center items-center hover:scale-125 duration-500 transition-all">
                <a href="https://www.facebook.com/">
                  <FaFacebook className="text-xl" />
                </a>
              </div>
              <div className="w-[40] h-[40] rounded-full bg-white/10 flex justify-center items-center hover:scale-125 duration-500 transition-all">
                <a href="https://www.instagram.com/?hl=en">
                  <FaInstagram />
                </a>
              </div>
              <div className="w-[40] h-[40] rounded-full bg-white/10 flex justify-center items-center hover:scale-125 duration-500 transition-all">
                <a href="https://x.com/">
                  <FaXTwitter />
                </a>
              </div>
              <div className="w-[40] h-[40] rounded-full bg-white/10 flex justify-center items-center hover:scale-125 duration-500 transition-all">
                <Link href="https://wa.me/8801755697233">
                  <MdOutlineWhatsapp />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* right content  */}
        <div className="bg-white/8 rounded-2xl p-4 lg:p-8 w-full  lg:w-8/12 ">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* column 1 */}
            <div>
              <h3 className="text-white text-base font-extrabold ">
                Quick Links
              </h3>
              <div className="text-[14px] flex flex-col gap-3 mt-6">
                
                  <Link href="/">
                    <p>Home</p>
                  </Link>
                
                <Link href="/order-medicine">
                  <p>Order Medicines</p>
                </Link>
                <Link href="/upload-prescription">
                  <p>Upload Prescription</p>
                </Link>
                <Link href="/health-products">
                  <p>Health Products</p>
                </Link>
                <Link href="/consultation">
                  <p>Doctor Consultation</p>
                </Link>
              </div>
            </div>
            {/* column 2 */}
            <div>
              <h3 className="text-white text-base font-extrabold mb-2">
                Services
              </h3>
              <div className="text-[14px] flex flex-col gap-3 mt-6">
                <Link href="/prescription-medicines">
                  <p>Prescription Medicines</p>s
                </Link>
                <Link href="/Over-the-Counter Medicines">
                  <p>Over-the-Counter Medicines</p>
                </Link>
                <Link href="/chronic-care">
                  {" "}
                  <p>Chronic Care (Diabetes, BP)</p>
                </Link>
                <Link href="/lab-test">
                  <p>Lab Tests at Home</p>
                </Link>
                <Link href="/medicine-refill">
                  <p>Medicine Refill</p>
                </Link>
              </div>
            </div>
            {/* column 3 */}
            <div>
              <h3 className="text-white text-base font-extrabold mb-2">
                Trust & Compliance
              </h3>
              <div className="text-[14px] flex flex-col gap-3 mt-6">
                <Link href="/pharmacy-license">
                  <p>Pharmacy License</p>
                </Link>
                <Link href="/regulatory-compliance">
                  <p>Regulatory Compliance</p>
                </Link>
                <Link href="/quality-assurance">
                  <p>Quality Assurance</p>
                </Link>
                <Link href="/privacy-policy">
                  <p>Privacy Policy</p>
                </Link>
                <Link href="/terms">
                  <p>Terms & Conditions</p>
                </Link>
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
                      <SlPhone className="text-white text-sm" />
                    </Link>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-white text-sm font-bold">Hot Line</h3>
                    <p className="text-xs text-white/80">+8809612316708</p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-white/10 flex justify-center items-center hover:scale-110 transition">
                    <Link href="/">
                      <CiMail className="text-white text-sm" />
                    </Link>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-white text-sm font-bold">Support</h3>
                    <p className="text-xs text-white/80 ">
                      support@mypharma.com
                    </p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-white/10 flex justify-center items-center hover:scale-110 transition">
                    <Link href="/">
                      <CiLocationOn className="text-white text-sm" />
                    </Link>
                  </div>

                  <div className="space-y-1 ">
                    <h3 className="text-white text-sm font-bold">Address</h3>
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
              src="/assets/images/payment.png"
              alt="Logo"
              width={1000}
              height={1000}
              sizes="100vw"
              style={{
                width: "70%",
                height: "auto",
              }}
            />
            <div className="h-16 w-0.5 bg-white/10" />
            <div className="flex flex-col items-center">
              <p className="text-sm lg:text-base text-center">Verified By:</p>
              <Image
                src="/assets/images/sslcommerz.png"
                alt="Logo"
                width={1000}
                height={1000}
                sizes="100vw"
                style={{
                  width: "100%",
                  height: "auto",
                }}
              />
            </div>
            {/* <Image
              src="/assets/images/masterclass.png"
              alt="Logo"
              width={700}
              height={475}
              sizes="100vw"
              style={{
                width: "10%",
                height: "auto",
              }}
            /> */}
            {/* <Image
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
            /> */}
            {/* <Image
              src="/assets/images/discover.png"
              alt="Logo"
              width={700}
              height={475}
              sizes="100vw"
              style={{
                width: "10%",
                height: "auto",
              }}
            /> */}
          </div>
        </div>
      </footer>
      <p className="flex justify-center mt-6 text-sm">
        © 2026 My Pharma. All rights reserved.
      </p>
    </div>
  );
};

export default Footer;
