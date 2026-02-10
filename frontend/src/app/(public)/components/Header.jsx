"use client";

import React from "react";
import { FaFacebook } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { BsInstagram } from "react-icons/bs";

import Image from "next/image";

import { LuUpload } from "react-icons/lu";
import { IoSearchOutline } from "react-icons/io5";

import { FiSearch, FiBell, FiUser } from "react-icons/fi";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { BsCart3 } from "react-icons/bs";



const Header = () => {
  return (
    <header>

      {/* top nav  */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white bg-linear-to-r from-success-500/10 to-blue-500/10 text-black py-3 px-9">
        <h1 className="text-lg text-gray-800 ">
          <span className="font-bold">Call Us: </span>01755697233, 09677333000
        </h1>
        <p className="font-semibold">
          Medicines and healthcare products delivered to your doorstep
        </p>
        <div className="flex items-center gap-5">
          <FaFacebook />
          <div className="h-6 w-0.5 bg-black/10"></div>
          <FaLinkedin />
          <div className="h-6 w-0.5 bg-black/10"></div>
          <BsInstagram />
        </div>
      </div>


      {/* main nav  */}

      <div className="py-3 px-8 grid grid-cols-1 md:grid-cols-3 items-center justify-between gap-3 w-full">
        <div className="w-2.5/12">
          <Image
            src="/assets/images/main-logo.png"
            alt="Logo"
            width={700}
            height={475}
            sizes=""
            style={{
              width: "50%",
              height: "auto",
            }}
          />
          <h2 className="text-info-800 text-base mt-2">
            Simplifying life beyond medicine.
          </h2>
        </div>

        <div className="flex items-center gap-3 w-6/12">
          <div className="">
            <label
              htmlFor="prescription-upload"
              className="
              inline-flex items-center gap-2
              px-3 py-3
              bg-white
              border border-gray-100
              rounded-full
              text-sm font-medium text-black
              shadow-sm
              cursor-pointer
              hover:shadow-md
              hover:bg-gray-50
              transition
              w-full
            "
            >
              <LuUpload className="text-sm text-info-800" />
              Upload Prescription
              <input
                id="prescription-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
            </label>
          </div>
          <div className="relative w-full ">
            {/* Search input */}
            <input
              type="text"
              placeholder='Search for "healthcare products"'
              className="
                w-full h-[64px]
                pl-4 pr-[60px]
                rounded-full
                border border-gray-200
                text-base text-gray-700
                placeholder-gray-400
                shadow-sm
                focus:outline-none
              "
            />

            {/* Search Button */}
            <button
              className="
              absolute right-3 top-1/2 -translate-y-1/2
              w-[40px] h-[40px]
              rounded-full
              bg-[#243C8F]
              flex items-center justify-center
              hover:scale-105 transition
            "
            >
              <IoSearchOutline className="text-2xl text-white" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-3.5/12 justify-end">
          {/* Location */}
          <div className="flex items-center gap-2 cursor-pointer">
            <HiOutlineLocationMarker className="text-xl text-gray-700" />
            <div>
              <p className="text-xs text-gray-500">Delivery to</p>
              <p className="text-sm font-semibold text-gray-800">
                Kushtia, Khulna
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* Bell */}
            <div className="w-12 h-12 rounded-full border border-gray-100 shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50">
              <FiBell size={20} />
            </div>

            {/* Cart */}
            <div className="relative w-12 h-12 rounded-full border border-gray-100 shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50">
              <BsCart3 size={20} />
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                5
              </span>
            </div>

            {/* Profile */}
            <div className="w-12 h-12 rounded-full border border-gray-100 shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50">
              <FiUser size={20} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
