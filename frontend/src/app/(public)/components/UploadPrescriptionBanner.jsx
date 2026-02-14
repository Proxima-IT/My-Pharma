"use client";

import Image from "next/image";
import { LuCloudUpload } from "react-icons/lu";

const UploadPrescriptionBanner = () => {
  return (
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
        className="w-full h-auto bg-center bg-no-repeat bg-cover rounded-xl min-w-full grid grid-cols-1 lg:grid-cols-2 items-center gap-6 py-9"
        style={{
          backgroundImage: "url('/assets/images/uploadbanner.png')",
        }}
      >
        <div className="flex justify-start items-start">
          <Image
            src="/assets/images/appicon.png"
            alt="upload banner"
            width={200}
            height={200}
            className=" w-1/2 "
          />
        </div>
        {/* Content */}
        <div className="text-white space-y-2 flex flex-col items-center lg:items-start text-center lg:text-left ">
          <span className=" font-semibold text-sm text-[#10B981]">
            Upload Your Prescription
          </span>
          <br />
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight">
            We’ll take care of the rest
          </h1>
          <p className="mt-3 sm:mt-4 text-white/70 max-w-lg text-sm ">
            No need to search or worry we ensure accuracy, privacy, and genuine
            medicines every time.
          </p>
          <button className="mt-5 sm:mt-6 flex items-center gap-2  cursor-pointer rounded-full bg-white px-6 py-2 text-black text-sm sm:text-base font-semibold hover:bg-blue-50 transition">
            <span>
              <LuCloudUpload />
            </span>
            Upload Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPrescriptionBanner;
