'use client';

import React from 'react';
import { FaFacebook, FaLinkedin } from 'react-icons/fa';
import { BsInstagram } from 'react-icons/bs';
import Image from 'next/image';
import { LuUpload } from 'react-icons/lu';
import { IoSearchOutline } from 'react-icons/io5';
import { FiBell, FiUser } from 'react-icons/fi';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { BsCart3 } from 'react-icons/bs';

const Header = () => {
  return (
    <header>
      {/* top nav */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white bg-gradient-to-r from-success-500/10 to-blue-500/10 text-black py-3 px-6 md:px-9">
        <h1 className="text-lg text-gray-800">
          <span className="font-bold">Call Us: </span>01755697233, 09677333000
        </h1>
        <p className="font-semibold text-center my-2 md:my-0">
          Medicines and healthcare products delivered to your doorstep
        </p>
        <div className="flex items-center gap-5">
          <FaFacebook />
          <div className="h-6 w-0.5 bg-black/10" />
          <FaLinkedin />
          <div className="h-6 w-0.5 bg-black/10" />
          <BsInstagram />
        </div>
      </div>

      {/* ──────────────────────────────────────────────── */}
      {/* MAIN NAV – only changed: lg:gap-6 → lg:gap-10 */}
      <div className="py-4 px-6 md:px-8 flex flex-col lg:flex-row items-center gap-4 lg:gap-30 w-full">
        {/* LEFT – logo + slogan – shrink to content */}
        <div className="flex-shrink-0 w-full lg:w-auto text-center lg:text-left">
          <div className="inline-block">
            <Image
              src="/assets/images/main-logo.png"
              alt="Logo"
              width={700}
              height={475}
              className="w-44 md:w-52 lg:w-60 h-auto mx-auto lg:mx-0"
              priority
            />
          </div>
          <h2 className="text-info-800 text-base mt-1.5">
            Simplifying life beyond medicine.
          </h2>
        </div>

        {/* MIDDLE – grows and fills remaining space */}
        <div className="flex items-center gap-3 w-full min-w-0 flex-1 order-last lg:order-none">
          {/* Upload button – fixed width-ish */}
          <div className="flex-shrink-0">
            <label
              htmlFor="prescription-upload"
              className="
                inline-flex items-center gap-2 whitespace-nowrap
                px-4 py-3.5
                bg-white border border-gray-200 rounded-full
                text-sm font-medium text-black
                shadow-sm cursor-pointer
                hover:shadow-md hover:bg-gray-50 transition
              "
            >
              <LuUpload className="text-lg text-info-800" />
              Upload Prescription
              <input
                id="prescription-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
            </label>
          </div>

          {/* Search – takes all available space */}
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder='Search for "healthcare products"'
              className="
                w-full h-14 md:h-16
                pl-5 pr-14
                rounded-full
                border border-gray-200
                text-base text-gray-700
                placeholder-gray-400
                shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30
              "
            />
            <button
              className="
                absolute right-2 top-1/2 -translate-y-1/2
                w-12 h-12
                rounded-full bg-[#243C8F]
                flex items-center justify-center
                hover:scale-105 transition
              "
            >
              <IoSearchOutline className="text-2xl text-white" />
            </button>
          </div>
        </div>

        {/* RIGHT – icons + location – shrink to content */}
        <div className="flex items-center justify-center lg:justify-end gap-4 md:gap-6 w-full lg:w-auto flex-shrink-0">
          {/* Location */}
          <div className="flex items-center gap-2 cursor-pointer">
            <HiOutlineLocationMarker className="text-xl text-gray-700" />
            <div className="text-right">
              <p className="text-xs text-gray-500">Delivery to</p>
              <p className="text-sm font-semibold text-gray-800">
                Kushtia, Khulna
              </p>
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-gray-100 shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50">
              <FiBell size={20} />
            </div>
            <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-full border border-gray-100 shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50">
              <BsCart3 size={20} />
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                5
              </span>
            </div>
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-gray-100 shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50">
              <FiUser size={20} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
