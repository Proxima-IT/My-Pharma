// "use client"

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { TbCurrencyTaka } from "react-icons/tb";

const Cart = () => {
  return (
    <div className="px-7 pt-7 pb-28">
      {/* page heading  */}
      <div className="flex items-center gap-5">
        <Link href="/products">
          <button className="border border-info-500/10 bg-white rounded-[90px] px-3 lg:px-6 py-2 lg:py-1.5 text-center text-primary-500 flex gap-2 items-center text-sm font-semibold cursor-pointer">
            <span>
              <MdKeyboardArrowLeft />
            </span>
            Back
          </button>
        </Link>
        <h1 className="text-3xl font-semibold">Your Cart</h1>
      </div>

      {/* cart cards  */}
      <div className="mt-6 w-full flex gap-7 ">
        <div className="w-[55%] grid grid-cols-1 gap-4">
          <div className=" flex flex-col md:flex-row bg-white rounded-[18px] border-2 border-gray-100 gap-3.5">
            {/* Image wrapper */}
            <div className="relative bg-imageBG rounded-xl w-1/2 aspect-square flex items-center justify-center overflow-hidden p-5">
              {/* Discount badge */}
              <span className="absolute top-3 right-3 bg-green-600 text-white text-xs px-3 py-1 rounded-full z-10">
                -27% off
              </span>

              {/* Product image */}
              <Image
                src="/assets/images/cart1.png"
                alt="product image"
                width={300}
                height={300}
                className="max-w-[70%] max-h-[70%] object-contain"
                priority
              />
            </div>
            <div className="flex justify-between items-start gap-5">
              {/* product information  */}
              <div>
                <h1 className="font-bold text-sm mt-4">A-fenac 50</h1>

                <div className="flex items-center gap-1">
                  {/* originalPrice  */}
                  <div className=" flex items-center text-xl font-bold text-black">
                    <TbCurrencyTaka />
                    <sub>1250</sub>
                  </div>

                  {/* discountPercent  */}
                  <sub className=" flex items-center text-xl text-gray-500">
                    <TbCurrencyTaka />
                    <sub>
                      <del>1900.99</del>
                    </sub>
                  </sub>
                </div>
                <div className="flex gap-2 items-center mt-2">
                  <p className="text-sm text-black/50">10 Tablets (1 Strip)</p>
                </div>

                <div className="flex items-center">
                  <p>Quantity:</p>
                  <button className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-gray-100 shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50">
                    <FiMinus size={20} />
                  </button>
                  <button className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-gray-100 shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50">
                    2
                  </button>
                  <button className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-gray-100 shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50">
                    <FiPlus size={20} />
                  </button>
                </div>
              </div>
              {/* delete button */}
              <div className="flex items-center justify-between mt-5">
                <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-full border border-gray-100 shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50">
                  <RiDeleteBinLine />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-[45%]"></div>
      </div>
    </div>
  );
};

export default Cart;
