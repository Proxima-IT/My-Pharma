import Image from "next/image";
import React from "react";
import { MdArrowForwardIos } from "react-icons/md";
import { TbCurrencyTaka } from "react-icons/tb";

const SmartHealthBundle = () => {
  return (
    <div className="bg-white  pt-17.5 px-4">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl">
          Smart health bundles at better value
        </h1>

        <div className="flex items-center gap-3">
          <button className="border border-info-500/20 rounded-full p-3 text-black rotate-180 bg-white flex gap-3 items-center text-sm font-semibold cursor-pointer ">
            <span>
              <MdArrowForwardIos />
            </span>
          </button>
          <button className="border border-info-500/10 rounded-full p-3 text-white bg-black flex gap-3 items-center text-sm font-semibold cursor-pointer">
            <span>
              <MdArrowForwardIos />
            </span>
          </button>
        </div>
      </div>

      {/* product card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-5 mt-7">
        {/* cards */}

        {/* Image wrapper */}

        {/* card 1  */}
        <div className="relative  rounded-2xl w-full aspect-square flex flex-col items-start justify-center gap-4  p-5 bg-[#B0E5C7]">
          <h1 className="text-base font-bold">Health Combo Packages</h1>
          <p>Designed for daily and long-term care</p>

          <div className="flex items-center gap-1">
            {/* originalPrice  */}
            <div className=" flex items-center text-xl font-bold text-black">
              <TbCurrencyTaka />
              <sub>1,250</sub>
            </div>

            {/* discountPercent  */}
            <sub className=" flex items-center text-xl text-gray-500">
              <TbCurrencyTaka />
              <sub>
                <del>1,250</del>
              </sub>
            </sub>
          </div>

          <button className="border border-info-500/10 bg-white rounded-[90px] px-4 py-2 text-primary-500 flex gap-3 items-center text-sm font-semibold cursor-pointer">
            See Package
            <span>
              <MdArrowForwardIos />
            </span>
          </button>

          {/* Product image */}
       
           <Image
            src="/assets/images/bundle1.png"
            alt=""
            width={300}
            height={300}
            className="max-w-[75%] max-h-[75%] object-contain mx-auto "
            priority
          />
         
        </div>

        {/* card 2  */}
        <div className="relative  rounded-2xl w-full aspect-square flex flex-col items-start justify-center gap-4  p-5 bg-[#B0B0FD]">
          <h1 className="text-base font-bold">Baby Care Combo Packages</h1>
          <p>Designed for daily and long-term care</p>

          <div className="flex items-center gap-1">
            {/* originalPrice  */}
            <div className=" flex items-center text-xl font-bold text-black">
              <TbCurrencyTaka />
              <sub>5,250</sub>
            </div>

            {/* discountPercent  */}
            <sub className=" flex items-center text-xl text-gray-500">
              <TbCurrencyTaka />
              <sub>
                <del>1,790</del>
              </sub>
            </sub>
          </div>

          <button className="border border-info-500/10 bg-white rounded-[90px] px-4 py-2 text-primary-500 flex gap-3 items-center text-sm font-semibold cursor-pointer">
            See Package
            <span>
              <MdArrowForwardIos />
            </span>
          </button>

          {/* Product image */}
          <Image
            src="/assets/images/bundle2.png"
            alt=""
            width={300}
            height={300}
            className="max-w-[75%] max-h-[75%] object-contain mx-auto"
            priority
          />
        </div>

        {/* card 3  */}
        <div className="relative  rounded-2xl  w-full aspect-square flex flex-col items-start justify-center gap-4  p-5 bg-[#B0E5C7]">
          <h1 className="text-base font-bold">Handwash Combo Packages</h1>
          <p>Designed for daily and long-term care</p>

          <div className="flex items-center gap-1">
            {/* originalPrice  */}
            <div className=" flex items-center text-xl font-bold text-black">
              <TbCurrencyTaka />
              <sub>4,250</sub>
            </div>

            {/* discountPercent  */}
            <sub className=" flex items-center text-xl text-gray-500">
              <TbCurrencyTaka />
              <sub>
                <del>1,790</del>
              </sub>
            </sub>
          </div>


          <button className="border border-info-500/10 bg-white rounded-[90px] px-4 py-2 text-primary-500 flex gap-3 items-center text-sm font-semibold cursor-pointer">
            See Package
            <span>
              <MdArrowForwardIos />
            </span>
          </button>

          {/* Product image */}
          <Image
            src="/assets/images/bundle3.png"
            alt=""
            width={300}
            height={300}
            className="max-w-[75%] max-h-[45%] object-contain mx-auto"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default SmartHealthBundle;
