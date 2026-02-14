import Image from "next/image";
import React from "react";
import { IoSearchOutline } from "react-icons/io5";
import { LuCloudUpload } from "react-icons/lu";

const BookTestBanner = () => {
  return (
    <div>
       <div className="bg-white py-17.5">
      {/* <Image
        src="/assets/images/uploadbanner.png"
        alt="upload banner"
        width={1000}
        height={1000}
        className=" lg:w-full  object-contain"
        priority
      /> */}

      <div
        className="w-full h-auto bg-center bg-no-repeat bg-cover rounded-xl min-w-full grid grid-cols-1 lg:grid-cols-2 items-center justify-center gap-6 py-9"
        style={{
          backgroundImage: "url('/assets/images/booktest.png')",
        }}
      >
        
        {/* Content */}
        <div className="text-white space-y-2 pl-10">
          <span className=" font-semibold text-sm text-[#10B981]">
            Lab Tests at Home
          </span>
          <br />
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight">
            Accurate diagnostics without visiting a lab
          </h1>
          <p className="mt-3 sm:mt-4 text-white/70 max-w-lg text-sm ">
            We partner with certified laboratories to ensure accurate reports, hygienic procedures, and timely digital results all from the comfort of your home.
          </p>
          <button className="mt-5 sm:mt-6 flex items-center gap-2  cursor-pointer rounded-full bg-white px-6 py-2 text-black text-sm sm:text-base font-semibold hover:bg-blue-50 transition">
            <span>
              <LuCloudUpload />
            </span>
            Book Test Now
          </button>
        </div>

        <div className="flex justify-end items-end">
          <Image
            src="/assets/images/chatgptimage.png"
            alt="upload banner"
            width={250}
            height={200}
            className=" "
          />
        </div>
      </div>
    </div>
    </div>
  );
};

export default BookTestBanner;
