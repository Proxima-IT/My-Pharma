import Image from 'next/image';
import React from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { LuCloudUpload } from 'react-icons/lu';
const BookTestBanner = () => {
  return (
    <div>
      <div className=" py-[70px]">
        {/* <Image
        src="/assets/images/uploadbanner.png"
        alt="upload banner"
        width={1000}
        height={1000}
        className=" lg:w-full object-contain"
        priority
      /> */}
        <div
          className="w-full min-h-[480px] lg:min-h-0 bg-center bg-no-repeat bg-cover rounded-xl min-w-full grid grid-cols-1 lg:grid-cols-2 items-start justify-center gap-6 p-9 relative overflow-hidden lg:overflow-visible"
          style={{
            backgroundImage: "url('/assets/images/booktest.png')",
          }}
        >
          <div className="flex justify-center lg:justify-end items-start lg:items-end position-relative pt-6 lg:pt-0 order-1 lg:order-2">
            <Image
              src="/assets/images/chatgptimage.png"
              alt="upload banner"
              width={340}
              height={380}
              className="rounded-lg w-4/5 max-w-[340px] lg:w-[340px] lg:absolute lg:bottom-0 lg:top-0 lg:right-0 lg:lg:right-10 lg:-translate-y-1/4"
            />
          </div>
          {/* Content */}
          <div className="text-white space-y-2 pl-10 order-2 lg:order-1">
            <span className=" font-semibold text-sm text-[#10B981]">
              Lab Tests at Home
            </span>
            <br />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight">
              Accurate diagnostics without visiting a lab
            </h1>
            <p className="mt-3 sm:mt-4 text-white/70 max-w-lg text-sm ">
              We partner with certified laboratories to ensure accurate reports,
              hygienic procedures, and timely digital results all from the
              comfort of your home.
            </p>
            <button className="mt-5 sm:mt-6 flex items-center gap-2 cursor-pointer rounded-full bg-white px-6 py-2 text-black text-sm sm:text-base font-semibold hover:bg-blue-50 transition">
              <span>
                <LuCloudUpload />
              </span>
              Book Test Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BookTestBanner;